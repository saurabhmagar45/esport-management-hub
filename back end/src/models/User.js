import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['player', 'organizer', 'admin'],
      default: 'player',
      index: true
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'
    },
    gameProfiles: {
      bgmiId: { type: String, default: '' },
      bgmiIgn: { type: String, default: '' },
      freefireUid: { type: String, default: '' },
      freefireIgn: { type: String, default: '' }
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true
    }
  },
  { timestamps: true }
);

// Method to verify password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Transform to remove sensitive hash before JSON transmission
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model('User', userSchema);
