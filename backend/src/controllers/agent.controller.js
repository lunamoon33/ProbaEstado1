import { masterAgent } from '../agents/agentRegistry.js';

/**
 * HTTP controller to forward requests to the MasterAgent for orchestration.
 * Protected endpoint — intended for internal/admin use only.
 */
export const processAgentRequest = async (req, res, next) => {
  try {
    const { message, source, payload } = req.body ?? {};
    const user = req.user ?? null;

    const result = await masterAgent.processRequest({ message, user, source, payload });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export default { processAgentRequest };
