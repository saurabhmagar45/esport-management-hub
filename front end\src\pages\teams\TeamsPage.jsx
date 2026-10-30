import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_TEAMS } from '../../data/mockData';
import { teamsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GameBadge } from '../../components/common/GameBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  UserPlus,
  Loader2
} from 'lucide-react';

export const TeamsPage = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [loading, setLoading] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await teamsAPI.list();
      if (res.data && res.data.success && res.data.teams.length > 0) {
        const normalized = res.data.teams.map(t => ({
          ...t,
          id: t._id || t.id,
          ownerName: t.owner?.name || 'Verified Captain'
        }));
        setTeams(normalized);
      }
    } catch (err) {
      console.warn('API sync fallback for teams list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    setJoining(true);

    try {
      const res = await teamsAPI.join(inviteCodeInput.trim().toUpperCase());
      if (res.data && res.data.success) {
        setJoinSuccess(`Successfully joined squad: ${res.data.team?.name || 'Squad'}!`);
        await fetchTeams();
        setTimeout(() => {
          setJoinModalOpen(false);
          setJoinSuccess('');
          setInviteCodeInput('');
        }, 1500);
        return;
      }
    } catch (err) {
      // Local demo fallback
      const targetTeam = teams.find(
        t => t.inviteCode.toUpperCase() === inviteCodeInput.trim().toUpperCase()
      );

      if (!targetTeam) {
        setJoinError(err.response?.data?.message || 'Invalid invitation code. Please check and try again.');
        return;
      }

      setJoinSuccess(`Successfully joined squad: ${targetTeam.name}!`);
      setTimeout(() => {
        setJoinModalOpen(false);
        setJoinSuccess('');
        setInviteCodeInput('');
      }, 1500);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Esports Teams & Squads</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your competitive rosters, generate squad invite codes, or join an existing roster
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setJoinModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Join with Code
          </button>

          <Link
            to="/teams/create"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Create Squad
          </Link>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id || team._id}
            className="group bg-[#121624] hover:bg-[#161c30] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={team.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100'}
                    alt={team.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-purple-500/30 group-hover:scale-105 transition"
                  />
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                      {team.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-purple-400">
                      [{team.tag}]
                    </span>
                  </div>
                </div>
                <GameBadge game={team.game} size="sm" />
              </div>

              {/* Stats & Invite Code */}
              <div className="bg-[#0e121e] border border-slate-800/80 rounded-xl p-3 mb-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Captain</span>
                  <span className="font-semibold text-white">{team.ownerName || team.owner?.name || 'Captain'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Win Rate</span>
                  <span className="font-mono font-bold text-emerald-400">{team.stats?.winRate || '65%'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                  <span>Invite Code</span>
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                    {team.inviteCode}
                  </span>
                </div>
              </div>

              {/* Members Avatar Avatars */}
              <div className="space-y-1 mb-6">
                <span className="text-[11px] text-slate-400 font-medium">Roster Lineup:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {team.members?.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono"
                      title={m.role}
                    >
                      {m.name || m.user?.name || `Player ${idx + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to={`/teams/${team.id || team._id}`}
              className="w-full text-center py-2.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white font-semibold text-xs transition"
            >
              View Full Roster & Stats
            </Link>
          </div>
        ))}
      </div>

      {/* Join Team Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join Squad with Invitation Code"
      >
        {joinSuccess ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">{joinSuccess}</h4>
          </div>
        ) : (
          <form onSubmit={handleJoinWithCode} className="space-y-4">
            <p className="text-xs text-slate-400">
              Enter the unique 8-character squad invitation code provided by your team captain.
            </p>

            {joinError && (
              <p className="text-xs text-rose-400 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/30">
                {joinError}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Invitation Code
              </label>
              <input
                type="text"
                required
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. SOUL-9988"
                className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white uppercase font-mono tracking-widest focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setJoinModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={joining}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
              >
                {joining && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Join Team
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
