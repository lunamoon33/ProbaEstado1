import { reportContract } from '../config/blockchain.js';

export const registerHashInBlockchain = async (reportHash) => {
  try {
    const tx = await reportContract.registerReportHash(reportHash);
    const receipt = await tx.wait();
    return receipt.transactionHash || tx.hash;
  } catch (error) {
    throw new Error(`Error registrando el hash en la blockchain: ${error.message || error}`);
  }
};

export const verifyHashInBlockchain = async (reportHash) => {
  try {
    const [isRegistered, timestamp] = await reportContract.verifyReportHash(reportHash);
    return {
      isRegistered,
      timestamp: Number(timestamp)
    };
  } catch (error) {
    throw new Error(`Error verificando el hash en la blockchain: ${error.message || error}`);
  }
};
