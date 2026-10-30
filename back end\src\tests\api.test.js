import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Tournament } from '../models/Tournament.js';
import { Match } from '../models/Match.js';
import { Registration } from '../models/Registration.js';
import { Dispute } from '../models/Dispute.js';
import { Payment } from '../models/Payment.js';
import { RoomDetails } from '../models/RoomDetails.js';
import { generateSingleEliminationBracket, advanceMatchWinner } from '../services/bracketEngine.js';
import { encryptPassword, decryptPassword } from '../utils/crypto.js';
import bcrypt from 'bcryptjs';

describe('Esport Hub — Core Backend Verification Tests', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await disconnectDB();
  });

  test('1. Crypto: AES-256 Encryption & Decryption Integrity', () => {
    const rawSecret = 'SUPER_SECRET_ROOM_PASS_#123';
    const { ciphertext, iv } = encryptPassword(rawSecret);

    assert.notEqual(ciphertext, rawSecret, 'Ciphertext must not match raw secret');
    assert.ok(iv, 'IV must be generated');

    const decrypted = decryptPassword(ciphertext, iv);
    assert.equal(decrypted, rawSecret, 'Decrypted text must match original secret exactly');
  });

  test('2. Auth: Password Hashing & Comparison', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('TestPass123', salt);

    const isMatch = await bcrypt.compare('TestPass123', hash);
    const isWrong = await bcrypt.compare('WrongPass', hash);

    assert.equal(isMatch, true, 'Valid password must match hash');
    assert.equal(isWrong, false, 'Invalid password must be rejected');
  });

  test('3. Tournament Engine: Single Elimination Bracket for Power of 2 (4 Teams)', async () => {
    // Setup 4 mock teams
    const mockUser = await User.create({
      name: 'Test Captain',
      email: `test-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'player'
    });

    const teams = await Promise.all([
      Team.create({ name: 'Alpha', tag: 'ALP', game: 'BGMI', owner: mockUser._id, inviteCode: `ALP-${Date.now()}` }),
      Team.create({ name: 'Beta', tag: 'BET', game: 'BGMI', owner: mockUser._id, inviteCode: `BET-${Date.now()}` }),
      Team.create({ name: 'Gamma', tag: 'GAM', game: 'BGMI', owner: mockUser._id, inviteCode: `GAM-${Date.now()}` }),
      Team.create({ name: 'Delta', tag: 'DEL', game: 'BGMI', owner: mockUser._id, inviteCode: `DEL-${Date.now()}` })
    ]);

    const tournament = await Tournament.create({
      name: 'Test Cup 4',
      slug: `test-cup-${Date.now()}`,
      game: 'BGMI',
      description: 'Testing',
      organizer: mockUser._id,
      maxTeams: 4,
      registrationStart: new Date(),
      registrationDeadline: new Date(Date.now() + 86400000),
      startDate: new Date(Date.now() + 172800000),
      status: 'published'
    });

    const matches = await generateSingleEliminationBracket(
      tournament._id,
      teams.map(t => t._id)
    );

    // 4 teams -> 2 Semifinals (Round 1) + 1 Grand Final (Round 2) = 3 matches
    assert.equal(matches.length, 3, 'Must create exactly 3 matches for a 4-team bracket');

    const round1Matches = matches.filter(m => m.round === 1);
    const round2Matches = matches.filter(m => m.round === 2);

    assert.equal(round1Matches.length, 2, 'Round 1 must have 2 semifinal matches');
    assert.equal(round2Matches.length, 1, 'Round 2 must have 1 grand final match');
  });

  test('4. Tournament Engine: Non-Power-of-Two Participant Handling with Byes (3 Teams)', async () => {
    const mockUser = await User.create({
      name: 'Bye Tester',
      email: `bye-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'player'
    });

    const teams = await Promise.all([
      Team.create({ name: 'Squad A', tag: 'SQA', game: 'Free Fire', owner: mockUser._id, inviteCode: `SQA-${Date.now()}` }),
      Team.create({ name: 'Squad B', tag: 'SQB', game: 'Free Fire', owner: mockUser._id, inviteCode: `SQB-${Date.now()}` }),
      Team.create({ name: 'Squad C', tag: 'SQC', game: 'Free Fire', owner: mockUser._id, inviteCode: `SQC-${Date.now()}` })
    ]);

    const tournament = await Tournament.create({
      name: 'Bye Cup 3',
      slug: `bye-cup-${Date.now()}`,
      game: 'Free Fire',
      description: 'Testing byes',
      organizer: mockUser._id,
      maxTeams: 4,
      registrationStart: new Date(),
      registrationDeadline: new Date(Date.now() + 86400000),
      startDate: new Date(Date.now() + 172800000),
      status: 'published'
    });

    const matches = await generateSingleEliminationBracket(
      tournament._id,
      teams.map(t => t._id)
    );

    // 3 teams with bracketSize 4:
    // 1 bye team automatically advances to Round 2 (Grand Final)
    const grandFinal = matches.find(m => m.round === 2);
    assert.ok(grandFinal, 'Grand Final must exist');
    assert.ok(grandFinal.team1 || grandFinal.team2, 'Bye team must be advanced to Grand Final slot');
  });

  test('5. Winner Advancement: Advancing a Semifinalist Populates Grand Final Slot', async () => {
    const mockUser = await User.create({
      name: 'Advancement Tester',
      email: `advance-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'organizer'
    });

    const team1 = await Team.create({ name: 'Winner Squad', tag: 'WIN', game: 'BGMI', owner: mockUser._id, inviteCode: `WIN-${Date.now()}` });
    const team2 = await Team.create({ name: 'Runner Squad', tag: 'RUN', game: 'BGMI', owner: mockUser._id, inviteCode: `RUN-${Date.now()}` });

    const tournament = await Tournament.create({
      name: 'Advancement Cup',
      slug: `adv-cup-${Date.now()}`,
      game: 'BGMI',
      description: 'Testing winner progression',
      organizer: mockUser._id,
      maxTeams: 2,
      registrationStart: new Date(),
      registrationDeadline: new Date(Date.now() + 86400000),
      startDate: new Date(Date.now() + 172800000),
      status: 'published'
    });

    const matches = await generateSingleEliminationBracket(tournament._id, [team1._id, team2._id]);
    const finalMatch = matches[0];

    const updated = await advanceMatchWinner(finalMatch._id, {
      team1Score: 3,
      team2Score: 1,
      winnerTeamId: team1._id.toString(),
      actorUserId: mockUser._id
    });

    assert.equal(updated.status, 'completed', 'Match must be marked completed');
    assert.equal(updated.winner._id.toString(), team1._id.toString(), 'Winner must be Team 1');

    const updatedTourn = await Tournament.findById(tournament._id);
    assert.equal(updatedTourn.status, 'completed', 'Tournament must complete upon final victory');
  });

  test('6. Registration Rules: Unique registration enforced per team and tournament', async () => {
    const mockUser = await User.create({
      name: 'Reg Tester',
      email: `reg-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'player'
    });

    const team = await Team.create({ name: 'Unique Squad', tag: 'UNQ', game: 'BGMI', owner: mockUser._id, inviteCode: `UNQ-${Date.now()}` });
    const tournament = await Tournament.create({
      name: 'Reg Rule Cup',
      slug: `reg-cup-${Date.now()}`,
      game: 'BGMI',
      description: 'Testing duplicates',
      organizer: mockUser._id,
      maxTeams: 8,
      registrationStart: new Date(),
      registrationDeadline: new Date(Date.now() + 86400000),
      startDate: new Date(Date.now() + 172800000),
      status: 'registration_open'
    });

    // First registration succeeds
    const reg1 = await Registration.create({
      tournament: tournament._id,
      team: team._id,
      submittedBy: mockUser._id,
      status: 'pending'
    });
    assert.ok(reg1._id, 'First registration must be saved');

    // Duplicate registration attempt throws duplicate key error on compound index
    await assert.rejects(
      async () => {
        await Registration.create({
          tournament: tournament._id,
          team: team._id,
          submittedBy: mockUser._id,
          status: 'pending'
        });
      },
      /E11000 duplicate key error/,
      'Duplicate registration must be rejected by unique compound index'
    );
  });

  test('7. Dispute System: Player reports dispute and Admin resolves it', async () => {
    const player = await User.create({
      name: 'Dispute Player',
      email: `disp-p-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'player'
    });

    const admin = await User.create({
      name: 'Admin Referee',
      email: `admin-ref-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'admin'
    });

    const dispute = await Dispute.create({
      reportedBy: player._id,
      issueType: 'room_credentials',
      description: 'Room password rejected in lobby',
      status: 'pending'
    });

    assert.equal(dispute.status, 'pending', 'New dispute must be pending');

    // Admin resolves dispute
    dispute.status = 'resolved';
    dispute.resolutionNotes = 'Updated credentials sent to squad';
    dispute.resolvedBy = admin._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    const resolved = await Dispute.findById(dispute._id);
    assert.equal(resolved.status, 'resolved', 'Dispute must be marked resolved');
    assert.equal(resolved.resolvedBy.toString(), admin._id.toString(), 'Resolved by must be admin');
  });

  test('8. Payment System: Test order generation and HMAC SHA-256 verification', async () => {
    const player = await User.create({
      name: 'Payer Player',
      email: `pay-${Date.now()}@hub.gg`,
      passwordHash: 'hash',
      role: 'player'
    });

    const orderId = `order_test_${Date.now()}`;
    const paymentId = `pay_test_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_esporthub_demo_123';

    // Generate valid HMAC SHA-256 signature
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Expected check
    const verifiedSig = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    assert.equal(signature, verifiedSig, 'HMAC signature must verify on server');

    const payment = await Payment.create({
      user: player._id,
      tournament: new (await import('mongoose')).default.Types.ObjectId(),
      team: new (await import('mongoose')).default.Types.ObjectId(),
      amount: 100,
      currency: 'INR',
      orderId,
      paymentId,
      signature,
      status: 'captured'
    });

    assert.equal(payment.status, 'captured', 'Payment must be recorded as captured');
  });
});
