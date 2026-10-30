import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    inGameName: { type: String, default: '' },
    gameId: { type: String, default: '' },
    email: { type: String, default: '' },
    role: {
      type: String,
      default: 'Member'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inGameId: { type: String, default: '' },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: 60
    },
    tag: {
      type: String,
      required: [true, 'Team tag is required'],
      trim: true,
      uppercase: true,
      maxlength: 8
    },
    game: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    members: [memberSchema],
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    stats: {
      played: { type: Number, default: 0 },
      won: { type: Number, default: 0 },
      winRate: { type: String, default: '0%' }
    }
  },
  { timestamps: true }
);

export const Team = mongoose.model('Team', teamSchema);
