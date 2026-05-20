import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL) {
  throw new Error('RPC_URL no está definido en el archivo .env');
}

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY no está definido en el archivo .env');
}

if (!CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS no está definido en el archivo .env');
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);
export const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const reportAbi = [
  'function registerReportHash(string memory _hash) public',
  'function verifyReportHash(string memory _hash) public view returns (bool, uint256)'
];

export const reportContract = new ethers.Contract(CONTRACT_ADDRESS, reportAbi, wallet);
