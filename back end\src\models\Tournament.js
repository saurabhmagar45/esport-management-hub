import mongoose from 'mongoose';

const standingItemSchema = new mongoose.Schema(
  {
    rank: { type: Number, default: 1 },
    teamName: { type: String, required: true },
    teamTag: { type: String, default: '' },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  { _id: false }
);

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament title is required'],
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    game: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      index: true
    },
    gameMode: {
      type: String,
      default: 'Squad Battle Royale',
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    format: {
      type: String,
      default: 'single_elimination'
    },
    teamSize: {
      type: String,
      default: 'squad'
    },
    teamMemberCount: {
      type: Number,
      default: 4
    },
    maxTeams: {
      type: Number,
      required: true,
      min: 2,
      max: 128
    },
    entryFee: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    prizePool: {
      type: Number,
      default: 0
    },
    prizeDistribution: [
      {
        place: { type: String },
        amount: { type: Number }
      }
    ],
    rules: {
      type: String,
      default: ''
    },
    matchTiming: {
      type: String,
      default: '6:00 PM IST',
      trim: true
    },
    numberOfMatches: {
      type: Number,
      default: 3
    },
    announcements: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    roomInfo: {
      roomId: { type: String, default: '' },
      encryptedPassword: { type: String, default: '' },
      iv: { type: String, default: '' },
      releaseAt: { type: Date },
      instructions: { type: String, default: '' },
      accessStatus: {
        type: String,
        enum: ['scheduled', 'published', 'revoked'],
        default: 'scheduled'
      }
    },
    standings: [standingItemSchema],
    registrationStart: {
      type: Date,
      required: true
    },
    registrationDeadline: {
      type: Date,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: [
        'draft',
        'published',
        'registration_open',
        'registration_closed',
        'ongoing',
        'completed',
        'cancelled'
      ],
      default: 'registration_open',
      index: true
    }
  },
  { timestamps: true }
);

export const Tournament = mongoose.model('Tournament', tournamentSchema);
