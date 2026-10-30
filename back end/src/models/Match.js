import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true
    },
    round: {
      type: Number,
      required: true
    },
    roundName: {
      type: String,
      default: 'Knockout'
    },
    matchNumber: {
      type: Number,
      required: true
    },
    team1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    team2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    scheduledAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'live', 'completed', 'cancelled'],
      default: 'pending'
    },
    scores: {
      team1Score: { type: Number, default: 0 },
      team2Score: { type: Number, default: 0 }
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null
    },
    nextMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null
    },
    nextMatchSlot: {
      type: Number,
      enum: [1, 2]
    },
    resultPublishedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const Match = mongoose.model('Match', matchSchema);
