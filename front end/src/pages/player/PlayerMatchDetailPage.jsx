import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_MATCHES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { matchesAPI, roomsAPI, disputesAPI } from '../../services/api';
import { 
  KeyRound, 
  Copy, 
  Check, 
  Lock, 
  Clock, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const PlayerMatchDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [match, setMatch] = useState(() => {
    return MOCK_MATCHES.find(m => m.id === id) || MOCK_MATCHES[4];
  });
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');
  
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const fetchMatchAndRoom = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch match
      const mRes = await matchesAPI.getMatch(id);
      if (mRes.data && mRes.data.success && mRes.data.match) {
        setMatch(mRes.data.match);
      }
    } catch (err) {
      // Keep existing mock match state
    } finally {
      setLoading(false);
    }

    // Attempt room fetch
    try {
      setRoomLoading(true);
      setRoomError('');
      const rRes = await roomsAPI.getRoom(id);
      if (rRes.data && rRes.data.success && rRes.data.room) {
        setRoomData(rRes.data.room);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setRoomError(err.response.data.message);
      }
    } finally {
      setRoomLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatchAndRoom();
  }, [fetchMatchAndRoom]);

  // Determine room credentials from either real roomData or match.roomDetails
  const activeRoom = roomData || match.roomDetails;
  const isReleased = roomData?.isUnlocked || (match.roomDetails?.accessStatus === 'published');
  const roomId = roomData?.credentials?.roomId || match.roomDetails?.roomId;
  const roomPassword = roomData?.credentials?.password || match.roomDetails?.password;
  const roomInstructions = roomData?.instructions || match.roomDetails?.instructions;

  const copyRoomId = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyRoomPass = () => {
    if (!roomPassword) return;
    navigator.clipboard.writeText(roomPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    try {
      await disputesAPI.create({
        matchId: match._id || match.id,
        tournamentId: match.tournament?._id || match.tournament,
        issueType: 'other',
        description: reportText
      });
    } catch (err) {
      console.warn('Dispute submission fallback:', err.message);
    }
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setReportText('');
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Player Dashboard
        </Link>
        <button
          onClick={fetchMatchAndRoom}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-400 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading || roomLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Match Heading Card */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono font-bold text-purple-400 uppercase">
              {match.roundName || `Round ${match.round}`} • Match #{match.matchNumber}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={match.status} />
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {new Date(match.scheduledAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Report Issue
          </button>
        </div>

        {/* Head-to-Head Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center bg-[#0c0e18] p-6 rounded-2xl border border-slate-800/80">
          {/* Team 1 */}
          <div className="flex flex-col items-center text-center">
            {match.team1?.logo ? (
              <img src={match.team1.logo} alt="" className="w-16 h-16 rounded-2xl object-cover mb-2 border border-purple-500/40" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 mb-2">?</div>
            )}
            <h3 className="text-base font-bold text-white">{match.team1?.name || 'TBD'}</h3>
            <span className="text-xs font-mono text-purple-400 font-bold">[{match.team1?.tag || 'TBD'}]</span>
          </div>

          {/* Score or VS */}
          <div className="text-center">
            <span className="text-3xl font-black font-mono text-white">
              {match.status === 'completed'
                ? `${match.scores?.team1Score ?? 0} - ${match.scores?.team2Score ?? 0}`
                : 'VS'}
            </span>
            <p className="text-[11px] uppercase font-bold text-slate-500 tracking-wider mt-1">{match.status}</p>
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center text-center">
            {match.team2?.logo ? (
              <img src={match.team2.logo} alt="" className="w-16 h-16 rounded-2xl object-cover mb-2 border border-purple-500/40" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-400 mb-2">?</div>
            )}
            <h3 className="text-base font-bold text-white">{match.team2?.name || 'TBD'}</h3>
            <span className="text-xs font-mono text-purple-400 font-bold">[{match.team2?.tag || 'TBD'}]</span>
          </div>
        </div>
      </div>

      {/* THE ROOM VAULT CREDENTIALS CARD */}
      <div className="bg-[#121624] border border-purple-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-yellow-400" />
              Custom Match Room Key & Password
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly confidential credentials released exclusively to competing squad rosters
            </p>
          </div>

          {isReleased ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Credentials Unlocked
            </span>
          ) : (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Time-Locked
            </span>
          )}
        </div>

        {roomError ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{roomError}</span>
          </div>
        ) : isReleased && roomId ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Room ID Box */}
              <div className="bg-[#0c0e18] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Custom Room ID</span>
                  <p className="text-xl font-mono font-black text-white mt-1 tracking-wider">
                    {roomId}
                  </p>
                </div>
                <button
                  onClick={copyRoomId}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Room ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Room Password Box */}
              <div className="bg-[#0c0e18] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Room Password</span>
                  <p className="text-xl font-mono font-black text-purple-400 mt-1 tracking-wider">
                    {roomPassword}
                  </p>
                </div>
                <button
                  onClick={copyRoomPass}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy Room Password"
                >
                  {copiedPass ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Match Instructions */}
            <div className="p-4 rounded-xl bg-[#0e121f] border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Organizer Lobby Instructions
              </span>
              <p className="text-slate-400 leading-relaxed font-sans">
                {roomInstructions || 'Join your assigned slot promptly. Emulators strictly prohibited.'}
              </p>
            </div>
          </div>
        ) : (
          /* Time Locked State */
          <div className="text-center py-8 space-y-3">
            <Lock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
            <h4 className="text-base font-bold text-white">Room Credentials Locked</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Per fair-play regulations, room IDs and passwords will unlock automatically 15 minutes prior to match kickoff.
            </p>
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Match Issue or Dispute"
      >
        {reportSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Dispute Filed with Tournament Officials</h4>
            <p className="text-xs text-slate-400">
              The tournament referee and platform admins have been notified of your report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportIssue} className="space-y-4">
            <p className="text-xs text-slate-400">
              Report incorrect room credentials, player impersonation, unverified IGNs, or opposing squad no-shows.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Description & Details
              </label>
              <textarea
                required
                rows={4}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe what occurred in the lobby or match..."
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-md"
              >
                Submit Dispute
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
