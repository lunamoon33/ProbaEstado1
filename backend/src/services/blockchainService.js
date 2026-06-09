import { reportContract, wallet } from '../config/blockchain.js';
import auditService from './auditService.js';

const BLOCK_EXPLORER = process.env.BLOCK_EXPLORER?.trim() || 'https://explorer-zk.tanenbaum.io';

class BlockchainService {
  constructor(contract, walletInstance, explorerUrl) {
    this.contract = contract;
    this.wallet = walletInstance;
    this.blockExplorer = explorerUrl;
    this.activeRegistrations = new Map();
    this.cachedResults = new Map();
  }

  async registerHash(hash) {
    if (!hash || typeof hash !== 'string' || !hash.trim()) {
      return {
        success: false,
        error: 'El hash no puede estar vacío.'
      };
    }

    if (this.cachedResults.has(hash)) {
      return this.cachedResults.get(hash);
    }

    if (this.activeRegistrations.has(hash)) {
      return this.activeRegistrations.get(hash);
    }

    const registrationPromise = (async () => {
      console.log('[BLOCKCHAIN] [REGISTER_HASH] Validando hash.');

      try {
        // Obtenemos los datos de tarifas de la red en tiempo real
        const feeData = await this.wallet.provider.getFeeData();
        
        // Dejamos que Ethers maneje el Nonce automáticamente para evitar colisiones
        // pero multiplicamos las tarifas base de la red por un factor de seguridad (1.5x)
        const baseMaxFee = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 15n) / 10n : 150_000_000_000n;
        const basePriorityFee = feeData.maxPriorityFeePerGas ? (feeData.maxPriorityFeePerGas * 15n) / 10n : 50_000_000_000n;

        const txOptions = {
          gasLimit: 400000,
          maxFeePerGas: baseMaxFee,
          maxPriorityFeePerGas: basePriorityFee,
          type: 2
        };

        const tx = await this.contract.connect(this.wallet).registerReportHash(hash, txOptions);
        console.log('[BLOCKCHAIN] [REGISTER_HASH] Transacción enviada:', tx.hash, 'fees:', {
          maxFeePerGas: txOptions.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: txOptions.maxPriorityFeePerGas?.toString()
        });

        const receipt = await tx.wait();
        console.log('[BLOCKCHAIN] [REGISTER_HASH] Transacción confirmada en bloque:', receipt.blockNumber);

        const txHash = receipt.transactionHash ?? tx.hash;
        const result = {
          success: true,
          txHash,
          blockNumber: receipt.blockNumber,
          transactionUrl: this.blockExplorer ? this.getTransactionUrl(txHash) : null
        };

        try {
          await auditService.logEvent({
            action: 'BLOCKCHAIN_REGISTERED',
            description: 'Hash registrado en la blockchain',
            ip: null,
            metadata: {
              hash,
              txHash: result.txHash,
              blockNumber: result.blockNumber
            },
            status: 'success'
          });
        } catch (auditError) {
          console.error('[AUDIT] BLOCKCHAIN_REGISTERED log failed:', auditError?.message || auditError);
        }

        return result;
      } catch (error) {
        const errorMessage = error?.message || String(error);
        console.error('[BLOCKCHAIN] [REGISTER_HASH] Error original:', errorMessage);

        // Si la red rechaza la transacción por tarifas bajas o reemplazo duplicado
        if (/replacement transaction underpriced|replacement fee too low|nonce/i.test(errorMessage)) {
          try {
            console.log('[BLOCKCHAIN] [REGISTER_HASH] Iniciando reintento dinámico con tarifas elevadas.');
            
            const feeData2 = await this.wallet.provider.getFeeData();
            // Forzamos tarifas agresivas (el doble de lo estimado por la red) para romper el bloqueo de la mempool
            const boostedMaxFee = feeData2.maxFeePerGas ? feeData2.maxFeePerGas * 2n : 300_000_000_000n;
            const boostedPriorityFee = feeData2.maxPriorityFeePerGas ? feeData2.maxPriorityFeePerGas * 2n : 100_000_000_000n;

            const boostedOptions = {
              gasLimit: 450000,
              maxFeePerGas: boostedMaxFee,
              maxPriorityFeePerGas: boostedPriorityFee,
              type: 2
            };

            const tx2 = await this.contract.connect(this.wallet).registerReportHash(hash, boostedOptions);
            console.log('[BLOCKCHAIN] [REGISTER_HASH] Reintento de transacción enviado:', tx2.hash);
            const receipt2 = await tx2.wait();
            console.log('[BLOCKCHAIN] [REGISTER_HASH] Reintento confirmado en bloque:', receipt2.blockNumber);

            const txHash2 = receipt2.transactionHash ?? tx2.hash;
            const result2 = {
              success: true,
              txHash: txHash2,
              blockNumber: receipt2.blockNumber,
              transactionUrl: this.blockExplorer ? this.getTransactionUrl(txHash2) : null
            };

            try {
              await auditService.logEvent({
                action: 'BLOCKCHAIN_REGISTERED',
                description: 'Hash registrado en la blockchain tras retry',
                ip: null,
                metadata: {
                  hash,
                  txHash: result2.txHash,
                  blockNumber: result2.blockNumber
                },
                status: 'success'
              });
            } catch (auditError) {
              console.error('[AUDIT] BLOCKCHAIN_REGISTERED log failed:', auditError?.message || auditError);
            }

            return result2;
          } catch (retryError) {
            const retryMsg = retryError?.message || String(retryError);
            console.error('[BLOCKCHAIN] [REGISTER_HASH] Reintento fallido de forma crítica:', retryMsg);
          }
        }

        try {
          await auditService.logEvent({
            action: 'BLOCKCHAIN_FAILED',
            description: 'Error registrando hash en la blockchain',
            ip: null,
            metadata: {
              hash,
              error: errorMessage
            },
            status: 'failed'
          });
        } catch (auditError) {
          console.error('[AUDIT] BLOCKCHAIN_FAILED log failed:', auditError?.message || auditError);
        }
        return {
          success: false,
          error: errorMessage
        };
      }
    })();

    this.activeRegistrations.set(hash, registrationPromise);

    try {
      const result = await registrationPromise;
      if (result.success) {
        this.cachedResults.set(hash, result);
      }
      return result;
    } finally {
      this.activeRegistrations.delete(hash);
    }
  }

  async verifyHash(hash) {
    console.log('[BLOCKCHAIN] [VERIFY_HASH] Consultando existencia para hash:', hash);

    try {
      const [exists, registeredAt] = await this.contract.verifyReportHash(hash);
      return {
        exists: Boolean(exists),
        registeredAt: Number(registeredAt)
      };
    } catch (error) {
      console.error('[BLOCKCHAIN] [VERIFY_HASH] Error:', error?.message || error);
      return {
        success: false,
        error: error?.message || String(error)
      };
    }
  }

  async getReport(hash) {
    console.log('[BLOCKCHAIN] [GET_REPORT] Recuperando reporte para hash:', hash);

    try {
      const report = await this.contract.getReport(hash);
      return {
        reportHash: report.reportHash ?? report[0],
        registrant: report.registrant ?? report[1],
        timestamp: Number(report.timestamp ?? report[2])
      };
    } catch (error) {
      console.error('[BLOCKCHAIN] [GET_REPORT] Error:', error?.message || error);
      return {
        success: false,
        error: error?.message || String(error)
      };
    }
  }

  getTransactionUrl(txHash) {
    console.log('[BLOCKCHAIN] [BLOCKCHAIN_URL] Generando URL para transacción:', txHash);

    if (!this.blockExplorer) {
      throw new Error('BLOCK_EXPLORER no está definido en .env');
    }

    if (!txHash || typeof txHash !== 'string' || !txHash.trim()) {
      throw new Error('txHash no puede estar vacío.');
    }

    return `${this.blockExplorer.replace(/\/$/, '')}/tx/${txHash}`;
  }
}

export default new BlockchainService(reportContract, wallet, BLOCK_EXPLORER);
