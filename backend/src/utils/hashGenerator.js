import crypto from 'crypto';

/**
 * Genera un hash SHA256 para un reporte usando los campos principales.
 * @param {Object} reportData
 * @param {string} reportData.title
 * @param {string} reportData.description
 * @param {string} reportData.category
 * @param {string} reportData.userId
 * @param {string|Date} reportData.timestamp
 * @returns {string} Hash hexadecimal de 64 caracteres.
 */
export const generateReportHash = ({ title, description, category, userId, timestamp }) => {
  const normalizedTimestamp = timestamp instanceof Date ? timestamp.toISOString() : String(timestamp ?? '');
  const payload = `${String(title || '')}|${String(description || '')}|${String(category || '')}|${String(userId || '')}|${normalizedTimestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};
