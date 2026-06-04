import express from 'express';
import {
  getAuditLogs,
  getAuditById,
  getAuditByAction,
  getAuditStats
} from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate(['admin']), getAuditLogs);
router.get('/stats', authenticate(['admin']), getAuditStats);
router.get('/action/:action', authenticate(['admin']), getAuditByAction);
router.get('/:id', authenticate(['admin']), getAuditById);

export default router;
