import { RoomDetails } from '../models/RoomDetails.js';
import { Match } from '../models/Match.js';
import { Tournament } from '../models/Tournament.js';
import { Notification } from '../models/Notification.js';
import { encryptPassword, decryptPassword } from '../utils/crypto.js';

export async function setRoomDetails(req, res, next) {
  try {
    const { id } = req.params; // Match ID
    const { roomId, password, releaseAt, instructions } = req.body;

    if (!roomId || !password || !releaseAt) {
      return res.status(400).json({ success: false, message: 'Room ID, password, and release time are required.' });
    }

    const match = await Match.findById(id).populate('tournament');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    // Validate organizer/admin
    if (match.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this tournament.' });
    }

    // Encrypt password with AES-256 and dynamic IV
    const { ciphertext, iv } = encryptPassword(password);

    let room = await RoomDetails.findOne({ match: id });

    if (room) {
      room.roomId = roomId;
      room.encryptedPassword = ciphertext;
      room.iv = iv;
      room.releaseAt = new Date(releaseAt);
      room.instructions = instructions || '';
      room.accessStatus = 'published';
      await room.save();
    } else {
      room = await RoomDetails.create({
        match: id,
        tournament: match.tournament._id,
        roomId,
        encryptedPassword: ciphertext,
        iv,
        releaseAt: new Date(releaseAt),
        instructions: instructions || '',
        accessStatus: 'published',
        createdBy: req.user._id
      });
    }

    res.json({
      success: true,
      message: 'Room credentials securely encrypted and published.',
      releaseAt: room.releaseAt,
      accessStatus: room.accessStatus
    });
  } catch (err) {
    next(err);
  }
}

export async function getRoomDetails(req, res, next) {
  try {
    const { id } = req.params; // Match ID
    const match = await Match.findById(id)
      .populate('team1 team2 tournament');

    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    const room = await RoomDetails.findOne({ match: id });
    if (!room) {
      return res.status(404).json({ success: false, message: 'No custom room credentials configured for this match.' });
    }

    const isOrganizer = match.tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Organizers and Admins have unrestricted inspection access
    if (isOrganizer || isAdmin) {
      const plaintextPassword = decryptPassword(room.encryptedPassword, room.iv);
      return res.json({
        success: true,
        roomId: room.roomId,
        password: plaintextPassword,
        instructions: room.instructions,
        releaseAt: room.releaseAt,
        accessStatus: room.accessStatus
      });
    }

    // For Players: Verify membership of Team 1 or Team 2
    const userInTeam1 = match.team1 && (
      match.team1.owner.toString() === req.user._id.toString() ||
      match.team1.members?.some(m => m.user.toString() === req.user._id.toString())
    );

    const userInTeam2 = match.team2 && (
      match.team2.owner.toString() === req.user._id.toString() ||
      match.team2.members?.some(m => m.user.toString() === req.user._id.toString())
    );

    if (!userInTeam1 && !userInTeam2) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not an active member of any team participating in this match.'
      });
    }

    // Check revocation
    if (room.accessStatus === 'revoked') {
      return res.status(403).json({
        success: false,
        message: 'Access to room credentials has been revoked by tournament officials.'
      });
    }

    // Check time-lock gating
    const now = new Date();
    if (now < new Date(room.releaseAt)) {
      return res.status(403).json({
        success: false,
        message: `Room credentials are time-locked. They will be released at ${room.releaseAt.toISOString()}.`,
        releaseAt: room.releaseAt
      });
    }

    // Player authorized and time released! Decrypt credentials
    const plaintextPassword = decryptPassword(room.encryptedPassword, room.iv);

    res.json({
      success: true,
      roomId: room.roomId,
      password: plaintextPassword,
      instructions: room.instructions,
      releaseAt: room.releaseAt
    });
  } catch (err) {
    next(err);
  }
}

export async function toggleRevokeRoom(req, res, next) {
  try {
    const { id } = req.params;
    const match = await Match.findById(id).populate('tournament');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    if (match.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const room = await RoomDetails.findOne({ match: id });
    if (!room) return res.status(404).json({ success: false, message: 'Room not configured.' });

    room.accessStatus = room.accessStatus === 'revoked' ? 'published' : 'revoked';
    await room.save();

    res.json({ success: true, accessStatus: room.accessStatus });
  } catch (err) {
    next(err);
  }
}
