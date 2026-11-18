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
import { encryptPassword } from './crypto.js';

export async function seedDatabase() {
  try {
    // Check if Single Master Admin already exists
    let admin = await User.findOne({ email: 'admin@esporthub.gg' });

    if (!admin) {
      console.log('🌱 Seeding initial Master Admin account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      admin = await User.create({
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

    // If no tournaments exist, seed active showcase tournaments for BGMI and Free Fire
    const tournamentCount = await Tournament.countDocuments();
    if (tournamentCount === 0 && admin) {
      console.log('🌱 Seeding initial showcase tournaments...');
      const now = new Date();
      const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
      const in4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const room1 = encryptPassword('BGMI#PRO99');
      const room2 = encryptPassword('FF#FIRE2026');

      await Tournament.create([
        {
          name: 'BGMI Masters Battle Royale Championship',
          slug: 'bgmi-masters-battle-royale-championship',
          game: 'BGMI',
          gameMode: 'Squad Battle Royale',
          description: 'Official BGMI squad tournament. 16 teams battle across Erangel & Miramar for a ₹50,000 cash prize pool.',
          banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
          organizer: admin._id,
          format: 'single_elimination',
          teamSize: 'squad',
          teamMemberCount: 4,
          maxTeams: 16,
          entryFee: 0,
          currency: 'INR',
          prizePool: 50000,
          prizeDistribution: [
            { place: '1st Place', amount: 30000 },
            { place: '2nd Place', amount: 15000 },
            { place: '3rd Place', amount: 5000 }
          ],
          rules: '1. Mobile devices only. Emulators prohibited. 2. In-game room credentials reveal 5 minutes before kickoff.',
          matchTiming: 'Daily 7:00 PM IST',
          numberOfMatches: 4,
          registrationStart: now,
          registrationDeadline: in2Days,
          startDate: in4Hours,
          status: 'registration_open',
          roomInfo: {
            roomId: '7482910',
            encryptedPassword: room1.ciphertext,
            iv: room1.iv,
            releaseAt: now,
            instructions: 'Slot 1 to 16 by seed number. Screen recording mandatory for team captains.',
            accessStatus: 'published'
          }
        },
        {
          name: 'Free Fire MAX Clash Squad Invitational',
          slug: 'free-fire-max-clash-squad-invitational',
          game: 'Free Fire',
          gameMode: 'Clash Squad 4v4',
          description: 'High-stakes Free Fire MAX Clash Squad knockout event. Fast-paced 4v4 duels on Bermuda.',
          banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200',
          organizer: admin._id,
          format: 'single_elimination',
          teamSize: 'squad',
          teamMemberCount: 4,
          maxTeams: 8,
          entryFee: 0,
          currency: 'INR',
          prizePool: 25000,
          prizeDistribution: [
            { place: '1st Place', amount: 18000 },
            { place: '2nd Place', amount: 7000 }
          ],
          rules: '1. Standard Clash Squad tournament competitive preset. 2. Room password unlocked for registered squads.',
          matchTiming: '8:30 PM IST',
          numberOfMatches: 3,
          registrationStart: now,
          registrationDeadline: in2Days,
          startDate: in4Hours,
          status: 'registration_open',
          roomInfo: {
            roomId: '5519283',
            encryptedPassword: room2.ciphertext,
            iv: room2.iv,
            releaseAt: now,
            instructions: 'Bermuda map. Character skills active. No gun attributes.',
            accessStatus: 'published'
          }
        }
      ]);
      console.log('✅ Showcase tournaments seeded successfully.');
    }
  } catch (err) {
    console.error('Error during initial seed check:', err.message);
  }
}
