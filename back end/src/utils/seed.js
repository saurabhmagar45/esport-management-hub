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
  try {
    // Check if Single Master Admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@esporthub.gg' });

    if (!existingAdmin) {
      console.log('🌱 Seeding initial Master Admin account...');
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

      console.log(`✅ Master Admin initialized: ${admin.email} (Password: password123)`);
    } else {
      console.log('✅ Master Admin account verified. Preserving existing users and database state.');
    }
  } catch (err) {
    console.error('Error during initial seed check:', err.message);
  }
}
