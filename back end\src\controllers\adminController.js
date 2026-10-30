import { User } from '../models/User.js';
import { Tournament } from '../models/Tournament.js';
import { Match } from '../models/Match.js';
import { AuditLog } from '../models/AuditLog.js';

export async function getAdminStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ status: 'ongoing' });
    const totalMatches = await Match.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTournaments,
        activeTournaments,
        totalMatches
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend administrator accounts.' });
    }

    user.accountStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    await user.save();

    await AuditLog.create({
      action: user.accountStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      actor: req.user._id,
      targetType: 'User',
      targetId: user._id,
      details: { email: user.email, newStatus: user.accountStatus }
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function cancelTournamentByAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Mandatory reason required for moderation cancellation.' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    tournament.status = 'cancelled';
    await tournament.save();

    await AuditLog.create({
      action: 'TOURNAMENT_MODERATION_CANCELLED',
      actor: req.user._id,
      targetType: 'Tournament',
      targetId: tournament._id,
      details: { name: tournament.name, reason }
    });

    res.json({ success: true, message: 'Tournament cancelled by admin moderation.', tournament });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
}
