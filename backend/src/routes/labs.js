import express from 'express';
import { requireAuth, requireSessionOwnership } from '../middleware/auth.js';
import { sessionManager } from '../sessionManager.js';
import { dynamoDBService } from '../services/dynamoDBService.js';
import { docker } from '../docker.js';
import { config } from '../config.js';

export const labsRouter = express.Router();

/**
 * POST /api/labs/launch
 * Dynamically launches an isolated Docker container on AWS EC2 for the authenticated student.
 */
labsRouter.post('/launch', requireAuth, async (req, res, next) => {
  try {
    const { labId = 'lab-linux-perm' } = req.body;
    const studentId = req.user.id;
    const studentName = req.user.name;

    console.log(`[API] Launch request received for student ${studentName} (${studentId}) on lab ${labId}`);

    const session = await sessionManager.launchLabSession({
      studentId,
      studentName,
      labId
    });

    const now = Date.now();
    const expiresAtMs = session.expiresAtMs || new Date(session.expiresAt).getTime();
    const timeRemainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

    res.status(201).json({
      success: true,
      message: 'Container provisioned successfully on AWS infrastructure.',
      session: {
        id: session.id,
        studentId: session.studentId,
        studentName: session.studentName,
        labId: session.labId,
        containerId: session.containerId.slice(0, 12),
        containerName: session.containerName,
        state: session.state,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        durationMinutes: session.durationMinutes,
        timeRemainingSeconds,
        ticket: session.ticket,
        wsEndpoint: `/ws/terminal/${session.id}?ticket=${session.ticket}`
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/labs/:id/status
 * Fetches real-time status and telemetry for a running lab session.
 */
labsRouter.get('/:id/status', requireAuth, requireSessionOwnership, async (req, res, next) => {
  try {
    const session = req.session;
    const now = Date.now();
    const expiresAtMs = session.expiresAtMs || new Date(session.expiresAt).getTime();
    const timeRemainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

    let containerStatus = session.state;
    try {
      const container = docker.getContainer(session.containerId);
      const inspectData = await container.inspect();
      containerStatus = inspectData.State.Status; // e.g. 'running'
    } catch (e) {
      console.warn(`[API] Inspect failed for container ${session.containerId}: ${e.message}`);
    }

    // Refresh ticket for connection
    const ticket = sessionManager.createTicket(session.id, req.user.id);

    res.status(200).json({
      success: true,
      session: {
        id: session.id,
        containerId: session.containerId.slice(0, 12),
        containerName: session.containerName,
        state: containerStatus,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        durationMinutes: session.durationMinutes,
        timeRemainingSeconds,
        ticket,
        wsEndpoint: `/ws/terminal/${session.id}?ticket=${ticket}`
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/labs/:id
 * Terminates and forcibly removes the student's Docker container.
 */
labsRouter.delete('/:id', requireAuth, requireSessionOwnership, async (req, res, next) => {
  try {
    const session = req.session;
    console.log(`[API] Terminate request received for lab session ${session.id} by ${req.user.name}`);

    await sessionManager.stopSession(session.id, 'Student terminated lab session');

    res.status(200).json({
      success: true,
      message: `Lab container '${session.containerName}' stopped and removed from host.`
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/labs/:id/history
 * Internal/Authorized endpoint to query session command logs from DynamoDB.
 *
 * Security Notice:
 * In this college prototype, user identity headers (x-user-id) are accepted for development.
 * In production, this route should be restricted to authenticated faculty/admin roles
 * via signed JWTs or session cookies.
 */
labsRouter.get('/:id/history', requireAuth, requireSessionOwnership, async (req, res, next) => {
  try {
    const session = req.session;
    const { limit = '100', nextToken } = req.query;

    const history = await dynamoDBService.getSessionHistory(session.id, {
      limit: parseInt(limit, 10),
      nextToken: nextToken ? String(nextToken) : null
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      studentId: session.studentId,
      studentName: session.studentName,
      ...history
    });
  } catch (err) {
    next(err);
  }
});
