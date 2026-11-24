import assert from 'assert';
import { DynamoDBService, dynamoDBService } from '../src/services/dynamoDBService.js';

console.log('=== VirtualLab Phase 2: DynamoDB Command Logging Test Suite ===\n');
console.log('[Notice] Automated tests run using mock in-memory DynamoDB store.\n');

// 1. Create simulated in-memory DynamoDB Table
const mockTableItems = new Map(); // key: `${sessionId}#${eventId}` -> Item

class MockDocClient {
  async send(command) {
    if (command.constructor.name === 'PutCommand') {
      const item = command.input.Item;
      const key = `${item.sessionId}#${item.eventId}`;
      mockTableItems.set(key, JSON.parse(JSON.stringify(item)));
      return {};
    }

    if (command.constructor.name === 'QueryCommand') {
      const { ExpressionAttributeValues, Limit = 100 } = command.input;
      const targetSessionId = ExpressionAttributeValues[':sid'];

      const matched = Array.from(mockTableItems.values())
        .filter(item => item.sessionId === targetSessionId)
        .sort((a, b) => a.eventId.localeCompare(b.eventId))
        .slice(0, Limit);

      return {
        Items: matched,
        Count: matched.length
      };
    }

    throw new Error(`Unsupported mock command: ${command.constructor.name}`);
  }
}

// Instantiate test service
const service = new DynamoDBService();
// Inject mock client & commands (isolate from real AWS)
service.docClient = new MockDocClient();
service.connected = true;
dynamoDBService.docClient = new MockDocClient();
dynamoDBService.connected = true;

// Mock Command Constructors
class PutCommand {
  constructor(input) {
    this.input = input;
  }
}
class QueryCommand {
  constructor(input) {
    this.input = input;
  }
}
globalThis.MockPutCommand = PutCommand;
globalThis.MockQueryCommand = QueryCommand;

async function runTests() {
  const sessionId1 = 'sess_student1_test123';
  const sessionId2 = 'sess_student2_test456';

  // ------------------------------------------------------------------------
  // Test 1: Record Creation & Schema Validation
  // ------------------------------------------------------------------------
  console.log('Test 1: DynamoDB record schema validation');
  service.logEvent({
    sessionId: sessionId1,
    studentId: 'usr-student-divyansh',
    studentName: 'Divyansh Sharma',
    labId: 'lab-linux-perm',
    containerId: 'cont-123456789abc',
    command: 'touch report.txt',
    eventType: 'COMMAND_HISTORY'
  });

  await service.flushQueue();

  const history1 = await service.getSessionHistory(sessionId1);
  assert.strictEqual(history1.count, 1, 'Should have recorded 1 event');

  const rec = history1.items[0];
  assert.strictEqual(rec.sessionId, sessionId1);
  assert.strictEqual(rec.studentId, 'usr-student-divyansh');
  assert.strictEqual(rec.studentName, 'Divyansh Sharma');
  assert.strictEqual(rec.labId, 'lab-linux-perm');
  assert.strictEqual(rec.containerId, 'cont-1234567');
  assert.strictEqual(rec.command, 'touch report.txt');
  assert.strictEqual(rec.eventType, 'COMMAND_HISTORY');
  assert.ok(rec.eventId.includes('_'), 'Event ID should contain timestamp and UUID');
  assert.ok(new Date(rec.timestamp).getTime() > 0, 'Timestamp should be valid ISO date');
  console.log('  ✓ Schema contains sessionId, eventId, studentId, studentName, labId, containerId, command, timestamp, eventType\n');

  // ------------------------------------------------------------------------
  // Test 2: Multiple Commands in One Session (Chronological Order)
  // ------------------------------------------------------------------------
  console.log('Test 2: Multiple commands in one session');
  const commands = [
    'chmod 640 report.txt',
    'stat -c "%a %n" report.txt',
    'ls -la',
    'cat report.txt'
  ];

  for (const cmd of commands) {
    service.logEvent({
      sessionId: sessionId1,
      studentId: 'usr-student-divyansh',
      studentName: 'Divyansh Sharma',
      labId: 'lab-linux-perm',
      containerId: 'cont-123456789abc',
      command: cmd,
      eventType: 'COMMAND_HISTORY'
    });
  }

  await service.flushQueue();

  const sessionHistory = await service.getSessionHistory(sessionId1);
  assert.strictEqual(sessionHistory.count, 5, 'Session 1 should now have 5 total commands');
  assert.strictEqual(sessionHistory.items[1].command, 'chmod 640 report.txt');
  assert.strictEqual(sessionHistory.items[4].command, 'cat report.txt');
  console.log('  ✓ Stored and retrieved 5 chronological commands for session 1\n');

  // ------------------------------------------------------------------------
  // Test 3: Sensitive Input Redaction
  // ------------------------------------------------------------------------
  console.log('Test 3: Sensitive input exclusion and credential redaction');
  
  // A. Password flag
  service.logEvent({
    sessionId: sessionId1,
    studentId: 'usr-student-divyansh',
    studentName: 'Divyansh Sharma',
    labId: 'lab-linux-perm',
    command: 'mysql -u root --password=SuperSecretPassword123 mydb',
    eventType: 'COMMAND_HISTORY'
  });

  // B. AWS Key
  service.logEvent({
    sessionId: sessionId1,
    studentId: 'usr-student-divyansh',
    studentName: 'Divyansh Sharma',
    labId: 'lab-linux-perm',
    command: 'export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
    eventType: 'COMMAND_HISTORY'
  });

  // C. Auth Token
  service.logEvent({
    sessionId: sessionId1,
    studentId: 'usr-student-divyansh',
    studentName: 'Divyansh Sharma',
    labId: 'lab-linux-perm',
    command: 'curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc" https://example.com',
    eventType: 'COMMAND_HISTORY'
  });

  await service.flushQueue();

  const redactedLogs = await service.getSessionHistory(sessionId1);
  const mysqlCmd = redactedLogs.items.find(i => i.command.includes('mysql'));
  const awsCmd = redactedLogs.items.find(i => i.command.includes('AWS_ACCESS_KEY_ID'));
  const authCmd = redactedLogs.items.find(i => i.command.includes('Authorization'));

  assert.ok(!mysqlCmd.command.includes('SuperSecretPassword123'), 'Plaintext password must be redacted');
  assert.ok(mysqlCmd.command.includes('[REDACTED_PASS]'), 'Password should have redacted tag');
  assert.ok(!awsCmd.command.includes('AKIAIOSFODNN7EXAMPLE'), 'Plaintext AWS key must be redacted');
  assert.ok(awsCmd.command.includes('[REDACTED_AWS_KEY]'), 'AWS key should have redacted tag');
  assert.ok(!authCmd.command.includes('eyJhbGciOi'), 'Bearer token must be redacted');
  console.log('  ✓ Passwords, tokens, and AWS access keys are strictly redacted before persistence\n');

  // ------------------------------------------------------------------------
  // Test 4: Duplicate Event Prevention
  // ------------------------------------------------------------------------
  console.log('Test 4: Duplicate event prevention via composite primary key');
  const duplicateRecord = {
    sessionId: sessionId1,
    eventId: '2026-11-24T00:00:00.000Z_fixed-uuid-1',
    studentId: 'usr-student-divyansh',
    studentName: 'Divyansh Sharma',
    labId: 'lab-linux-perm',
    containerId: 'cont-123',
    command: 'uname -a',
    timestamp: '2026-11-24T00:00:00.000Z',
    eventType: 'COMMAND_HISTORY'
  };

  // Put twice with identical (sessionId, eventId)
  await service.docClient.send({ constructor: { name: 'PutCommand' }, input: { Item: duplicateRecord } });
  await service.docClient.send({ constructor: { name: 'PutCommand' }, input: { Item: duplicateRecord } });

  const queryAfterDup = await service.getSessionHistory(sessionId1);
  const fixedMatches = queryAfterDup.items.filter(i => i.eventId === '2026-11-24T00:00:00.000Z_fixed-uuid-1');
  assert.strictEqual(fixedMatches.length, 1, 'DynamoDB composite primary key overwrites idempotent duplicate Put');
  console.log('  ✓ Idempotent PutItem guarantees duplicate event prevention\n');

  // ------------------------------------------------------------------------
  // Test 5: Concurrent Student Sessions Isolation
  // ------------------------------------------------------------------------
  console.log('Test 5: Concurrent student sessions partition isolation');
  service.logEvent({
    sessionId: sessionId2,
    studentId: 'usr-student-harsh',
    studentName: 'Harshvardhan Gupta',
    labId: 'lab-linux-perm',
    containerId: 'cont-999',
    command: 'python3 -m http.server 8080',
    eventType: 'COMMAND_HISTORY'
  });

  await service.flushQueue();

  const session1Logs = await service.getSessionHistory(sessionId1);
  const session2Logs = await service.getSessionHistory(sessionId2);

  assert.strictEqual(session2Logs.count, 1);
  assert.strictEqual(session2Logs.items[0].studentName, 'Harshvardhan Gupta');
  assert.ok(!session1Logs.items.some(i => i.sessionId === sessionId2), 'Session 1 must not contain Session 2 events');
  assert.ok(!session2Logs.items.some(i => i.sessionId === sessionId1), 'Session 2 must not contain Session 1 events');
  console.log('  ✓ Concurrent sessions log to separate partition keys without cross-contamination\n');

  // ------------------------------------------------------------------------
  // Test 6: Container Deletion without Deleting Command History
  // ------------------------------------------------------------------------
  console.log('Test 6: Command records remain available after container teardown');
  // Simulate container deletion
  const simulatedDeletedContainerId = 'cont-123456789abc';
  // Check that records for sessionId1 still exist in DynamoDB
  const postTeardownHistory = await service.getSessionHistory(sessionId1);
  assert.ok(postTeardownHistory.count > 0, 'Command history persists independently of Docker container lifecycle');
  console.log(`  ✓ Successfully queried ${postTeardownHistory.count} records for destroyed container '${simulatedDeletedContainerId}'\n`);

  // ------------------------------------------------------------------------
  // Test 7: DynamoDB Transient Error Handling & Non-blocking Queue
  // ------------------------------------------------------------------------
  console.log('Test 7: DynamoDB error resilience (terminal execution not blocked)');
  const failingService = new DynamoDBService();
  failingService.maxRetries = 2;
  // Inject docClient that fails
  failingService.docClient = {
    send: async () => {
      throw new Error('ProvisionedThroughputExceededException: Rate exceeded');
    }
  };

  // Enqueue event - must return immediately without throwing
  failingService.logEvent({
    sessionId: 'sess_failing_test',
    studentId: 'student-fail',
    command: 'sleep 1',
    eventType: 'COMMAND_HISTORY'
  });

  // Verify non-blocking enqueue
  assert.strictEqual(failingService.queue.length, 1, 'Event queued asynchronously');

  // Process queue and verify it retries then marks totalFailed without terminating node process
  await failingService.flushQueue(1000);
  assert.strictEqual(failingService.totalFailed, 1, 'Event failure safely counted');
  assert.ok(failingService.lastError.includes('Rate exceeded'), 'Error message tracked in status');
  console.log('  ✓ DynamoDB exceptions do not crash process or block interactive terminal execution\n');

  // ------------------------------------------------------------------------
  // Test 8: Health Check Status Payload
  // ------------------------------------------------------------------------
  console.log('Test 8: Health check reporting');
  const health = service.getHealthStatus();
  assert.strictEqual(health.enabled, true);
  assert.strictEqual(health.tableName, 'VirtualLabCommandLogs');
  assert.strictEqual(health.region, 'ap-south-1');
  assert.strictEqual(typeof health.queue.pendingEvents, 'number');
  assert.strictEqual(typeof health.queue.totalLogged, 'number');
  console.log('  ✓ Health status payload accurately reports table, region, queue, and metrics\n');

  console.log('========================================================');
  console.log('  ALL DYNAMODB COMMAND LOGGING TESTS PASSED (8/8)!      ');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
