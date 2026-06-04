import express from 'express';
import { createReport, getAllReports, getReportById } from '../controllers/report.controller.js';

const router = express.Router();

router.post('/', createReport);  // sin authenticate
router.get('/', getAllReports);
router.get('/:id', getReportById);

export default router;
