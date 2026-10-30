import { Match } from '../models/Match.js';
import { Tournament } from '../models/Tournament.js';

/**
 * Determine the next power of 2 greater than or equal to n
 */
function nextPowerOfTwo(n) {
  let count = 1;
  while (count < n) count *= 2;
  return count;
}

function getRoundName(roundNum, totalRounds) {
  if (roundNum === totalRounds) return 'Grand Final';
  if (roundNum === totalRounds - 1) return 'Semifinals';
  if (roundNum === totalRounds - 2) return 'Quarterfinals';
  return `Round of ${Math.pow(2, totalRounds - roundNum + 1)}`;
}

/**
 * Deterministically generates single-elimination tournament fixtures
 * @param {string} tournamentId - Tournament MongoDB ObjectId
 * @param {Array<string>} teamIds - Array of approved Team ObjectIds
 * @returns {Promise<Array>} Created match documents
 */
export async function generateSingleEliminationBracket(tournamentId, teamIds) {
  if (!teamIds || teamIds.length < 2) {
    throw new Error('Single-elimination bracket requires at least 2 approved teams.');
  }

  // Clear existing matches for this tournament to prevent duplicate generation
  await Match.deleteMany({ tournament: tournamentId });

  const numTeams = teamIds.length;
  const bracketSize = nextPowerOfTwo(numTeams);
  const totalRounds = Math.log2(bracketSize);
  const numByes = bracketSize - numTeams;

  // Create matches structure round by round, working backwards from Finals to link nextMatch
  const matchesByRound = {};

  // Step 1: Pre-create placeholder match nodes from Grand Final (Round totalRounds) down to Round 1
  for (let r = totalRounds; r >= 1; r--) {
    const matchesInRound = Math.pow(2, totalRounds - r);
    matchesByRound[r] = [];

    for (let m = 1; m <= matchesInRound; m++) {
      matchesByRound[r].push({
        tournament: tournamentId,
        round: r,
        roundName: getRoundName(r, totalRounds),
        matchNumber: m,
        team1: null,
        team2: null,
        scheduledAt: null,
        status: 'pending',
        scores: { team1Score: 0, team2Score: 0 },
        winner: null,
        nextMatch: null,
        nextMatchSlot: null
      });
    }
  }

  // Step 2: Link nextMatch relationships
  for (let r = 1; r < totalRounds; r++) {
    for (let m = 0; m < matchesByRound[r].length; m++) {
      const parentMatchIndex = Math.floor(m / 2);
      const slot = (m % 2 === 0) ? 1 : 2;
      matchesByRound[r][m]._parentRound = r + 1;
      matchesByRound[r][m]._parentIndex = parentMatchIndex;
      matchesByRound[r][m].nextMatchSlot = slot;
    }
  }

  // Step 3: Populate Round 1 & Byes
  // Teams with Byes go directly into Round 2; remainder play in Round 1
  const round1MatchesCount = bracketSize / 2;
  const initialSlots = new Array(bracketSize).fill(null);

  // Distribute teams into seeds
  for (let i = 0; i < numTeams; i++) {
    initialSlots[i] = teamIds[i];
  }

  // Assign teams to Round 1 matches
  for (let m = 0; m < round1MatchesCount; m++) {
    const t1 = initialSlots[m * 2] || null;
    const t2 = initialSlots[m * 2 + 1] || null;

    matchesByRound[1][m].team1 = t1;
    matchesByRound[1][m].team2 = t2;

    // If one team has a bye (t2 is null), t1 auto-wins
    if (t1 && !t2) {
      matchesByRound[1][m].winner = t1;
      matchesByRound[1][m].status = 'completed';
      matchesByRound[1][m].scores = { team1Score: 1, team2Score: 0 };
    } else if (t1 && t2) {
      matchesByRound[1][m].status = 'scheduled';
    }
  }

  // Step 4: Persist in MongoDB from Finals backwards to obtain ObjectIds for nextMatch
  const savedMatchesByRound = {};

  for (let r = totalRounds; r >= 1; r--) {
    savedMatchesByRound[r] = [];

    for (let m = 0; m < matchesByRound[r].length; m++) {
      const matchData = matchesByRound[r][m];

      if (r < totalRounds) {
        const parentSaved = savedMatchesByRound[r + 1][matchData._parentIndex];
        matchData.nextMatch = parentSaved._id;
      }

      delete matchData._parentRound;
      delete matchData._parentIndex;

      const createdMatch = await Match.create(matchData);
      savedMatchesByRound[r].push(createdMatch);
    }
  }

  // Step 5: Advance any bye winners into Round 2
  const round1Matches = savedMatchesByRound[1];
  for (const m1 of round1Matches) {
    if (m1.winner && m1.nextMatch) {
      const nextMatchDoc = await Match.findById(m1.nextMatch);
      if (nextMatchDoc) {
        if (m1.nextMatchSlot === 1) nextMatchDoc.team1 = m1.winner;
        if (m1.nextMatchSlot === 2) nextMatchDoc.team2 = m1.winner;
        if (nextMatchDoc.team1 && nextMatchDoc.team2) {
          nextMatchDoc.status = 'scheduled';
        }
        await nextMatchDoc.save();
      }
    }
  }

  // Update Tournament status to 'ongoing'
  await Tournament.findByIdAndUpdate(tournamentId, { status: 'ongoing' });

  // Return flat list of all tournament matches
  return await Match.find({ tournament: tournamentId }).populate('team1 team2 winner');
}

/**
 * Record match score and advance winner safely to next bracket round
 */
export async function advanceMatchWinner(matchId, { team1Score, team2Score, winnerTeamId, actorUserId }) {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found.');

  if (!match.team1 || !match.team2) {
    throw new Error('Both teams must be determined before recording final results.');
  }

  const validWinner = match.team1.toString() === winnerTeamId || match.team2.toString() === winnerTeamId;
  if (!validWinner) {
    throw new Error('Declared winner must be one of the participating teams.');
  }

  // Record scores and winner
  match.scores = { team1Score: Number(team1Score), team2Score: Number(team2Score) };
  match.winner = winnerTeamId;
  match.status = 'completed';
  match.resultPublishedAt = new Date();
  await match.save();

  // If next match exists, advance winner into assigned slot
  if (match.nextMatch) {
    const nextMatch = await Match.findById(match.nextMatch);
    if (nextMatch) {
      if (match.nextMatchSlot === 1) nextMatch.team1 = winnerTeamId;
      if (match.nextMatchSlot === 2) nextMatch.team2 = winnerTeamId;

      if (nextMatch.team1 && nextMatch.team2) {
        nextMatch.status = 'scheduled';
      }
      await nextMatch.save();
    }
  } else {
    // Grand Final completed! Mark Tournament as completed
    await Tournament.findByIdAndUpdate(match.tournament, { status: 'completed' });
  }

  return await Match.findById(matchId).populate('team1 team2 winner');
}
