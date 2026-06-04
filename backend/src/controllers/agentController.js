import { masterAgent, reportAgent, verificationAgent, aiAgent } from '../agents/agentRegistry.js';
import auditService from '../services/auditService.js';

function decideAgentName(message) {
  const lower = String(message || '').toLowerCase();
  if (lower.includes('reporte') || lower.includes('corrup') || lower.includes('corrupción') || lower.includes('corrupcion')) {
    return 'ReportAgent';
  }

  if (lower.includes('verificar')) {
    return 'VerificationAgent';
  }

  if (lower.includes('resumen')) {
    return 'AIAgent';
  }

  return 'AIAgent';
}

export async function testAgent(req, res) {
  try {
    const { message } = req.body || {};
    const source = 'debug';
    const payload = req.body.payload || {};
    const user = req.user || null;

    console.log('[MASTER_AGENT] Mensaje recibido', message);

    const agentName = decideAgentName(message);
    console.log('[ROUTING] Agente seleccionado', agentName);

    // Audit: MASTER_ROUTING
    await auditService.logEvent({
      userId: user?.id ?? null,
      action: 'MASTER_ROUTING',
      description: `Routing debug request to ${agentName}`,
      ip: req.ip,
      metadata: { message, source, payload, route: agentName },
      status: 'success'
    });

    const result = await masterAgent.processRequest({ message, user, source, payload });

    console.log('[AGENT_EXECUTION] Resultado obtenido', result);

    // Audit: AGENT_EXECUTION
    await auditService.logEvent({
      userId: user?.id ?? null,
      action: 'AGENT_EXECUTION',
      description: `${agentName} executed via debug endpoint`,
      ip: req.ip,
      metadata: { agent: agentName, result },
      status: 'success'
    });

    const timestamp = new Date().toISOString();

    return res.json({
      success: true,
      agent: agentName,
      message,
      response: result,
      timestamp
    });
  } catch (err) {
    console.error('[AGENT_ERROR]', err);
    await auditService.logEvent({
      userId: null,
      action: 'AGENT_DEBUG_ERROR',
      description: err.message,
      ip: req.ip,
      metadata: { error: err.stack },
      status: 'error'
    });

    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function health(req, res) {
  try {
    const statuses = {
      masterAgent: masterAgent ? 'online' : 'offline',
      reportAgent: reportAgent ? 'online' : 'offline',
      verificationAgent: verificationAgent ? 'online' : 'offline',
      aiAgent: aiAgent ? 'online' : 'offline'
    };

    return res.json({ success: true, ...statuses });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
