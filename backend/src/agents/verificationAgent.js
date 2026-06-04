import blockchainService from '../services/blockchainService.js';
import auditService from '../services/auditService.js';

export default class VerificationAgent {
  async verifyReport({ hash }) {
    const result = await this.verifyHash(hash);
    await auditService.logEvent({
      action: 'BLOCKCHAIN_VERIFICATION',
      description: 'VerificationAgent checked report hash on blockchain',
      ip: null,
      metadata: {
        hash,
        result
      },
      status: result.success === false ? 'failed' : 'success'
    });

    return result;
  }

  async verifyHash(hash) {
    return blockchainService.verifyHash(hash);
  }

  async getBlockchainEvidence(hash) {
    const report = await blockchainService.getReport(hash);
    return report;
  }
}
