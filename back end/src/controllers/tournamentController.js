import { Tournament } from '../models/Tournament.js';
import { Registration } from '../models/Registration.js';
import { Match } from '../models/Match.js';
import { encryptPassword, decryptPassword } from '../utils/crypto.js';

export async function getTournaments(req, res, next) {
  try {
    const { game, status, search, sort = 'startDate', page = 1, limit = 50 } = req.query;
    const filter = {};

    if (game && game !== 'all') {
      filter.game = { $regex: new RegExp(`^${game}$`, 'i') };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let sortOption = { startDate: 1 };
    if (sort === 'prizeHigh') sortOption = { prizePool: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tournament.countDocuments(filter);

    // Compute approved registrations count for each tournament
    const results = await Promise.all(
      tournaments.map(async (t) => {
        const approvedCount = await Registration.countDocuments({
          tournament: t._id,
          status: 'approved'
        });
        const pendingCount = await Registration.countDocuments({
          tournament: t._id,
          status: 'pending'
        });
        const obj = t.toObject();
        obj.registeredCount = approvedCount;
        obj.pendingCount = pendingCount;
        return obj;
      })
    );

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1,
      tournaments: results
    });
  } catch (err) {
    next(err);
  }
}

export async function getTournamentById(req, res, next) {
  try {
    const { id } = req.params;
    let tournament;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tournament = await Tournament.findById(id).populate('organizer', 'name email avatar');
    } else {
      tournament = await Tournament.findOne({ slug: id }).populate('organizer', 'name email avatar');
    }

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const approvedCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: 'approved'
    });
    const pendingCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: 'pending'
    });

    const obj = tournament.toObject();
    obj.registeredCount = approvedCount;
    obj.pendingCount = pendingCount;

    // Mask room password from public payload
    if (obj.roomInfo) {
      const isOwner = req.user && (tournament.organizer._id.toString() === req.user._id.toString() || req.user.role === 'admin');
      if (!isOwner) {
        delete obj.roomInfo.encryptedPassword;
        delete obj.roomInfo.iv;
        obj.roomInfo.hasPassword = !!tournament.roomInfo?.encryptedPassword;
      }
    }

    res.json({ success: true, tournament: obj });
  } catch (err) {
    next(err);
  }
}

export async function createTournament(req, res, next) {
  try {
    const {
      name,
      game,
      gameMode = 'Squad Battle Royale',
      description,
      banner,
      format = 'single_elimination',
      teamSize = 'squad',
      teamMemberCount = 4,
      maxTeams = 16,
      matchTiming = '6:00 PM IST',
      numberOfMatches = 3,
      rules = '',
      registrationStart,
      registrationDeadline,
      startDate,
      status = 'registration_open'
    } = req.body;

    if (!name || !game || !description || !registrationStart || !registrationDeadline || !startDate) {
      return res.status(400).json({ success: false, message: 'All date and configuration fields are required.' });
    }

    const regStartDate = new Date(registrationStart);
    const regDeadlineDate = new Date(registrationDeadline);
    const tournStartDate = new Date(startDate);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const tournament = await Tournament.create({
      name,
      slug,
      game,
      gameMode,
      description,
      banner: banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200',
      organizer: req.user._id,
      format,
      teamSize,
      teamMemberCount: Number(teamMemberCount) || 4,
      maxTeams: Number(maxTeams) || 16,
      entryFee: 0, // All tournaments are free; no entry fee option
      currency: 'INR',
      prizePool: 0,
      prizeDistribution: [],
      matchTiming,
      numberOfMatches: Number(numberOfMatches) || 3,
      rules: rules || '1. Fair play rules apply. 2. Room ID & Password released 5 minutes before start.',
      registrationStart: regStartDate,
      registrationDeadline: regDeadlineDate,
      startDate: tournStartDate,
      status
    });

    res.status(201).json({ success: true, tournament });
  } catch (err) {
    next(err);
  }
}

export async function updateTournament(req, res, next) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not own this tournament.' });
    }

    // Ensure entryFee remains 0
    if (req.body.entryFee !== undefined) req.body.entryFee = 0;

    Object.assign(tournament, req.body);
    await tournament.save();

    res.json({ success: true, tournament });
  } catch (err) {
    next(err);
  }
}

export async function addAnnouncement(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Announcement title and content are required.' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the tournament organizer can post announcements.' });
    }

    tournament.announcements = tournament.announcements || [];
    tournament.announcements.unshift({
      title,
      content,
      createdAt: new Date()
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      announcements: tournament.announcements
    });
  } catch (err) {
    next(err);
  }
}

// @desc Set or update Tournament-Level Room ID & Password (5 min release)
// @route POST /api/v1/tournaments/:id/room
export async function setTournamentRoom(req, res, next) {
  try {
    const { id } = req.params;
    const { roomId, password, releaseAt, instructions } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ success: false, message: 'Room ID and Password are required.' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not authorized to set room credentials.' });
    }

    const { ciphertext, iv } = encryptPassword(password);

    // Default release time to 5 minutes before tournament kickoff if not specified
    const calculatedReleaseAt = releaseAt
      ? new Date(releaseAt)
      : new Date(new Date(tournament.startDate).getTime() - 5 * 60 * 1000);

    tournament.roomInfo = {
      roomId,
      encryptedPassword: ciphertext,
      iv,
      releaseAt: calculatedReleaseAt,
      instructions: instructions || 'Join designated lobby slot. Mobile only.',
      accessStatus: 'published'
    };

    await tournament.save();

    res.json({
      success: true,
      message: 'Room credentials securely encrypted and scheduled for release 5 minutes before match start.',
      roomId: tournament.roomInfo.roomId,
      releaseAt: tournament.roomInfo.releaseAt,
      instructions: tournament.roomInfo.instructions
    });
  } catch (err) {
    next(err);
  }
}

// @desc Retrieve Tournament-Level Room ID & Password (released <= 5 min before start)
// @route GET /api/v1/tournaments/:id/room
export async function getTournamentRoom(req, res, next) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    if (!tournament.roomInfo || !tournament.roomInfo.roomId) {
      return res.status(404).json({
        success: false,
        message: 'Organizer has not configured Room ID and Password for this tournament yet.'
      });
    }

    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Organizer or Admin can inspect immediately
    if (isOrganizer || isAdmin) {
      const plaintext = decryptPassword(tournament.roomInfo.encryptedPassword, tournament.roomInfo.iv);
      return res.json({
        success: true,
        roomId: tournament.roomInfo.roomId,
        password: plaintext,
        instructions: tournament.roomInfo.instructions,
        releaseAt: tournament.roomInfo.releaseAt,
        isReleased: true
      });
    }

    // Check if player has an approved registration in this tournament
    const approvedReg = await Registration.findOne({
      tournament: tournament._id,
      submittedBy: req.user._id,
      status: 'approved'
    });

    if (!approvedReg) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Room credentials are only visible to approved registered squads.'
      });
    }

    // Check 5-minute timed release
    const now = new Date();
    const releaseTime = new Date(tournament.roomInfo.releaseAt);

    if (now < releaseTime) {
      return res.status(403).json({
        success: false,
        message: `Room credentials will unlock 5 minutes prior to match start (${releaseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`,
        releaseAt: tournament.roomInfo.releaseAt,
        isReleased: false
      });
    }

    // Timed release unlocked! Decrypt credentials
    const plaintext = decryptPassword(tournament.roomInfo.encryptedPassword, tournament.roomInfo.iv);

    res.json({
      success: true,
      roomId: tournament.roomInfo.roomId,
      password: plaintext,
      instructions: tournament.roomInfo.instructions,
      releaseAt: tournament.roomInfo.releaseAt,
      isReleased: true
    });
  } catch (err) {
    next(err);
  }
}

// @desc Get or update tournament standings
// @route GET /api/v1/tournaments/:id/standings
export async function getTournamentStandings(req, res, next) {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    res.json({
      success: true,
      standings: tournament.standings || []
    });
  } catch (err) {
    next(err);
  }
}

// @desc Update tournament standings by organizer
// @route PUT /api/v1/tournaments/:id/standings
export async function updateTournamentStandings(req, res, next) {
  try {
    const { id } = req.params;
    const { standings } = req.body;

    const tournament = await Tournament.findById(id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    tournament.standings = standings || [];
    await tournament.save();

    res.json({
      success: true,
      message: 'Overall tournament standings updated successfully.',
      standings: tournament.standings
    });
  } catch (err) {
    next(err);
  }
}
