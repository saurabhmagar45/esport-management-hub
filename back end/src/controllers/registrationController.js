import { Registration } from '../models/Registration.js';
import { Tournament } from '../models/Tournament.js';
import { Team } from '../models/Team.js';
import { Notification } from '../models/Notification.js';

export async function registerForTournament(req, res, next) {
  try {
    const { id } = req.params; // Tournament ID
    const { teamId, teamName, teamTag, roster = [] } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    // Check status
    if (tournament.status !== 'registration_open' && tournament.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Registrations are currently closed for this tournament.' });
    }

    // Check deadline
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has expired.' });
    }

    let finalTeamId = teamId;
    let finalTeamName = teamName;
    let finalTeamTag = teamTag;

    // Validate roster information
    if (!roster || roster.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Teammate details (Name, In-Game Name, Game ID, Email) are required to register.'
      });
    }

    for (let i = 0; i < roster.length; i++) {
      const member = roster[i];
      if (!member.name || !member.inGameName || !member.gameId || !member.email) {
        return res.status(400).json({
          success: false,
          message: `Teammate #${i + 1} is missing required fields. Please provide Full Name, In-Game Name, Game ID, and Email.`
        });
      }
    }

    // If an existing teamId was not passed, or team doesn't exist, create one
    if (!finalTeamId) {
      if (!teamName || !teamTag) {
        return res.status(400).json({ success: false, message: 'Please provide Team Name and Team Tag.' });
      }

      // Check if team already exists for this owner and game
      let team = await Team.findOne({
        owner: req.user._id,
        game: tournament.game,
        name: teamName
      });

      if (!team) {
        const inviteCode = (teamTag.toUpperCase().slice(0, 4) + '-' + Math.random().toString(36).substring(2, 6)).toUpperCase();
        team = await Team.create({
          name: teamName,
          tag: teamTag.toUpperCase().slice(0, 6),
          game: tournament.game,
          owner: req.user._id,
          inviteCode,
          members: roster.map(m => ({
            name: m.name,
            inGameName: m.inGameName,
            gameId: m.gameId,
            email: m.email,
            inGameId: m.gameId,
            role: 'Member'
          }))
        });
      }

      finalTeamId = team._id;
      finalTeamName = team.name;
      finalTeamTag = team.tag;
    } else {
      const existingTeam = await Team.findById(finalTeamId);
      if (existingTeam) {
        finalTeamName = existingTeam.name;
        finalTeamTag = existingTeam.tag;
      }
    }

    // Check duplicate registration
    const existing = await Registration.findOne({ tournament: id, team: finalTeamId });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This squad has already registered for this tournament.' });
    }

    const registration = await Registration.create({
      tournament: id,
      team: finalTeamId,
      teamName: finalTeamName,
      teamTag: finalTeamTag,
      submittedBy: req.user._id,
      roster,
      status: 'pending'
    });

    // Notify tournament organizer of new registration
    await Notification.create({
      recipient: tournament.organizer,
      type: 'registration_submitted',
      title: 'New Team Registration',
      message: `Team "${finalTeamName}" registered for "${tournament.name}". Pending your review.`,
      link: `/organizer/tournaments/${tournament._id}/registrations`
    });

    res.status(201).json({
      success: true,
      message: 'Squad registration with teammate details submitted for organizer review.',
      registration
    });
  } catch (err) {
    next(err);
  }
}

export async function getTournamentRegistrations(req, res, next) {
  try {
    const { id } = req.params;
    const registrations = await Registration.find({ tournament: id })
      .populate('team')
      .populate('submittedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (err) {
    next(err);
  }
}

export async function getMyRegistrations(req, res, next) {
  try {
    const registrations = await Registration.find({ submittedBy: req.user._id })
      .populate('tournament')
      .populate('team')
      .sort({ createdAt: -1 });

    res.json({ success: true, registrations });
  } catch (err) {
    next(err);
  }
}

export async function approveRegistration(req, res, next) {
  try {
    const { regId } = req.params;
    const registration = await Registration.findById(regId).populate('tournament team');

    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });

    const tournament = registration.tournament;

    // Check organizer authority
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to approve entries.' });
    }

    // Check remaining slot quota
    const approvedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: 'approved'
    });

    if (approvedCount >= tournament.maxTeams) {
      return res.status(400).json({ success: false, message: 'Cannot approve: Tournament slot capacity has been reached.' });
    }

    registration.status = 'approved';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    // Create Notification for Captain
    await Notification.create({
      recipient: registration.submittedBy,
      type: 'reg_approved',
      title: 'Squad Registration Approved! 🎉',
      message: `Your squad "${registration.teamName || registration.team?.name}" has been approved for "${tournament.name}". Get ready for the tournament!`,
      link: `/tournaments/${tournament._id}`
    });

    res.json({ success: true, message: 'Registration approved.', registration });
  } catch (err) {
    next(err);
  }
}

export async function rejectRegistration(req, res, next) {
  try {
    const { regId } = req.params;
    const { reason = 'Roster requirements not satisfied.' } = req.body;

    const registration = await Registration.findById(regId).populate('tournament team');
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found.' });

    const tournament = registration.tournament;
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
    }

    registration.status = 'rejected';
    registration.rejectionReason = reason;
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    // Create Notification for Captain
    await Notification.create({
      recipient: registration.submittedBy,
      type: 'reg_rejected',
      title: 'Squad Registration Update',
      message: `Registration for "${registration.teamName || registration.team?.name}" in "${tournament.name}" was rejected: ${reason}`,
      link: `/tournaments/${tournament._id}`
    });

    res.json({ success: true, message: 'Registration rejected.', registration });
  } catch (err) {
    next(err);
  }
}
