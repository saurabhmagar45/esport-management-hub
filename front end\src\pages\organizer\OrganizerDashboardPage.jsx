import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI } from '../../services/api';
import { GameBadge } from '../../components/common/GameBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Trophy, 
  Plus, 
  Users, 
  KeyRound, 
  GitBranch, 
  AlertCircle,
  Loader2,
  Megaphone,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announceModalOpen, setAnnounceModalOpen] = useState(false);
  const [targetTourn, setTargetTourn] = useState(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annSuccess, setAnnSuccess] = useState(false);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!targetTourn || !annTitle || !annContent) return;
    try {
      await tournamentsAPI.addAnnouncement(targetTourn._id || targetTourn.id, {
        title: annTitle,
        content: annContent
      });
      setAnnSuccess(true);
      setTimeout(() => {
        setAnnounceModalOpen(false);
        setAnnSuccess(false);
        setAnnTitle('');
        setAnnContent('');
        setTargetTourn(null);
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post announcement.');
    }
  };

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const res = await tournamentsAPI.list();
      if (res.data && res.data.success) {
        setTournaments(res.data.tournaments || []);
      }
    } catch (err) {
      console.warn('API error loading organizer competitions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const totalTournaments = tournaments.length;
  const activeTournaments = tournaments.filter(t => t.status === 'ongoing').length;
  const openTournaments = tournaments.filter(t => t.status === 'registration_open').length;
  const totalPending = tournaments.reduce((acc, t) => acc + (t.pendingCount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 uppercase">
              Organizer Operations Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Tournament Control Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Host events across BGMI, Free Fire, Valorant, COD, and Football. Review squad rosters, accept/reject registrations, and publish room credentials.
          </p>
        </div>

        <Link
          to="/organizer/tournaments/create"
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 whitespace-nowrap transition duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Host New Tournament</span>
        </Link>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Hosted</span>
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-mono font-black text-white mt-2">{totalTournaments}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total competitions</p>
        </div>

        <div className="bg-[#121624] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Active & Live</span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <p className="text-2xl font-mono font-black text-cyan-400 mt-2">{activeTournaments}</p>
          <p className="text-[11px] text-slate-500 mt-1">In progress matches</p>
        </div>

        <div className="bg-[#121624] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Registration Open</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-black text-emerald-400 mt-2">{openTournaments}</p>
          <p className="text-[11px] text-slate-500 mt-1">Accepting squad entries</p>
        </div>

        <div className="bg-[#121624] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pending Reviews</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-mono font-black text-amber-400 mt-2">{totalPending}</p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting roster decision</p>
        </div>
      </div>

      {/* Main Tournament Management Table */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Your Managed Competitions</h2>
            <p className="text-xs text-slate-400">Review team applications, release Room ID & Password, and update bracket scores</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span>Loading tournaments...</span>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <p className="text-sm">You haven't hosted any tournaments yet.</p>
            <Link
              to="/organizer/tournaments/create"
              className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              Create Your First Tournament
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Tournament Title</th>
                  <th className="pb-3 font-semibold">Game Discipline</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Approved Slots</th>
                  <th className="pb-3 font-semibold">Match Timing</th>
                  <th className="pb-3 font-semibold text-right">Operations & Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tournaments.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4">
                      <div className="font-bold text-white text-sm">{t.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Starts: {new Date(t.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4">
                      <GameBadge game={t.game} size="sm" />
                    </td>
                    <td className="py-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 font-mono font-semibold text-slate-300">
                      {t.registeredCount || 0} / {t.maxTeams} Teams
                      {t.pendingCount > 0 && (
                        <span className="ml-1.5 text-[10px] text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/30">
                          {t.pendingCount} pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-semibold text-cyan-400">
                      {t.matchTiming || '6:00 PM IST'}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/organizer/tournaments/${t._id || t.id}/registrations`}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition"
                          title="Review Squad Registrations"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Review Squads</span>
                        </Link>

                        <Link
                          to={`/organizer/tournaments/${t._id || t.id}/room`}
                          className="px-3 py-1.5 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black font-semibold text-xs flex items-center gap-1 transition"
                          title="Room ID & Password Vault"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Room Key</span>
                        </Link>

                        <Link
                          to={`/tournaments/${t._id || t.id}`}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition"
                          title="View Tournament Page"
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </Link>

                        <button
                          onClick={() => {
                            setTargetTourn(t);
                            setAnnounceModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center gap-1 transition"
                          title="Broadcast Announcement"
                        >
                          <Megaphone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {targetTourn && (
        <Modal
          isOpen={announceModalOpen}
          onClose={() => setAnnounceModalOpen(false)}
          title={`Publish Announcement • ${targetTourn.name}`}
        >
          {annSuccess ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-sm font-bold text-white">Announcement Published!</h4>
              <p className="text-xs text-slate-400">
                All registered players will see this update in the tournament overview tab.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <p className="text-xs text-slate-400">
                Broadcast official schedule revisions, match instructions, or lobby notices directly to competing squads.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Lobby 1 Kickoff at 6:00 PM"
                  className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Announcement Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Provide complete instructions for teams..."
                  className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnounceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Broadcast Live
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};
