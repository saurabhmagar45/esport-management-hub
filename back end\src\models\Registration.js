import mongoose from 'mongoose';

const teammateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    inGameName: { type: String, required: true, trim: true },
    gameId: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true }
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true
    },
    teamName: {
      type: String,
      trim: true
    },
    teamTag: {
      type: String,
      trim: true,
      uppercase: true
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roster: [teammateSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Prevent same team registering twice for the same tournament
registrationSchema.index({ tournament: 1, team: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
