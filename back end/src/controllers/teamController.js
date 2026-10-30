import { Team } from '../models/Team.js';
import { Registration } from '../models/Registration.js';
import crypto from 'crypto';

export async function createTeam(req, res, next) {
  try {
    const { name, tag, game, logo } = req.body;

    if (!name || !tag || !game) {
      return res.status(400).json({ success: false, message: 'Team name, tag, and game are required.' });
    }

    // Generate unique invite code
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const inviteCode = `${tag.toUpperCase()}-${randomHex}`;

    const team = await Team.create({
      name,
      tag: tag.toUpperCase(),
      game,
      logo: logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100',
      owner: req.user._id,
      inviteCode,
      members: [
        {
          user: req.user._id,
          role: 'Captain',
          inGameId: req.user.gameProfiles?.bgmiIgn || req.user.gameProfiles?.freefireIgn || ''
        }
      ]
    });

    res.status(201).json({ success: true, team });
  } catch (err) {
    next(err);
  }
}

export async function getTeams(req, res, next) {
  try {
    const filter = {};
    if (req.query.myTeams === 'true') {
      filter.$or = [{ owner: req.user._id }, { 'members.user': req.user._id }];
    }

    const teams = await Team.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name avatar gameProfiles');

    res.json({ success: true, teams });
  } catch (err) {
    next(err);
  }
}

export async function getTeamById(req, res, next) {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name avatar gameProfiles');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    res.json({ success: true, team });
  } catch (err) {
    next(err);
  }
}

export async function joinTeam(req, res, next) {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ success: false, message: 'Please provide an invitation code.' });
    }

    const team = await Team.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid squad invitation code.' });
    }

    // Check if already a member
    const alreadyMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (alreadyMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this squad.' });
    }

    team.members.push({
      user: req.user._id,
      role: 'Member',
      inGameId: req.user.gameProfiles?.bgmiIgn || req.user.gameProfiles?.freefireIgn || ''
    });

    await team.save();
    res.json({ success: true, message: `Successfully joined ${team.name}!`, team });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const { id, userId } = req.params;
    const team = await Team.findById(id);

    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    // Only captain or admin can remove
    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the squad captain can remove members.' });
    }

    if (team.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'Captain cannot be removed. Transfer ownership instead.' });
    }

    team.members = team.members.filter(m => m.user.toString() !== userId);
    await team.save();

    res.json({ success: true, message: 'Squad member removed.', team });
  } catch (err) {
    next(err);
  }
}

export async function regenerateInviteCode(req, res, next) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only squad captain can regenerate invite code.' });
    }

    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    team.inviteCode = `${team.tag}-${randomHex}`;
    await team.save();

    res.json({ success: true, inviteCode: team.inviteCode });
  } catch (err) {
    next(err);
  }
}

// @desc Safely transfer team ownership to another active roster member
// @route POST /api/v1/teams/:id/transfer-ownership
export async function transferOwnership(req, res, next) {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    // Only current captain or admin can transfer ownership
    if (team.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the squad captain can transfer ownership.' });
    }

    // New owner must already be a member of the squad
    const memberTarget = team.members.find(m => m.user.toString() === newOwnerId);
    if (!memberTarget) {
      return res.status(400).json({ success: false, message: 'New captain must be an active member of this squad.' });
    }

    // Update roles
    team.owner = newOwnerId;
    team.members = team.members.map(m => {
      if (m.user.toString() === newOwnerId) {
        return { ...m.toObject(), role: 'Captain' };
      }
      if (m.user.toString() === req.user._id.toString()) {
        return { ...m.toObject(), role: 'Member' };
      }
      return m;
    });

    await team.save();

    res.json({
      success: true,
      message: 'Team ownership successfully transferred.',
      team
    });
  } catch (err) {
    next(err);
  }
}

// @desc Leave a team with active tournament constraint checks
// @route POST /api/v1/teams/:id/leave
export async function leaveTeam(req, res, next) {
  try {
    const { id } = req.params;
    const team = await Team.findById(id);

    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    const isMember = team.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'You are not a member of this squad.' });
    }

    // Captain cannot leave without transferring ownership first if other members exist
    if (team.owner.toString() === req.user._id.toString() && team.members.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'As squad captain, you must transfer ownership to a teammate before leaving.'
      });
    }

    // Check if team is registered in any active ongoing tournament
    const activeReg = await Registration.findOne({
      team: id,
      status: 'approved'
    }).populate('tournament');

    if (activeReg && activeReg.tournament && activeReg.tournament.status === 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave squad while participating in an active ongoing tournament competition.'
      });
    }

    team.members = team.members.filter(m => m.user.toString() !== req.user._id.toString());
    await team.save();

    res.json({
      success: true,
      message: `You have successfully left squad ${team.name}.`
    });
  } catch (err) {
    next(err);
  }
}

