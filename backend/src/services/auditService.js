import mongoose from 'mongoose';
import Audit from '../models/Audit.js';

const SUPPORTED_ACTIONS = new Set([
  'REGISTER',
  'LOGIN',
  'LOGOUT',
  'REPORT_CREATED',
  'REPORT_UPDATED',
  'REPORT_DELETED',
  'BLOCKCHAIN_REGISTERED',
  'BLOCKCHAIN_FAILED',
  'VERIFY_HASH',
  'DISCORD_REQUEST',
  'DISCORD_MESSAGE',
  'MASTER_ROUTING',
  'AGENT_EXECUTION',
  'AI_ANALYSIS',
  'AI_RESPONSE',
  'SYSTEM_ERROR'
]);

const normalizeEvent = ({ userId, discordUserId, action, description, ip, metadata, status }) => {
  let normalizedUserId = null;
  let normalizedDiscordUserId = null;

  if (discordUserId != null) {
    normalizedDiscordUserId = String(discordUserId);
  } else if (userId != null) {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      normalizedUserId = userId;
    } else {
      normalizedDiscordUserId = String(userId);
    }
  }

  return {
    userId: normalizedUserId,
    discordUserId: normalizedDiscordUserId,
    action: String(action || '').trim(),
    description: description ? String(description) : null,
    ip: ip ? String(ip) : null,
    metadata: metadata ?? null,
    status: status ? String(status) : null
  };
};

const logEvent = async (data) => {
  const event = normalizeEvent(data);

  if (!event.action) {
    console.warn('[AUDIT] audit event action is required. Event dropped.', data);
    return null;
  }

  if (!SUPPORTED_ACTIONS.has(event.action)) {
    console.warn(`[AUDIT] Acción no soportada: ${event.action}. Registrando de todos modos.`);
  }

  try {
    return await Audit.create(event);
  } catch (error) {
    console.warn('[AUDIT] Error guardando evento:', error?.message || error, 'Event:', event);
    return null;
  }
};

export default {
  logEvent
};
