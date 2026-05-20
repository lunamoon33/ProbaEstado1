import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    wallet: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'institution'],
      default: 'citizen'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const User = mongoose.model('User', userSchema);
export default User;
