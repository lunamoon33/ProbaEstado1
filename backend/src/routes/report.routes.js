import express from 'express';
import {
  createReport,
  updateReport,
  deleteReport,
  verifyReportBlockchain,
  getReportBlockchainInfo,
  getAllReports,
  getReportById
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate(), createReport);
router.get('/', getAllReports);
router.get('/:id', getReportById);
router.put('/:id', authenticate(), updateReport);
router.delete('/:id', authenticate(), deleteReport);
router.get('/:id/verify', authenticate(), verifyReportBlockchain);
router.get('/:id/blockchain', authenticate(), getReportBlockchainInfo);

export default router;
