import Audit from '../models/Audit.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, userId, discordUserId, from, to } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (discordUserId) filter.discordUserId = discordUserId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const audits = await Audit.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
};

export const getAuditById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const audit = await Audit.findById(id).lean();
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }
    return res.status(200).json({ success: true, data: audit });
  } catch (error) {
    next(error);
  }
};

export const getAuditByAction = async (req, res, next) => {
  try {
    const { action } = req.params;
    const audits = await Audit.find({ action }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: audits });
  } catch (error) {
    next(error);
  }
};

export const getAuditStats = async (req, res, next) => {
  try {
    const totalEvents = await Audit.countDocuments();
    const totalLogins = await Audit.countDocuments({ action: 'LOGIN' });
    const totalReports = await Audit.countDocuments({ action: { $in: ['REPORT_CREATED', 'REPORT_UPDATED', 'REPORT_DELETED'] } });
    const totalBlockchain = await Audit.countDocuments({ action: { $in: ['BLOCKCHAIN_REGISTERED', 'BLOCKCHAIN_FAILED'] } });
    const totalErrors = await Audit.countDocuments({ action: 'SYSTEM_ERROR' });

    return res.status(200).json({
      success: true,
      data: {
        totalEvents,
        totalLogins,
        totalReports,
        totalBlockchain,
        totalErrors
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAuditLogs,
  getAuditById,
  getAuditByAction,
  getAuditStats
};
