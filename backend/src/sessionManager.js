import crypto from 'crypto';
import { docker } from './docker.js';
import { dynamoDBService } from './services/dynamoDBService.js';
import { config } from './config.js';

class SessionManager {
  constructor() {
    /** @type {Map<string, Object>} sessionId -> Session */
    this.sessions = new Map();
    /** @type {Map<string, { sessionId: string, studentId: string, expiresAt: number }>} ticket -> TicketInfo */
    this.tickets = new Map();
    /** Set of student IDs with a launch currently in-flight */
    this.pendingLaunches = new Set();
    /** Mutex lock flag to prevent concurrent race conditions during launch */
    this.launchLock = false;
    /** Reaper interval handle */
    this.reaperInterval = null;
  }

  /**
   * Acquire mutex lock with timeout to prevent concurrent launch races.
   */
  async acquireLock(timeoutMs = 8000) {
    const start = Date.now();
    while (this.launchLock) {
      if (Date.now() - start > timeoutMs) {
        throw new Error('Server busy: unable to acquire launch lock. Please retry.');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    this.launchLock = true;
  }

  releaseLock() {
    this.launchLock = false;
  }

  /**
   * Helper to check if a session is currently active and unexpired.
   * Compares numeric millisecond timestamps to avoid NaN coercion bugs.
   */
  isSessionActive(session, now = Date.now()) {
    if (!session) return false;
    if (session.state !== 'running') return false;
    const expMs = typeof session.expiresAtMs === 'number'
      ? session.expiresAtMs
      : (session.expiresAt ? new Date(session.expiresAt).getTime() : NaN);

    return !isNaN(expMs) && now < expMs;
  }

  /**
   * Generates a secure, short-lived session ticket for WebSocket authorization.
   */
  createTicket(sessionId, studentId) {
    const ticket = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + config.ticketTtlMs;
    this.tickets.set(ticket, { sessionId, studentId: String(studentId), expiresAt });
    return ticket;
  }

  /**
   * Validates a ticket presented by a WebSocket connection.
   */
  validateTicket(sessionId, ticket) {
    if (!ticket) return null;
    const ticketInfo = this.tickets.get(ticket);
    if (!ticketInfo) return null;

    if (Date.now() > ticketInfo.expiresAt) {
      this.tickets.delete(ticket);
      return null;
    }

    if (ticketInfo.sessionId !== sessionId) {
      return null;
    }

    return ticketInfo;
  }

  /**
   * Get an active session by its ID. Returns null if expired or missing.
   */
  getSession(sessionId) {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (!this.isSessionActive(session)) {
      return null;
    }
    return session;
  }

  /**
   * Get an active session for a specific student.
   */
  getSessionByStudent(studentId) {
    if (!studentId) return null;
    const sId = String(studentId);
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (session.studentId === sId && this.isSessionActive(session, now)) {
        return session;
      }
    }
    return null;
  }

  /**
   * Get count of globally running active sessions.
   */
  getActiveCount() {
    let count = 0;
    const now = Date.now();
    for (const session of this.sessions.values()) {
      if (this.isSessionActive(session, now)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get list of all currently active sessions.
   */
  getActiveSessions() {
    const now = Date.now();
    const active = [];
    for (const session of this.sessions.values()) {
      if (this.isSessionActive(session, now)) {
        active.push(session);
      }
    }
    return active;
  }

  /**
   * Launches a new student container with strict security policies and isolation.
   */
  async launchLabSession({ studentId, studentName, labId }) {
    const sId = String(studentId);
    const sName = String(studentName || 'Student');

    // Fast-fail if a launch is already in-progress for this student
    if (this.pendingLaunches.has(sId)) {
      const error = new Error(`A container launch is already in progress for ${sName} (${sId}). Please wait for it to complete.`);
      error.statusCode = 409;
      error.code = 'LAUNCH_IN_PROGRESS';
      throw error;
    }

    this.pendingLaunches.add(sId);

    try {
      await this.acquireLock();

      // 1. Verify student limit: Maximum 1 active lab per student
      const existingStudentSession = this.getSessionByStudent(sId);
      if (existingStudentSession) {
        console.warn(`[SessionManager] Launch rejected: Student ${sName} (${sId}) already has active session ${existingStudentSession.id}`);
        const error = new Error(`Student ${sName} (${sId}) already has an active lab session (${existingStudentSession.id}). Maximum 1 active lab per student.`);
        error.statusCode = 409;
        error.code = 'STUDENT_LIMIT_EXCEEDED';
        error.activeSessionId = existingStudentSession.id;
        throw error;
      }

      // 2. Verify global concurrency limit: Maximum 2 concurrent labs globally
      const activeCount = this.getActiveCount();
      if (activeCount >= config.maxGlobalConcurrentLabs) {
        console.warn(`[SessionManager] Launch rejected: Global capacity reached (${activeCount}/${config.maxGlobalConcurrentLabs})`);
        const error = new Error(`Maximum global concurrent lab limit reached (${activeCount}/${config.maxGlobalConcurrentLabs}). Please wait for an active container to complete.`);
        error.statusCode = 409;
        error.code = 'GLOBAL_CAPACITY_EXCEEDED';
        throw error;
      }

      // 3. Prepare unique session and container identifiers
      const cleanStudentTag = sId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 12) || 'student';
      const uniqueSuffix = crypto.randomBytes(4).toString('hex');
      const sessionId = `sess_${cleanStudentTag}_${Date.now()}_${uniqueSuffix}`;
      const containerName = `vl-lab-${cleanStudentTag}-${uniqueSuffix}`;
      const now = Date.now();
      const expiresAtMs = now + config.sessionDurationMs;
      const startedAtIso = new Date(now).toISOString();
      const expiresAtIso = new Date(expiresAtMs).toISOString();

      // 4. Create hardened Docker container via Dockerode
      const containerConfig = {
        Image: config.labDockerImage,
        name: containerName,
        User: 'student',
        WorkingDir: '/home/student',
        Cmd: ['sleep', 'infinity'],
        Labels: {
          'virtuallab.managed': 'true',
          'virtuallab.sessionId': sessionId,
          'virtuallab.studentId': sId,
          'virtuallab.studentName': sName,
          'virtuallab.labId': String(labId),
          'virtuallab.createdAt': startedAtIso,
          'virtuallab.expiresAt': expiresAtIso
        },
        HostConfig: {
          // Hardware limits
          Memory: config.memoryLimitBytes,           // 128 MB
          MemorySwap: config.memoryLimitBytes,       // Disable extra swap
          NanoCpus: config.nanoCpus,                 // 0.25 vCPU
          PidsLimit: config.pidsLimit,               // Max 64 processes

          // Network isolation
          NetworkMode: 'none',                       // Complete network detachment

          // Linux security constraints
          CapDrop: ['ALL'],                          // Drop all Linux capabilities
          SecurityOpt: ['no-new-privileges:true'],   // Prevent privilege escalation
          Privileged: false,                         // Never allow privileged execution

          // Filesystem constraints
          ReadonlyRootfs: false,                     // Container root
          Tmpfs: {
            '/tmp': 'rw,nosuid,size=32m',
            '/run': 'rw,nosuid,size=16m'
          },
          Binds: []                                  // Strictly no host mounts or Docker socket exposure
        }
      };

      console.log(`[SessionManager] Provisioning container ${containerName} for student ${sName} (${sId})...`);
      const container = await docker.createContainer(containerConfig);

      // 5. Start the container
      await container.start();
      console.log(`[SessionManager] Container ${containerName} (ID: ${container.id.slice(0, 12)}) started.`);

      // 6. Generate connection ticket
      const ticket = this.createTicket(sessionId, sId);

      // 7. Store session in manager with both ISO strings and numeric timestamps
      const session = {
        id: sessionId,
        studentId: sId,
        studentName: sName,
        labId,
        containerId: container.id,
        containerName,
        state: 'running',
        startedAt: startedAtIso,
        expiresAt: expiresAtIso,
        startedAtMs: now,
        expiresAtMs: expiresAtMs,
        durationMinutes: config.sessionDurationMinutes,
        ticket,
        wsClients: new Set()
      };

      this.sessions.set(sessionId, session);
      console.log(`[SessionManager] Registered session '${sessionId}'. Active sessions: ${this.getActiveCount()}/${config.maxGlobalConcurrentLabs}`);

      // 8. Log session lifecycle event to DynamoDB
      dynamoDBService.logEvent({
        sessionId: session.id,
        studentId: session.studentId,
        studentName: session.studentName,
        labId: session.labId,
        containerId: session.containerId,
        command: `Lab session started: container ${containerName} provisioned on EC2`,
        eventType: 'LAB_STARTED'
      });

      return session;

    } finally {
      this.pendingLaunches.delete(sId);
      this.releaseLock();
    }
  }

  /**
   * Stops and completely destroys a managed container and closes associated sockets.
   */
  async stopSession(sessionId, reason = 'User requested stop') {
    if (!sessionId) return false;

    // Check in-memory store
    const session = this.sessions.get(sessionId);

    if (!session) {
      console.log(`[SessionManager] Session ${sessionId} not in memory. Checking Docker for container cleanup...`);
      // Attempt Docker cleanup by label or container name
      await this.cleanupOrphanContainerBySessionId(sessionId);
      return false;
    }

    console.log(`[SessionManager] Stopping session ${sessionId} (${reason})...`);
    session.state = 'stopping';

    // Log session stop lifecycle event before tearing down resources
    dynamoDBService.logEvent({
      sessionId: session.id,
      studentId: session.studentId,
      studentName: session.studentName,
      labId: session.labId,
      containerId: session.containerId,
      command: `Lab session stopped: ${reason}`,
      eventType: 'LAB_STOPPED'
    });

    // 1. Close attached WebSockets
    for (const ws of session.wsClients) {
      try {
        ws.send(JSON.stringify({ type: 'session_closed', reason }));
        ws.close(1000, reason);
      } catch (e) {
        // Ignore close errors
      }
    }
    session.wsClients.clear();

    // 2. Stop decoupled history tail stream if active
    if (session.tailStream) {
      try {
        session.tailStream.removeAllListeners();
        session.tailStream.destroy();
      } catch (e) {
        // Ignore stream teardown errors
      }
      session.tailStream = null;
    }

    // 3. Collect final residual command history directly from container before deletion
    try {
      const container = docker.getContainer(session.containerId);
      if (container && typeof container.exec === 'function') {
        const catExec = await container.exec({
          Cmd: ['cat', '/tmp/.vl_history'],
          AttachStdout: true,
          AttachStderr: false,
          User: 'student'
        });
        const catStream = await catExec.start({ hijack: true, stdin: false });
        let rawHistory = '';
        await new Promise((resolve) => {
          catStream.on('data', (chunk) => {
            rawHistory += chunk.toString('utf8');
          });
          catStream.on('end', resolve);
          catStream.on('error', resolve);
          setTimeout(resolve, 500); // Guard safety timeout
        });

        if (rawHistory) {
          const lines = rawHistory.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed) {
              dynamoDBService.logEvent({
                sessionId: session.id,
                studentId: session.studentId,
                studentName: session.studentName,
                labId: session.labId,
                containerId: session.containerId,
                command: trimmed,
                eventType: 'COMMAND_HISTORY'
              });
            }
          }
        }
      }
    } catch (collectErr) {
      // Non-fatal if container was already killed or inaccessible
    }

    // 4. Flush any pending DynamoDB log records before container deletion
    try {
      await dynamoDBService.flushQueue(2000);
    } catch (e) {
      console.warn(`[SessionManager] DynamoDB queue flush warning: ${e.message}`);
    }

    // 5. Stop and remove Docker container
    try {
      const container = docker.getContainer(session.containerId);
      await container.remove({ force: true });
      console.log(`[SessionManager] Container ${session.containerName} (${session.containerId.slice(0, 12)}) destroyed.`);
    } catch (err) {
      console.warn(`[SessionManager] Container removal warning for ${session.containerId}: ${err.message}`);
    }

    // 3. Mark state stopped and remove session from memory
    session.state = 'stopped';
    this.sessions.delete(sessionId);
    console.log(`[SessionManager] Session ${sessionId} terminated. Active sessions remaining: ${this.getActiveCount()}/${config.maxGlobalConcurrentLabs}`);
    return true;
  }

  /**
   * Cleans up an orphaned container directly in Docker by sessionId label.
   */
  async cleanupOrphanContainerBySessionId(sessionId) {
    try {
      const containers = await docker.listContainers({ all: true });
      for (const info of containers) {
        if (info.Labels && info.Labels['virtuallab.sessionId'] === sessionId) {
          console.log(`[SessionManager] Removing orphaned Docker container ${info.Names?.[0] || info.Id.slice(0, 12)} for session ${sessionId}...`);
          const c = docker.getContainer(info.Id);
          await c.remove({ force: true });
        }
      }
    } catch (err) {
      console.warn(`[SessionManager] Error checking orphan container: ${err.message}`);
    }
  }

  /**
   * Reconciles in-memory sessions with actual Docker containers bearing 'virtuallab.managed=true'.
   * - Restores live valid containers to the session store across restarts.
   * - Purges dead, stopped, expired, or excess duplicate containers.
   */
  async reconcileWithDocker() {
    try {
      console.log('[SessionManager] Reconciling session state with Docker Engine containers...');
      const allContainers = await docker.listContainers({ all: true });
      const managed = allContainers.filter(c => c.Labels && c.Labels['virtuallab.managed'] === 'true');
      const now = Date.now();
      const liveContainerIds = new Set(managed.map(c => c.Id));

      // 1. Purge memory sessions whose containers no longer exist in Docker
      for (const [sessionId, session] of this.sessions.entries()) {
        if (!liveContainerIds.has(session.containerId)) {
          console.log(`[SessionManager] Container for session ${sessionId} is gone from Docker. Pruning session.`);
          this.sessions.delete(sessionId);
        }
      }

      // Map to track 1 active container per student during reconciliation
      const seenStudents = new Map();

      // Sort managed containers oldest first (Created ascending)
      managed.sort((a, b) => (a.Created || 0) - (b.Created || 0));

      for (const c of managed) {
        const labels = c.Labels || {};
        const sessionId = labels['virtuallab.sessionId'];
        const studentId = labels['virtuallab.studentId'];
        const studentName = labels['virtuallab.studentName'] || 'Student';
        const labId = labels['virtuallab.labId'] || 'lab-linux-perm';
        const createdAtIso = labels['virtuallab.createdAt'] || new Date((c.Created || 0) * 1000).toISOString();
        const expiresAtIso = labels['virtuallab.expiresAt'];
        const expiresAtMs = expiresAtIso
          ? new Date(expiresAtIso).getTime()
          : ((c.Created || 0) * 1000 + config.sessionDurationMs);

        const isRunning = c.State === 'running';
        const isExpired = isNaN(expiresAtMs) || now >= expiresAtMs;

        // Condition A: Container is not running or is expired -> destroy
        if (!isRunning || isExpired) {
          console.log(`[SessionManager] Purging inactive/expired container ${c.Names?.[0] || c.Id.slice(0, 12)} (State: ${c.State}, Expired: ${isExpired})`);
          try {
            const contObj = docker.getContainer(c.Id);
            await contObj.remove({ force: true });
          } catch (e) {
            console.warn(`[SessionManager] Failed to remove container ${c.Id.slice(0, 12)}: ${e.message}`);
          }
          if (sessionId) this.sessions.delete(sessionId);
          continue;
        }

        // Condition B: Duplicate container for the same student -> destroy excess
        if (studentId && seenStudents.has(studentId)) {
          console.log(`[SessionManager] Purging duplicate container ${c.Names?.[0]} for student ${studentId} (already has ${seenStudents.get(studentId)})`);
          try {
            const contObj = docker.getContainer(c.Id);
            await contObj.remove({ force: true });
          } catch (e) {
            console.warn(`[SessionManager] Failed to remove duplicate container: ${e.message}`);
          }
          if (sessionId) this.sessions.delete(sessionId);
          continue;
        }

        // Condition C: Exceeds global concurrency limit (max 2) -> destroy excess
        if (this.sessions.size >= config.maxGlobalConcurrentLabs && !this.sessions.has(sessionId)) {
          console.log(`[SessionManager] Purging container ${c.Names?.[0]} exceeding global limit of ${config.maxGlobalConcurrentLabs}`);
          try {
            const contObj = docker.getContainer(c.Id);
            await contObj.remove({ force: true });
          } catch (e) {
            console.warn(`[SessionManager] Failed to remove excess container: ${e.message}`);
          }
          if (sessionId) this.sessions.delete(sessionId);
          continue;
        }

        // Condition D: Valid running container -> ensure tracked in this.sessions
        if (studentId) seenStudents.set(studentId, c.Id);

        if (sessionId && !this.sessions.has(sessionId)) {
          console.log(`[SessionManager] Restoring tracked session '${sessionId}' for live container ${c.Names?.[0]}`);
          const session = {
            id: sessionId,
            studentId,
            studentName,
            labId,
            containerId: c.Id,
            containerName: (c.Names?.[0] || '').replace(/^\//, ''),
            state: 'running',
            startedAt: createdAtIso,
            expiresAt: new Date(expiresAtMs).toISOString(),
            startedAtMs: new Date(createdAtIso).getTime(),
            expiresAtMs: expiresAtMs,
            durationMinutes: config.sessionDurationMinutes,
            ticket: this.createTicket(sessionId, studentId),
            wsClients: new Set()
          };
          this.sessions.set(sessionId, session);
        }
      }

      console.log(`[SessionManager] Reconciliation complete. Active tracked sessions: ${this.getActiveCount()}/${config.maxGlobalConcurrentLabs}`);
    } catch (err) {
      console.error(`[SessionManager] Error during container reconciliation: ${err.message}`);
    }
  }

  /**
   * Backwards-compatible alias for cleanup
   */
  async cleanupStaleContainers() {
    return this.reconcileWithDocker();
  }

  /**
   * Background reaper to automatically stop and remove expired sessions.
   */
  startReaper(intervalMs = 10000) {
    if (this.reaperInterval) clearInterval(this.reaperInterval);

    this.reaperInterval = setInterval(async () => {
      const now = Date.now();

      // Check in-memory sessions for 30m expiration
      for (const [id, session] of this.sessions.entries()) {
        const expMs = typeof session.expiresAtMs === 'number'
          ? session.expiresAtMs
          : new Date(session.expiresAt).getTime();

        if (now >= expMs && session.state === 'running') {
          console.log(`[SessionReaper] Session ${id} reached 30m expiration limit. Terminating container...`);
          await this.stopSession(id, 'Session time expired (30 minute limit reached)');
        }
      }

      // Clean up expired tickets
      for (const [ticket, info] of this.tickets.entries()) {
        if (now > info.expiresAt) {
          this.tickets.delete(ticket);
        }
      }
    }, intervalMs);
  }

  stopReaper() {
    if (this.reaperInterval) {
      clearInterval(this.reaperInterval);
      this.reaperInterval = null;
    }
  }
}

// Guarantee shared singleton instance across all imports via globalThis
const GLOBAL_KEY = Symbol.for('virtuallab.sessionManager.singleton');
if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = new SessionManager();
}

export const sessionManager = globalThis[GLOBAL_KEY];
