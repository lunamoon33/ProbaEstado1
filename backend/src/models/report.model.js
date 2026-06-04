import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'resolved', 'rejected'],
      default: 'pending'
    },
    blockchainHash: {
      type: String,
      default: null
    },
    transactionHash: {
      type: String,
      default: null
    },
    blockchainVerified: {
      type: Boolean,
      default: false
    },
    registeredAt: {
      type: Date,
      default: null
    },
    blockNumber: {
      type: Number,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
