import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from '../src/models/report.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    const reports = await Report.find().sort({ createdAt: -1 }).limit(5).lean();
    console.log('Last 5 reports:');
    reports.forEach(r => {
      console.log('---');
      console.log('id:', r._id?.toString());
      console.log('title:', r.title);
      console.log('category:', r.category);
      console.log('status:', r.status);
      console.log('blockchainHash:', r.blockchainHash);
      console.log('ai metadata:', r.ai || r.fraudCheckReason || 'no ai metadata');
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error inspecting reports:', err);
    process.exit(1);
  }
}

main();
