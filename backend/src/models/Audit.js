import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    discordUserId: {
      type: String,
      default: null,
      index: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    ip: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    status: {
      type: String,
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
