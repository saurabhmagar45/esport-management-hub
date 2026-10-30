import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_TOURNAMENTS, MOCK_MATCHES } from '../../data/mockData';
import { matchesAPI, tournamentsAPI } from '../../services/api';
import { BracketViewer } from '../../components/tournaments/BracketViewer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  GitBranch, 
  ListOrdered, 
  KeyRound, 
  ArrowLeft, 
  Edit3, 
  Loader2,
  RefreshCw
} from 'lucide-react';

export const MatchCenterPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(
    () => MOCK_TOURNAMENTS.find(t => t.id === id || t._id === id) || MOCK_TOURNAMENTS[0]
  );
  const [matches, setMatches] = useState(
    () => MOCK_MATCHES.filter(m => m.tournamentId === tournament.id || m.tournament === tournament._id)
  );
  const [activeView, setActiveView] = useState('bracket');
  const [loading, setLoading] = useState(false);

  // Score Submit Modal
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [targetMatch, setTargetMatch] = useState(null);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [savingScore, setSavingScore] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const tournRes = await tournamentsAPI.get(id);
      if (tournRes.data && tournRes.data.success) {
        setTournament(tournRes.data.tournament);
      }
      const res = await matchesAPI.getMatches(id);
      if (res.data && res.data.success && res.data.matches.length > 0) {
        setMatches(res.data.matches);
      }
    } catch (err) {
      console.warn('API sync fallback for match center:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [id]);

  const handleOpenScore = (match) => {
    setTargetMatch(match);
    setTeam1Score(match.scores?.team1Score || 0);
    setTeam2Score(match.scores?.team2Score || 0);
    const defaultWinner = match.winnerId || match.winner?._id || match.team1?.id || match.team1?._id || '';
    setSelectedWinnerId(defaultWinner);
    setScoreModalOpen(true);
  };

  const handleSaveScore = async (e) => {
    e.preventDefault();
    if (!targetMatch) return;

    setSavingScore(true);
    try {
      await matchesAPI.submitResults(targetMatch._id || targetMatch.id, {
        team1Score: Number(team1Score),
        team2Score: Number(team2Score),
        winnerTeamId: selectedWinnerId
      });
      // Refresh matches from API to reflect bracket advancement
      await fetchMatches();
    } catch (err) {
      console.warn('API fallback for score recording:', err.message);
      setMatches(prev => prev.map(m => {
        if ((m.id === targetMatch.id) || (m._id === targetMatch._id)) {
          return {
            ...m,
            status: 'completed',
            scores: { team1Score: Number(team1Score), team2Score: Number(team2Score) },
            winnerId: selectedWinnerId
          };
        }
        return m;
      }));
    } finally {
      setSavingScore(false);
      setScoreModalOpen(false);
      setTargetMatch(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs font-mono font-bold text-purple-400 uppercase">Match Operations & Knockout Tree</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{tournament.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish live scores, manage match schedules, and view automatic winner advancements in the bracket
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Refresh Fixtures"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center bg-[#0c0e18] border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveView('bracket')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
                activeView === 'bracket' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Bracket View
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
                activeView === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              Matches Table
            </button>
            <button
              onClick={() => setActiveView('standings')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition ${
                activeView === 'standings' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Standings Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* Standings View */}
      {activeView === 'standings' && (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Overall Tournament Standings</h3>
              <p className="text-xs text-slate-400">Manage ranks, matches played, kills, and points visible to all registered players</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const current = tournament.standings || [];
                const updated = [...current, { rank: current.length + 1, teamName: `Team ${current.length + 1}`, teamTag: 'TAG', matchesPlayed: 1, wins: 0, kills: 0, points: 0 }];
                tournamentsAPI.updateStandings(id, updated).then(fetchMatches);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
            >
              + Add Standings Row
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Team Name</th>
                  <th className="py-2.5 px-3">Tag</th>
                  <th className="py-2.5 px-3">Matches</th>
                  <th className="py-2.5 px-3">Wins</th>
                  <th className="py-2.5 px-3">Kills</th>
                  <th className="py-2.5 px-3">Points</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(tournament.standings || []).map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-mono font-bold text-purple-400">#{row.rank || idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.teamName}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].teamName = e.target.value;
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-white"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.teamTag}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].teamTag = e.target.value.toUpperCase();
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="w-16 px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={row.matchesPlayed || 0}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].matchesPlayed = Number(e.target.value);
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="w-14 px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={row.wins || 0}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].wins = Number(e.target.value);
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="w-14 px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-emerald-400 font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={row.kills || 0}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].kills = Number(e.target.value);
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="w-14 px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-cyan-400 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={row.points || 0}
                        onChange={(e) => {
                          const updated = [...tournament.standings];
                          updated[idx].points = Number(e.target.value);
                          setTournament({ ...tournament, standings: updated });
                        }}
                        className="w-16 px-2 py-1 bg-[#0c0e18] border border-slate-700 rounded text-xs text-yellow-400 font-mono font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = tournament.standings.filter((_, i) => i !== idx);
                          setTournament({ ...tournament, standings: updated });
                          tournamentsAPI.updateStandings(id, updated);
                        }}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                tournamentsAPI.updateStandings(id, tournament.standings || []).then(() => {
                  alert('Standings published and updated for all registered players!');
                });
              }}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              Save & Publish Standings
            </button>
          </div>
        </div>
      )}

      {/* Bracket View */}
      {activeView === 'bracket' ? (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Single Elimination Knockout</h3>
              <p className="text-xs text-slate-400">Click any match to submit verified scores or inspect room passwords</p>
            </div>
          </div>

          <BracketViewer matches={matches} onMatchClick={(m) => handleOpenScore(m)} />
        </div>
      ) : (
        /* Match Table View */
        <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a2b] text-slate-400">
                  <th className="py-3.5 px-6 font-semibold">Match ID</th>
                  <th className="py-3.5 px-4 font-semibold">Round</th>
                  <th className="py-3.5 px-4 font-semibold">Team 1</th>
                  <th className="py-3.5 px-4 font-semibold">Team 2</th>
                  <th className="py-3.5 px-4 font-semibold">Score</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matches.map((m) => (
                  <tr key={m.id || m._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6 font-mono font-bold text-purple-400">
                      #{m.matchNumber}
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-200">
                      {m.roundName || `Round ${m.round}`}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {m.team1?.name || 'TBD'}
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {m.team2?.name || 'TBD'}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-yellow-400">
                      {m.status === 'completed' ? `${m.scores?.team1Score} - ${m.scores?.team2Score}` : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenScore(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Score</span>
                        </button>
                        <Link
                          to={`/organizer/matches/${m.id || m._id}/room`}
                          className="px-2.5 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black font-semibold flex items-center gap-1 transition"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Room</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Score Modal */}
      {targetMatch && (
        <Modal
          isOpen={scoreModalOpen}
          onClose={() => setScoreModalOpen(false)}
          title={`Publish Match Score • Match #${targetMatch.matchNumber}`}
        >
          <form onSubmit={handleSaveScore} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0c0e18] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-white block mb-1">{targetMatch.team1?.name || 'Team 1'}</span>
                <label className="text-[10px] text-slate-500 block mb-1">Score / Kills</label>
                <input
                  type="number"
                  min="0"
                  value={team1Score}
                  onChange={(e) => setTeam1Score(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <div className="bg-[#0c0e18] p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-white block mb-1">{targetMatch.team2?.name || 'Team 2'}</span>
                <label className="text-[10px] text-slate-500 block mb-1">Score / Kills</label>
                <input
                  type="number"
                  min="0"
                  value={team2Score}
                  onChange={(e) => setTeam2Score(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Designated Winner (Advances to Next Round)
              </label>
              <select
                value={selectedWinnerId}
                onChange={(e) => setSelectedWinnerId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {targetMatch.team1 && (
                  <option value={targetMatch.team1._id || targetMatch.team1.id}>
                    {targetMatch.team1.name} (Winner)
                  </option>
                )}
                {targetMatch.team2 && (
                  <option value={targetMatch.team2._id || targetMatch.team2.id}>
                    {targetMatch.team2.name} (Winner)
                  </option>
                )}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScoreModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingScore}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                {savingScore && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Publish Result & Advance
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
