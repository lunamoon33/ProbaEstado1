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
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
 },
  
  lat: {
  type: Number,
  default: null
},
lng: {
  type: Number,
  default: null
}
);

const Report = mongoose.model('Report', reportSchema);
export default Report;