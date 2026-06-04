import express from 'express';
import { processAgentRequest } from '../controllers/agent.controller.js';
import { testAgent, health } from '../controllers/agentController.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected endpoint to send requests to the MasterAgent. Admins only.
router.post('/process', authenticate(['admin']), processAgentRequest);

// Debug endpoint to exercise MasterAgent from Postman
router.post('/test', testAgent);

// Health check for multi-agent components
router.get('/health', health);

export default router;
