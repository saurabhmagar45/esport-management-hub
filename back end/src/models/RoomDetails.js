import mongoose from 'mongoose';

const roomDetailsSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: false,
      sparse: true,
      index: true
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true
    },
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      trim: true
    },
    encryptedPassword: {
      type: String,
      required: [true, 'Encrypted password is required']
    },
    iv: {
      type: String,
      required: [true, 'Encryption IV is required']
    },
    releaseAt: {
      type: Date,
      required: true
    },
    instructions: {
      type: String,
      default: ''
    },
    accessStatus: {
      type: String,
      enum: ['scheduled', 'published', 'revoked'],
      default: 'published'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const RoomDetails = mongoose.model('RoomDetails', roomDetailsSchema);
