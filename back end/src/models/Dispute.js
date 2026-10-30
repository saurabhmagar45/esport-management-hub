import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    issueType: {
      type: String,
      enum: ['room_credentials', 'no_show', 'cheating_impersonation', 'score_dispute', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    },
    evidenceUrl: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending'
    },
    resolutionNotes: {
      type: String,
      trim: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ match: 1 });
disputeSchema.index({ tournament: 1 });

export const Dispute = mongoose.model('Dispute', disputeSchema);
