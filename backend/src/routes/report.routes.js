import express from 'express';
import { createReport, getAllReports, getReportById } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate(), createReport);
router.get('/', getAllReports);
router.get('/:id', getReportById);

export default router;
