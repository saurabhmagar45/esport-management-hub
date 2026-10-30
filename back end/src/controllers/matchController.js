import { Match } from '../models/Match.js';
import { Tournament } from '../models/Tournament.js';
import { Registration } from '../models/Registration.js';
import { RoomDetails } from '../models/RoomDetails.js';
import { generateSingleEliminationBracket, advanceMatchWinner } from '../services/bracketEngine.js';

export async function generateBracket(req, res, next) {
  try {
    const { id } = req.params; // Tournament ID
    const tournament = await Tournament.findById(id);

    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    // Validate authority
    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this tournament.' });
    }

    // Fetch approved teams
    const approvedRegistrations = await Registration.find({
      tournament: id,
      status: 'approved'
    }).populate('team');

    if (approvedRegistrations.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate bracket: Minimum 2 approved squads are required.'
      });
    }

    const teamIds = approvedRegistrations.map(r => r.team._id);
    const matches = await generateSingleEliminationBracket(id, teamIds);

    res.json({
      success: true,
      message: `Deterministic single-elimination bracket generated with ${matches.length} matches.`,
      matches
    });
  } catch (err) {
    next(err);
  }
}

export async function getTournamentMatches(req, res, next) {
  try {
    const { id } = req.params;
    const matches = await Match.find({ tournament: id })
      .populate('team1 team2 winner')
      .sort({ round: 1, matchNumber: 1 });

    res.json({ success: true, matches });
  } catch (err) {
    next(err);
  }
}

export async function getMatchById(req, res, next) {
  try {
    const match = await Match.findById(req.params.id)
      .populate({
        path: 'team1',
        populate: { path: 'members.user owner', select: 'name email avatar gameProfiles' }
      })
      .populate({
        path: 'team2',
        populate: { path: 'members.user owner', select: 'name email avatar gameProfiles' }
      })
      .populate('winner tournament');

    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    // Check if room details exist (without revealing encrypted password)
    const room = await RoomDetails.findOne({ match: match._id });
    const matchObj = match.toObject();

    if (room) {
      matchObj.roomMeta = {
        releaseAt: room.releaseAt,
        accessStatus: room.accessStatus,
        isReleased: room.accessStatus === 'published' && new Date() >= new Date(room.releaseAt)
      };
    }

    res.json({ success: true, match: matchObj });
  } catch (err) {
    next(err);
  }
}

export async function scheduleMatch(req, res, next) {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const match = await Match.findById(id).populate('tournament');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    if (match.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    match.scheduledAt = new Date(scheduledAt);
    match.status = 'scheduled';
    await match.save();

    res.json({ success: true, message: 'Match scheduled.', match });
  } catch (err) {
    next(err);
  }
}

export async function submitMatchResults(req, res, next) {
  try {
    const { id } = req.params;
    const { team1Score, team2Score, winnerTeamId } = req.body;

    const match = await Match.findById(id).populate('tournament');
    if (!match) return res.status(404).json({ success: false, message: 'Match not found.' });

    if (match.tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Not authorized.' });
    }

    const updatedMatch = await advanceMatchWinner(id, {
      team1Score,
      team2Score,
      winnerTeamId,
      actorUserId: req.user._id
    });

    res.json({
      success: true,
      message: 'Result finalized and winner advanced to subsequent round.',
      match: updatedMatch
    });
  } catch (err) {
    next(err);
  }
}
