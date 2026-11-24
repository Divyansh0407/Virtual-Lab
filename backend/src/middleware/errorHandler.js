export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the lab backend server.',
      ...(err.activeSessionId ? { activeSessionId: err.activeSessionId } : {})
    }
  });
}
