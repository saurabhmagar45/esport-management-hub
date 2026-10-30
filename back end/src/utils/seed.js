import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Tournament } from '../models/Tournament.js';
import { Registration } from '../models/Registration.js';
import { Match } from '../models/Match.js';
import { RoomDetails } from '../models/RoomDetails.js';
import { Notification } from '../models/Notification.js';
import { Dispute } from '../models/Dispute.js';
import { Payment } from '../models/Payment.js';
import { AuditLog } from '../models/AuditLog.js';

export async function seedDatabase() {
  console.log('🧹 Purging all demo and mock datasets from database...');

  await Promise.all([
    User.deleteMany({}),
    Team.deleteMany({}),
    Tournament.deleteMany({}),
    Registration.deleteMany({}),
    Match.deleteMany({}),
    RoomDetails.deleteMany({}),
    Notification.deleteMany({}),
    Dispute.deleteMany({}),
    Payment.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  // Seed Single Master Admin ONLY
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const admin = await User.create({
    name: 'Master Admin',
    email: 'admin@esporthub.gg',
    passwordHash,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    gameProfiles: {}
  });

  console.log(`✅ Single Master Admin initialized: ${admin.email} (Password: password123)`);
  console.log('✨ System initialized with ZERO demo data: ready for real players and organizers!');
}
