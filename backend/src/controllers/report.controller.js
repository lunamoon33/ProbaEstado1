cat > backend/src/controllers/report.controller.js << 'EOF'
import { createHash } from 'crypto';
import Report from '../models/report.model.js';
import { analyzeReport } from '../services/aiService.js';
import { registerHashInBlockchain } from '../services/blockchainService.js';
import { sendDiscordNotification } from '../services/discordWebhookService.js';

export const createReport = async (req, res, next) => {
  try {
    const { title, description, category: requestedCategory } = req.body;

    if (!title || !description) {
      return res.status(400).json({ status: 'error', message: 'title y description son obligatorios' });
    }

    let category = requestedCategory || 'other';
    let priority = 'low';
    let summary = 'Reporte guardado sin análisis de IA debido a un error interno.';

    try {
      const analysis = await analyzeReport(title, description);
      category = analysis.category || category;
      priority = analysis.priority || priority;
      summary = analysis.summary || summary;
    } catch (analysisError) {
      console.error('Error en análisis de IA:', analysisError?.message || analysisError);
    }

    const report = await Report.create({
      title,
      description,
      category,
      status: 'pending',
      blockchainHash: null,
    });

    const hashSeed = `${report._id.toString()}|${Date.now()}|${title}|${description}`;
    const reportHash = createHash('sha256').update(hashSeed).digest('hex');

    let blockchainHash = null;

    try {
      blockchainHash = await registerHashInBlockchain(reportHash);
      report.blockchainHash = blockchainHash;
      await report.save();
    } catch (blockchainError) {
      console.error('Error en registro blockchain:', blockchainError?.message || blockchainError);
    }

    try {
      await sendDiscordNotification({
        id: report._id.toString(),
        title: report.title,
        description: report.description,
        category: report.category,
        priority,
        summary,
        blockchainHash: blockchainHash || 'No registrado aún',
        createdAt: report.createdAt
      });
    } catch (discordError) {
      console.error('Error enviando notificación a Discord:', discordError?.message || discordError);
    }

    return res.status(201).json({ status: 'success', data: report });
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: 'success', data: reports });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ status: 'error', message: 'Reporte no encontrado' });
    }

    return res.status(200).json({ status: 'success', data: report });
  } catch (error) {
    next(error);
  }
};
EOF
