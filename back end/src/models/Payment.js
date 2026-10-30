import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    orderId: {
      type: String,
      required: true,
      unique: true
    },
    paymentId: {
      type: String
    },
    signature: {
      type: String
    },
    status: {
      type: String,
      enum: ['created', 'attempted', 'captured', 'failed', 'refunded'],
      default: 'created'
    },
    method: {
      type: String,
      default: 'upi'
    },
    verifiedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, tournament: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
