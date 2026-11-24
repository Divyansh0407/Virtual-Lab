import assert from 'assert';

// Standalone verification script for SessionManager logic
console.log('=== VirtualLab SessionManager Logic & Concurrency Test ===\n');

// 1. Test Date Comparison Coercion Fix
console.log('Test 1: Numeric timestamp vs ISO string comparison');
const now = Date.now();
const expiresAtIso = new Date(now + 1800000).toISOString();
const expiresAtMs = now + 1800000;

// Old buggy check
const oldCheck = now < expiresAtIso;
assert.strictEqual(oldCheck, false, 'Old check evaluates to false due to NaN coercion');

// Fixed check
const fixedCheck = now < expiresAtMs;
assert.strictEqual(fixedCheck, true, 'Fixed numeric check evaluates to true');
console.log('  ✓ Timestamp comparison correctly validates unexpired sessions\n');

// 2. Mock Dockerode for unit testing
const mockDockerContainers = new Map();

const mockDocker = {
  createContainer: async (opts) => {
    await new Promise(r => setTimeout(r, 50));
    const id = 'mock_cont_' + Math.random().toString(36).substring(2, 10);
    const container = {
      id,
      opts,
      start: async () => {},
      remove: async () => {
        mockDockerContainers.delete(id);
      }
    };
    mockDockerContainers.set(id, {
      Id: id,
      Names: ['/' + opts.name],
      State: 'running',
      Created: Math.floor(Date.now() / 1000),
      Labels: opts.Labels
    });
    return container;
  },
  getContainer: (id) => ({
    id,
    remove: async () => {
      mockDockerContainers.delete(id);
    },
    exec: async (opts) => ({
      start: async () => {
        const { Readable } = await import('stream');
        return Readable.from([Buffer.from('echo "final test command before teardown"\n')]);
      }
    })
  }),
  listContainers: async () => {
    return Array.from(mockDockerContainers.values());
  }
};

// 3. Import and test SessionManager with Mock Docker & Isolated DynamoDB
import { sessionManager } from '../src/sessionManager.js';
import { docker } from '../src/docker.js';
import { dynamoDBService } from '../src/services/dynamoDBService.js';
Object.assign(docker, mockDocker);

// Isolate DynamoDB: Guarantee that automated tests never touch real AWS DynamoDB table
const capturedDynamoEvents = [];
dynamoDBService.docClient = {
  send: async (cmd) => {
    if (cmd && cmd.input && cmd.input.Item) {
      capturedDynamoEvents.push(cmd.input.Item);
    }
    return {};
  }
};
dynamoDBService.connected = true;

async function runTests() {
  console.log('Test 2: Initial activeCount must be 0');
  assert.strictEqual(sessionManager.getActiveCount(), 0);
  console.log('  ✓ activeCount is 0\n');

  console.log('Test 3: Launch student 1 lab -> activeCount must become 1');
  const sess1 = await sessionManager.launchLabSession({
    studentId: 'student-1',
    studentName: 'Alice',
    labId: 'lab-linux-perm'
  });
  assert.strictEqual(sessionManager.getActiveCount(), 1);
  assert.strictEqual(sessionManager.getSessionByStudent('student-1')?.id, sess1.id);
  console.log(`  ✓ Student 1 launched. activeCount: ${sessionManager.getActiveCount()}`);
  console.log(`  ✓ Docker containers running: ${mockDockerContainers.size}\n`);

  console.log('Test 4: Attempt second lab for student 1 -> MUST BE REJECTED');
  try {
    await sessionManager.launchLabSession({
      studentId: 'student-1',
      studentName: 'Alice',
      labId: 'lab-linux-perm'
    });
    assert.fail('Should have rejected second lab for student 1');
  } catch (err) {
    assert.strictEqual(err.code, 'STUDENT_LIMIT_EXCEEDED');
    assert.strictEqual(sessionManager.getActiveCount(), 1);
    assert.strictEqual(mockDockerContainers.size, 1);
    console.log(`  ✓ Rejected with: ${err.message}`);
    console.log(`  ✓ No duplicate container created (Docker count still: ${mockDockerContainers.size})\n`);
  }

  console.log('Test 5: Launch student 2 lab -> activeCount must become 2');
  const sess2 = await sessionManager.launchLabSession({
    studentId: 'student-2',
    studentName: 'Bob',
    labId: 'lab-linux-perm'
  });
  assert.strictEqual(sessionManager.getActiveCount(), 2);
  assert.strictEqual(mockDockerContainers.size, 2);
  console.log(`  ✓ Student 2 launched. activeCount: ${sessionManager.getActiveCount()}`);
  console.log(`  ✓ Docker containers running: ${mockDockerContainers.size}\n`);

  console.log('Test 6: Attempt third lab (student 3) -> MUST BE REJECTED (Global capacity = 2)');
  try {
    await sessionManager.launchLabSession({
      studentId: 'student-3',
      studentName: 'Charlie',
      labId: 'lab-linux-perm'
    });
    assert.fail('Should have rejected third lab due to global capacity');
  } catch (err) {
    assert.strictEqual(err.code, 'GLOBAL_CAPACITY_EXCEEDED');
    assert.strictEqual(sessionManager.getActiveCount(), 2);
    assert.strictEqual(mockDockerContainers.size, 2);
    console.log(`  ✓ Rejected with: ${err.message}`);
    console.log(`  ✓ Global limit strictly enforced at ${sessionManager.getActiveCount()} labs\n`);
  }

  console.log('Test 7: Stop student 1 lab -> activeCount must become 1');
  await sessionManager.stopSession(sess1.id, 'Student 1 completed lab');
  assert.strictEqual(sessionManager.getActiveCount(), 1);
  assert.strictEqual(mockDockerContainers.size, 1);
  assert.strictEqual(sessionManager.getSessionByStudent('student-1'), null);
  console.log(`  ✓ Student 1 stopped. activeCount: ${sessionManager.getActiveCount()}`);
  console.log(`  ✓ Docker container count: ${mockDockerContainers.size}\n`);

  console.log('Test 8: Student 3 can now launch because capacity was freed');
  const sess3 = await sessionManager.launchLabSession({
    studentId: 'student-3',
    studentName: 'Charlie',
    labId: 'lab-linux-perm'
  });
  assert.strictEqual(sessionManager.getActiveCount(), 2);
  assert.strictEqual(mockDockerContainers.size, 2);
  console.log(`  ✓ Student 3 launched. activeCount: ${sessionManager.getActiveCount()}\n`);

  console.log('Test 9: Stop remaining labs -> activeCount must become 0');
  await sessionManager.stopSession(sess2.id);
  await sessionManager.stopSession(sess3.id);
  assert.strictEqual(sessionManager.getActiveCount(), 0);
  assert.strictEqual(mockDockerContainers.size, 0);
  console.log(`  ✓ All labs stopped. activeCount: ${sessionManager.getActiveCount()}`);
  console.log(`  ✓ Docker container count: ${mockDockerContainers.size}\n`);

  console.log('Test 10: Automatic reconciliation of duplicate/stale containers');
  // Inject 3 simulated stale containers with duplicate student
  mockDockerContainers.set('c1', {
    Id: 'c1',
    Names: ['/vl-lab-dup1'],
    State: 'running',
    Created: 1000,
    Labels: {
      'virtuallab.managed': 'true',
      'virtuallab.sessionId': 'sess_dup1',
      'virtuallab.studentId': 'student-dup',
      'virtuallab.expiresAt': new Date(Date.now() + 1800000).toISOString()
    }
  });
  mockDockerContainers.set('c2', {
    Id: 'c2',
    Names: ['/vl-lab-dup2'],
    State: 'running',
    Created: 2000,
    Labels: {
      'virtuallab.managed': 'true',
      'virtuallab.sessionId': 'sess_dup2',
      'virtuallab.studentId': 'student-dup',
      'virtuallab.expiresAt': new Date(Date.now() + 1800000).toISOString()
    }
  });
  mockDockerContainers.set('c3_expired', {
    Id: 'c3_expired',
    Names: ['/vl-lab-expired'],
    State: 'running',
    Created: 500,
    Labels: {
      'virtuallab.managed': 'true',
      'virtuallab.sessionId': 'sess_expired',
      'virtuallab.studentId': 'student-old',
      'virtuallab.expiresAt': new Date(Date.now() - 60000).toISOString() // Expired!
    }
  });

  assert.strictEqual(mockDockerContainers.size, 3);
  await sessionManager.reconcileWithDocker();
  // c3_expired removed because expired
  // c2 removed because student-dup already has c1
  // c1 preserved and reconciled into this.sessions
  assert.strictEqual(sessionManager.getActiveCount(), 1);
  assert.strictEqual(mockDockerContainers.size, 1);
  console.log('  ✓ Reconcile pruned duplicate and expired containers');
  console.log(`  ✓ Exactly 1 valid session preserved. activeCount: ${sessionManager.getActiveCount()}\n`);

  // Clean up
  await sessionManager.stopSession('sess_dup1');
  assert.strictEqual(sessionManager.getActiveCount(), 0);

  console.log('Test 11: In-flight concurrent launch lock prevention');
  const launchPromise1 = sessionManager.launchLabSession({
    studentId: 'concurrent-student',
    studentName: 'Dave',
    labId: 'lab-linux-perm'
  });
  // Rapid second click while first is launching
  try {
    await sessionManager.launchLabSession({
      studentId: 'concurrent-student',
      studentName: 'Dave',
      labId: 'lab-linux-perm'
    });
    assert.fail('Should reject in-flight second click');
  } catch (err) {
    assert.strictEqual(err.code, 'LAUNCH_IN_PROGRESS');
    console.log(`  ✓ Rapid duplicate click rejected: ${err.message}`);
  }
  const completedSession = await launchPromise1;
  assert.strictEqual(sessionManager.getActiveCount(), 1);
  await sessionManager.stopSession(completedSession.id);
  assert.strictEqual(sessionManager.getActiveCount(), 0);
  console.log('  ✓ In-flight concurrency lock verified\n');

  console.log('Test 12: Final command collection before container deletion & DynamoDB test isolation');
  const sessPreTeardown = await sessionManager.launchLabSession({
    studentId: 'student-teardown',
    studentName: 'Eve',
    labId: 'lab-linux-perm'
  });
  const eventCountBefore = capturedDynamoEvents.length;
  await sessionManager.stopSession(sessPreTeardown.id, 'Teardown test verification');
  const eventsAfter = capturedDynamoEvents.slice(eventCountBefore);

  const finalCmdEvent = eventsAfter.find(e => e.command === 'echo "final test command before teardown"');
  const stoppedEvent = eventsAfter.find(e => e.eventType === 'LAB_STOPPED');

  assert.ok(finalCmdEvent, 'Final command from /tmp/.vl_history must be collected before container removal');
  assert.ok(stoppedEvent, 'LAB_STOPPED event must be logged');
  assert.strictEqual(finalCmdEvent.sessionId, sessPreTeardown.id);
  console.log('  ✓ Final commands successfully extracted from container prior to deletion');
  console.log('  ✓ Mock test events strictly captured in-memory and isolated from real DynamoDB table\n');

  console.log('========================================================');
  console.log('  ALL ACCEPTANCE CRITERIA TESTS PASSED SUCCESSFULLY!    ');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
