import auditService from '../services/auditService.js';
import blockchainService from '../services/blockchainService.js';
import { generateReportHash } from '../utils/hashGenerator.js';

export default class MasterAgent {
  constructor({ reportAgent, verificationAgent, aiAgent }) {
    this.reportAgent = reportAgent;
    this.verificationAgent = verificationAgent;
    this.aiAgent = aiAgent;
  }

  async processRequest({ message, user, source, payload }) {
    const lowerMessage = String(message || '').toLowerCase();
    const routing = this._decideAgent(lowerMessage);
    const auditUserFields = this._getAuditUserFields(source, user);

    await auditService.logEvent({
      ...auditUserFields,
      action: 'MASTER_ROUTING',
      description: `Routing request to ${routing.agentName}`,
      ip: null,
      metadata: {
        message,
        source,
        payload,
        route: routing.agentName
      },
      status: 'success'
    });

    let agentResult;

    switch (routing.agentName) {
      case 'ReportAgent':
        agentResult = await this._handleReportRequest(payload, user, source);
        break;
      case 'VerificationAgent':
        agentResult = await this._handleVerificationRequest(payload, user, source);
        break;
      case 'AIAgent':
      default:
        agentResult = await this._handleAIRequest(payload, message, user, source);
        break;
    }

    return agentResult;
  }

  _decideAgent(lowerMessage) {
    // Si contiene reporte o el payload indica que es un proceso de reporte directo
    if (lowerMessage.includes('reporte')) {
      return { agentName: 'ReportAgent' };
    }

    if (lowerMessage.includes('verificar')) {
      return { agentName: 'VerificationAgent' };
    }

    if (lowerMessage.includes('resumen')) {
      return { agentName: 'AIAgent' };
    }

    // Por defecto si no coincide, forzamos a ReportAgent si viene un mensaje con estructura de reporte
    return { agentName: 'ReportAgent' };
  }

  _getAuditUserFields(source, user) {
    if (source === 'discord') {
      return { discordUserId: user?.id ?? null };
    }
    return { userId: user?.id ?? null };
  }

  async _handleReportRequest(payload, user, source) {
    const safePayload = payload || {};
    const analysis = await this.reportAgent.analyzeReport(safePayload);

    // Generación del hash único del reporte ciudadano
    const reportHash = generateReportHash({
      title: safePayload.title || '',
      description: safePayload.description || '',
      category: analysis.category || 'other',
      userId: user?.id || 'anonymous',
      timestamp: new Date()
    });

    let blockchainResult = { success: false, txHash: null, blockNumber: null, error: null };
    try {
      blockchainResult = await blockchainService.registerHash(reportHash);
    } catch (chainErr) {
      blockchainResult = {
        success: false,
        txHash: null,
        blockNumber: null,
        error: chainErr?.message || String(chainErr)
      };
    }

    // Construcción del enlace dinámico apuntando a Tanenbaum Testnet usando la variable de entorno configurada
    const baseExplorer = process.env.BLOCK_EXPLORER || 'https://tanenbaum.io';
    const dynamicTxUrl = blockchainResult.txHash 
      ? `[\`${baseExplorer}/tx/${blockchainResult.txHash}\`](${baseExplorer}/tx/${blockchainResult.txHash})`
      : '`El registro en blockchain falló o está pendiente.`';

    // Formateamos la respuesta final de manera fría, neutral y estructurada para pasarla al AIAgent
    const response = await this.aiAgent.generateResponse({
      type: 'report',
      payload: {
        ...safePayload,
        title: safePayload.title || 'Reporte Sin Título',
        category: analysis.category || 'INFRASTRUCTURE',
        priority: analysis.priority || 'HIGH',
        summary: analysis.summary || safePayload.description || 'No se proporcionó un resumen.',
        blockchainHash: reportHash,
        blockchainTxHash: blockchainResult.txHash || null,
        blockchainTxUrl: dynamicTxUrl,
        blockchainRegistered: Boolean(blockchainResult.success)
      },
      analysis,
      user: {
        ...user,
        discordUserId: source === 'discord' ? user?.id : undefined
      }
    });

    await auditService.logEvent({
      ...this._getAuditUserFields(source, user),
      action: 'AGENT_EXECUTION',
      description: 'ReportAgent executed and AIAgent generated response',
      ip: null,
      metadata: {
        agent: 'ReportAgent',
        analysis,
        blockchain: {
          hash: reportHash,
          txHash: blockchainResult.txHash,
          blockNumber: blockchainResult.blockNumber,
          success: blockchainResult.success,
          error: blockchainResult.error
        },
        response
      },
      status: 'success'
    });

    return response;
  }

  async _handleVerificationRequest(payload, user, source) {
    const hash = payload?.hash || payload?.reportHash || payload?.message;
    const verification = await this.verificationAgent.verifyReport({ hash });
    const evidence = await this.verificationAgent.getBlockchainEvidence(hash);
    const response = await this.aiAgent.generateResponse({
      type: 'verification',
      payload: { hash, verification, evidence },
      user: {
        ...user,
        discordUserId: source === 'discord' ? user?.id : undefined
      }
    });

    await auditService.logEvent({
      ...this._getAuditUserFields(source, user),
      action: 'AGENT_EXECUTION',
      description: 'VerificationAgent executed',
      ip: null,
      metadata: {
        agent: 'VerificationAgent',
        hash,
        verification,
        evidence
      },
      status: 'success'
    });

    return response;
  }

  async _handleAIRequest(payload, message, user, source) {
    const auditUserFields = this._getAuditUserFields(source, user);

    if (payload?.type === 'summary') {
      const summary = await this.aiAgent.summarizeReport(payload);

      await auditService.logEvent({
        ...auditUserFields,
        action: 'AGENT_EXECUTION',
        description: 'AIAgent summary generated',
        ip: null,
        metadata: {
          agent: 'AIAgent',
          payload,
          summary
        },
        status: 'success'
      });

      return summary;
    }

    const analysis = await this.aiAgent.analyzeText(message);

    await auditService.logEvent({
      ...auditUserFields,
      action: 'AGENT_EXECUTION',
      description: 'AIAgent text analysis generated',
      ip: null,
      metadata: {
        agent: 'AIAgent',
        message,
        analysis
      },
      status: 'success'
    });

    return analysis;
  }
}
