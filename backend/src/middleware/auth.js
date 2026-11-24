import { sessionManager } from '../sessionManager.js';

/**
 * Authentication middleware that extracts student identity from custom headers
 * or request body, verifying basic permissions.
 */
export function requireAuth(req, res, next) {
  // Support headers from frontend client
  const userId = req.headers['x-user-id'] || req.body?.studentId || req.query?.studentId;
  const userRole = req.headers['x-user-role'] || req.body?.userRole || 'student';
  const userName = req.headers['x-user-name'] || req.body?.studentName || 'Student';

  if (!userId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in with your university account.'
      }
    });
  }

  req.user = {
    id: String(userId),
    role: String(userRole).toLowerCase(),
    name: String(userName)
  };

  next();
}

/**
 * Ensures the authenticated user owns the target session, or is an administrator.
 */
export function requireSessionOwnership(req, res, next) {
  const sessionId = req.params.id;
  // Look up in active sessions or directly in session store
  const session = sessionManager.getSession(sessionId) || sessionManager.sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      error: {
        code: 'SESSION_NOT_FOUND',
        message: `Lab session '${sessionId}' was not found or has already expired.`
      }
    });
  }

  // Admin override allowed; otherwise studentId must match
  if (req.user.role !== 'admin' && session.studentId !== req.user.id) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied: You do not have permission to access or terminate this lab session.'
      }
    });
  }

  req.session = session;
  next();
}
