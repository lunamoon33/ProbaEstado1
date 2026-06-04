import Report from '../models/report.model.js';
import { analyzeReportWithImage } from '../services/aiService.js';
import blockchainService from '../services/blockchainService.js';
import auditService from '../services/auditService.js';
import { generateReportHash } from '../utils/hashGenerator.js';

export const createReport = async (req, res, next) => {
  try {
    const { title, description, image, discordUserId } = req.body ?? {};
    const createdBy = req.user?.id ?? discordUserId ?? null;
    const auditUserFields = req.user?.id ? { userId: req.user.id } : discordUserId ? { discordUserId } : {};

    if (!title || !description) {
      return res.status(400).json({ status: 'error', message: 'title and description are required' });
    }

    console.log('[REPORT_CREATED] Iniciando creación del reporte.');

    let analysis;
    try {
      analysis = await analyzeReportWithImage(title, description, image);
    } catch (aiErr) {
      console.error('[REPORT_CREATED] AI analysis failed:', aiErr?.message || aiErr);
      return res.status(502).json({ status: 'error', message: `⚠️ Error contacting AI analyzer: ${aiErr?.message || 'unknown'}` });
    }

    const isReal = analysis?.isReal !== undefined ? Boolean(analysis.isReal) : true;
    const fraudCheckReason = analysis?.fraudCheckReason || null;
    const category = analysis?.category || 'other';
    const priority = analysis?.priority || 'low';
    const summary = analysis?.summary || (description && description.slice(0, 240)) || title;

    const createdAt = new Date();
    const preSaveDoc = {
      title,
      description,
      category,
      status: isReal ? 'verified' : 'rejected',
      blockchainHash: null,
      transactionHash: null,
      blockchainVerified: false,
      registeredAt: null,
      blockNumber: null,
      createdBy,
      createdAt,
      ai: {
        isReal,
        priority,
        summary,
        fraudCheckReason
      }
    };

    let insertedResult;
    try {
      insertedResult = await Report.collection.insertOne(preSaveDoc);
    } catch (dbErr) {
      console.error('[REPORT_CREATED] DB insert failed:', dbErr?.message || dbErr);
      return res.status(500).json({ status: 'error', message: `⚠️ Error saving report: ${dbErr?.message || 'database error'}` });
    }

    const insertedId = insertedResult.insertedId;
    console.log('[REPORT_CREATED] Reporte guardado en MongoDB con id:', insertedId?.toString());

    try {
      await auditService.logEvent({
        ...auditUserFields,
        action: 'REPORT_CREATED',
        description: 'Nuevo reporte creado',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          reportId: insertedId?.toString(),
          title,
          category,
          isReal
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] REPORT_CREATED log failed:', auditError?.message || auditError);
    }

    if (!isReal) {
      const botMessage = `🛑 Reporte Rechazado: La IA ha detectado un posible fraude o imagen falsa. Motivo: ${fraudCheckReason || 'No especificado'}`;
      return res.status(200).json({ status: 'rejected', message: botMessage, reportId: insertedId?.toString() });
    }

    const reportHash = generateReportHash({
      title,
      description,
      category,
      userId: createdBy,
      timestamp: createdAt
    });

    console.log('[HASH_GENERATED] Hash generado:', reportHash);

    let blockchainResult;
    try {
      blockchainResult = await blockchainService.registerHash(reportHash);
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Blockchain registration failed');
      }

      console.log('[BLOCKCHAIN_REGISTERED] txHash:', blockchainResult.txHash, 'blockNumber:', blockchainResult.blockNumber);
      try {
        await auditService.logEvent({
          ...auditUserFields,
          action: 'BLOCKCHAIN_REGISTERED',
          description: 'Reporte registrado correctamente en blockchain',
          ip: req.ip || req.headers['x-forwarded-for'] || null,
          metadata: {
            reportId: insertedId?.toString(),
            hash: reportHash,
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber
          },
          status: 'success'
        });
      } catch (auditError) {
        console.error('[AUDIT] BLOCKCHAIN_REGISTERED log failed:', auditError?.message || auditError);
      }
    } catch (chainErr) {
      console.error('[BLOCKCHAIN_FAILED] Error registrando en blockchain:', chainErr?.message || chainErr);
      try {
        await auditService.logEvent({
          ...auditUserFields,
          action: 'BLOCKCHAIN_FAILED',
          description: 'Error registrando el reporte en blockchain',
          ip: req.ip || req.headers['x-forwarded-for'] || null,
          metadata: {
            reportId: insertedId?.toString(),
            hash: reportHash,
            error: chainErr?.message || String(chainErr)
          },
          status: 'failed'
        });
      } catch (auditError) {
        console.error('[AUDIT] BLOCKCHAIN_FAILED log failed:', auditError?.message || auditError);
      }

      await Report.collection.updateOne(
        { _id: insertedId },
        {
          $set: {
            blockchainHash: reportHash,
            blockchainVerified: false,
            transactionHash: null,
            registeredAt: null,
            blockNumber: null
          }
        }
      );

      return res.status(201).json({
        success: true,
        report: { ...preSaveDoc, _id: insertedId, blockchainHash: reportHash },
        blockchain: {
          hash: reportHash,
          txHash: null,
          blockNumber: null
        }
      });
    }

    await Report.collection.updateOne(
      { _id: insertedId },
      {
        $set: {
          blockchainHash: reportHash,
          transactionHash: blockchainResult.txHash,
          blockchainVerified: true,
          registeredAt: new Date(),
          blockNumber: blockchainResult.blockNumber
        }
      }
    );

    const savedReport = await Report.findById(insertedId).lean();

    return res.status(201).json({
      success: true,
      report: savedReport,
      blockchain: {
        hash: reportHash,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyReportBlockchain = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).lean();
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

    if (!report.blockchainHash) {
      return res.status(400).json({ status: 'error', message: 'No blockchain hash available for this report' });
    }

    const result = await blockchainService.verifyHash(report.blockchainHash);
    if (result.success === false) {
      console.error('[BLOCKCHAIN_FAILED] verifyHash error:', result.error);
      return res.status(502).json({ status: 'error', message: result.error });
    }

    return res.status(200).json({
      verified: Boolean(result.exists),
      registeredAt: result.registeredAt ?? null
    });
  } catch (error) {
    next(error);
  }
};

export const getReportBlockchainInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).lean();
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

    const explorerUrl = report.transactionHash ? blockchainService.getTransactionUrl(report.transactionHash) : null;

    return res.status(200).json({
      blockchainHash: report.blockchainHash,
      transactionHash: report.transactionHash,
      blockNumber: report.blockNumber,
      registeredAt: report.registeredAt,
      explorerUrl
    });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, status } = req.body ?? {};
    const userId = req.user?.id || null;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

    if (String(report.createdBy) !== String(userId) && req.user?.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (status) updates.status = status;

    if (!Object.keys(updates).length) {
      return res.status(400).json({ status: 'error', message: 'No update fields provided' });
    }

    const updatedReport = await Report.findByIdAndUpdate(id, updates, { new: true }).lean();

    try {
      await auditService.logEvent({
        userId,
        action: 'REPORT_UPDATED',
        description: 'Reporte actualizado',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          reportId: id,
          updates
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] REPORT_UPDATED log failed:', auditError?.message || auditError);
    }

    return res.status(200).json({ success: true, data: updatedReport });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Report not found' });
    }

    if (String(report.createdBy) !== String(userId) && req.user?.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado' });
    }

    await Report.findByIdAndDelete(id);

    try {
      await auditService.logEvent({
        userId,
        action: 'REPORT_DELETED',
        description: 'Reporte eliminado',
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        metadata: {
          reportId: id
        },
        status: 'success'
      });
    } catch (auditError) {
      console.error('[AUDIT] REPORT_DELETED log failed:', auditError?.message || auditError);
    }

    return res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().lean();
    return res.status(200).json({ status: 'success', data: reports });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).lean();
    if (!report) return res.status(404).json({ status: 'error', message: 'Report not found' });
    return res.status(200).json({ status: 'success', data: report });
  } catch (error) {
    next(error);
  }
};

export default {
  createReport,
  updateReport,
  deleteReport,
  verifyReportBlockchain,
  getReportBlockchainInfo,
  getAllReports,
  getReportById
};
