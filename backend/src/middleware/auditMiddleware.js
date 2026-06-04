import auditService from '../services/auditService.js';

export const auditErrorMiddleware = async (err, req, res, next) => {
  try {
    const statusCode = err.status || 500;
    if (statusCode >= 500) {
      await auditService.logEvent({
        userId: req.user?.id || null,
        action: 'SYSTEM_ERROR',
        description: err.message || 'Internal server error',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          path: req.originalUrl,
          method: req.method,
          stack: err.stack ? String(err.stack) : null
        },
        status: 'failed'
      });
    }
  } catch (auditErr) {
    console.error('[AUDIT] Error guardando evento SYSTEM_ERROR:', auditErr?.message || auditErr);
  }

  return next(err);
};
