import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Clock, ShieldCheck, KeyRound, ChevronRight } from 'lucide-react';
import { Modal } from '../common/Modal';

export const BracketViewer = ({ matches = [], onMatchClick }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const r = match.round || 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {});

  const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

  const getRoundTitle = (r, totalRounds) => {
    if (r === totalRounds) return 'Grand Final';
    if (r === totalRounds - 1) return 'Semifinals';
    if (r === totalRounds - 2) return 'Quarterfinals';
    return `Round of ${Math.pow(2, totalRounds - r + 1)}`;
  };

  const handleCardClick = (match) => {
    setSelectedMatch(match);
    if (onMatchClick) onMatchClick(match);
  };

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex items-stretch gap-8 min-w-[750px] px-2">
        {roundNumbers.map((roundNum) => {
          const roundMatches = rounds[roundNum];
          const title = getRoundTitle(roundNum, roundNumbers.length);

          return (
            <div key={roundNum} className="flex-1 flex flex-col">
              {/* Round Header */}
              <div className="text-center mb-6">
                <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-slate-800 text-purple-400 border border-slate-700/60">
                  {title}
                </span>
                <p className="text-[11px] text-slate-500 mt-1.5">{roundMatches.length} Match{roundMatches.length > 1 ? 'es' : ''}</p>
              </div>

              {/* Match Column with equidistant spacing */}
              <div className="flex-1 flex flex-col justify-around gap-6">
                {roundMatches.map((match) => {
                  const isTeam1Winner = match.winnerId && match.team1?.id === match.winnerId;
                  const isTeam2Winner = match.winnerId && match.team2?.id === match.winnerId;

                  return (
                    <div
                      key={match.id}
                      onClick={() => handleCardClick(match)}
                      className="group cursor-pointer bg-[#121624] hover:bg-[#181e33] border border-slate-800 hover:border-purple-500/60 rounded-xl p-3 shadow-md transition-all duration-200 relative"
                    >
                      {/* Match Header Tag */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 pb-1.5 border-b border-slate-800/80">
                        <span className="font-mono text-purple-400 font-semibold">Match #{match.matchNumber}</span>
                        <div className="flex items-center gap-1">
                          {match.status === 'completed' && (
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              Finished
                            </span>
                          )}
                          {match.status === 'scheduled' && (
                            <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> Scheduled
                            </span>
                          )}
                          {match.status === 'pending' && (
                            <span className="text-slate-500">TBD</span>
                          )}
                          {match.roomDetails && (
                            <span className="ml-1 p-0.5 bg-yellow-500/20 text-yellow-400 rounded" title="Room credentials attached">
                              <KeyRound className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Team 1 Slot */}
                      <div className={`flex items-center justify-between p-1.5 rounded-lg mb-1 transition ${
                        isTeam1Winner ? 'bg-purple-950/40 text-purple-200 font-bold border-l-2 border-purple-500' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          {match.team1?.logo ? (
                            <img src={match.team1.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                              ?
                            </div>
                          )}
                          <span className="text-xs truncate font-medium">
                            {match.team1?.name || 'TBD (Waiting)'}
                          </span>
                        </div>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isTeam1Winner ? 'text-purple-300 bg-purple-900/50' : 'text-slate-500'
                        }`}>
                          {match.status === 'completed' ? match.scores?.team1Score ?? 0 : '-'}
                        </span>
                      </div>

                      {/* Team 2 Slot */}
                      <div className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                        isTeam2Winner ? 'bg-purple-950/40 text-purple-200 font-bold border-l-2 border-purple-500' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          {match.team2?.logo ? (
                            <img src={match.team2.logo} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                              ?
                            </div>
                          )}
                          <span className="text-xs truncate font-medium">
                            {match.team2?.name || 'TBD (Waiting)'}
                          </span>
                        </div>
                        <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isTeam2Winner ? 'text-purple-300 bg-purple-900/50' : 'text-slate-500'
                        }`}>
                          {match.status === 'completed' ? match.scores?.team2Score ?? 0 : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Details Interactive Modal */}
      {selectedMatch && (
        <Modal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          title={`Match #${selectedMatch.matchNumber} Details • ${selectedMatch.roundName || 'Knockout'}`}
        >
          <div className="space-y-5">
            <div className="bg-[#0e121f] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex-1 text-center">
                <p className="text-base font-bold text-white">{selectedMatch.team1?.name || 'TBD'}</p>
                <p className="text-xs text-purple-400 font-mono mt-0.5">{selectedMatch.team1?.tag || ''}</p>
              </div>
              <div className="px-4 text-center">
                <span className="text-xl font-mono font-extrabold text-white">
                  {selectedMatch.status === 'completed' 
                    ? `${selectedMatch.scores?.team1Score} : ${selectedMatch.scores?.team2Score}` 
                    : 'VS'}
                </span>
                <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">{selectedMatch.status}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-base font-bold text-white">{selectedMatch.team2?.name || 'TBD'}</p>
                <p className="text-xs text-purple-400 font-mono mt-0.5">{selectedMatch.team2?.tag || ''}</p>
              </div>
            </div>

            {selectedMatch.scheduledAt && (
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Scheduled Time:
                </span>
                <span className="font-semibold text-slate-200">
                  {new Date(selectedMatch.scheduledAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            )}

            {/* Room Credentials Preview / Link */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-yellow-400" />
                  Room ID & Password Access
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Secure time-locked credentials for participating rosters.
                </p>
              </div>
              <Link
                to={`/matches/${selectedMatch.id}`}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition"
              >
                Go to Match Room
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
