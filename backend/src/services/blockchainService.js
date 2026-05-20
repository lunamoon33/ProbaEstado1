import { ethers } from 'ethers';
import { reportContract } from '../config/blockchain.js';

export const registerHashInBlockchain = async (reportHash) => {
  try {
    const tx = await reportContract.registerReportHash(reportHash, {
      gasLimit: 200000,
      gasPrice: ethers.parseUnits('1', 'gwei')
    });
    await tx.wait(1);
    const txUrl = `https://explorer-zk.tanenbaum.io/tx/${tx.hash}`;
    return txUrl;
  } catch (error) {
    throw new Error(`Error registrando el hash en la blockchain: ${error.message || error}`);
  }
};

export const verifyHashInBlockchain = async (reportHash) => {
  try {
    const [isRegistered, timestamp] = await reportContract.verifyReportHash(reportHash);
    return {
      isRegistered,
      timestamp: Number(timestamp),
      explorerUrl: isRegistered 
        ? `https://explorer-zk.tanenbaum.io` 
        : null
    };
  } catch (error) {
    throw new Error(`Error verificando el hash en la blockchain: ${error.message || error}`);
  }
};