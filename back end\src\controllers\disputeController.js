import { Dispute } from '../models/Dispute.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';

// @desc Submit a new match dispute or issue
// @route POST /api/v1/disputes
export const createDispute = async (req, res, next) => {
  try {
    const { matchId, tournamentId, teamId, issueType, description, evidenceUrl } = req.body;

    if (!description || description.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Description is required to file a report' });
    }

    const dispute = await Dispute.create({
      reportedBy: req.user._id,
      match: matchId || null,
      tournament: tournamentId || null,
      team: teamId || null,
      issueType: issueType || 'other',
      description,
      evidenceUrl: evidenceUrl || null
    });

    // Notify admins / referees
    await Notification.create({
      recipient: req.user._id,
      type: 'system_alert',
      title: 'Dispute Filed Successfully',
      message: `Your report regarding issue "${issueType || 'other'}" was submitted to platform officials.`,
      actionUrl: '/dashboard'
    });

    res.status(201).json({
      success: true,
      message: 'Dispute submitted successfully to tournament officials',
      dispute
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all disputes (Admins & Organizers)
// @route GET /api/v1/disputes
export const getDisputes = async (req, res, next) => {
  try {
    const { status, tournamentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (tournamentId) query.tournament = tournamentId;

    const disputes = await Dispute.find(query)
      .populate('reportedBy', 'name email avatar')
      .populate('match', 'round matchNumber scheduledAt')
      .populate('tournament', 'name game')
      .populate('team', 'name tag')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (error) {
    next(error);
  }
};

// @desc Resolve or update dispute status
// @route PATCH /api/v1/disputes/:id
export const resolveDispute = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    dispute.status = status || dispute.status;
    if (resolutionNotes) dispute.resolutionNotes = resolutionNotes;
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();

    await dispute.save();

    // Audit log
    await AuditLog.create({
      action: 'RESOLVE_DISPUTE',
      performedBy: req.user._id,
      targetType: 'Dispute',
      targetId: dispute._id,
      details: { status: dispute.status, resolutionNotes }
    });

    // Notify reporter
    await Notification.create({
      recipient: dispute.reportedBy,
      type: 'system_alert',
      title: `Dispute ${dispute.status.toUpperCase()}`,
      message: `Your reported issue has been marked as ${dispute.status}: ${resolutionNotes || 'Reviewed by admin.'}`,
      actionUrl: '/dashboard'
    });

    res.json({
      success: true,
      message: `Dispute marked as ${dispute.status}`,
      dispute
    });
  } catch (error) {
    next(error);
  }
};
