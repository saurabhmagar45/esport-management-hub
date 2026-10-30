import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_TEAMS, MOCK_REGISTRATIONS } from '../../data/mockData';
import { teamsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GameBadge } from '../../components/common/GameBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  Copy, 
  Check, 
  RotateCcw, 
  UserMinus, 
  ArrowLeft,
  LogOut,
  Crown,
  Loader2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const TeamDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const initialTeam = MOCK_TEAMS.find(t => t.id === id || t._id === id) || MOCK_TEAMS[0];
  const [team, setTeam] = useState(initialTeam);
  const [copiedCode, setCopiedCode] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedNewCaptain, setSelectedNewCaptain] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const res = await teamsAPI.get(id);
        if (res.data && res.data.success) {
          const t = res.data.team;
          setTeam({
            ...t,
            id: t._id || t.id,
            ownerName: t.owner?.name || 'Verified Captain'
          });
        }
      } catch (err) {
        console.warn('API sync fallback for team detail:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [id]);

  const isCaptain = (team.ownerId === user?.id || team.owner === user?.id || team.owner?._id === user?.id || user?.role === 'admin');

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerateCode = async () => {
    try {
      const res = await teamsAPI.regenerateCode(team._id || team.id);
      if (res.data && res.data.success) {
        setTeam(prev => ({ ...prev, inviteCode: res.data.inviteCode }));
        return;
      }
    } catch (e) {}

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newCode = `${team.tag}-${randomPart}`;
    setTeam(prev => ({ ...prev, inviteCode: newCode }));
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await teamsAPI.removeMember(team._id || team.id, memberToRemove.user?._id || memberToRemove.id);
    } catch (e) {}

    setTeam(prev => ({
      ...prev,
      members: prev.members.filter(m => (m.id !== memberToRemove.id && m.user?._id !== memberToRemove.user?._id))
    }));
    setRemoveModalOpen(false);
    setMemberToRemove(null);
  };

  const handleLeaveTeam = async () => {
    try {
      await teamsAPI.leave(team._id || team.id);
      navigate('/teams');
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Could not leave team at this time.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedNewCaptain) return;
    try {
      const res = await teamsAPI.transferOwnership(team._id || team.id, selectedNewCaptain);
      if (res.data && res.data.success) {
        setTeam(res.data.team);
      }
      setTransferModalOpen(false);
      setSelectedNewCaptain('');
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Could not transfer ownership.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  const teamRegistrations = MOCK_REGISTRATIONS.filter(
    r => r.team?.id === team.id || r.team?._id === team._id
  );

  const eligibleNewCaptains = team.members?.filter(
    m => (m.user?._id || m.id) !== (team.owner?._id || team.owner || team.ownerId)
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to All Teams
      </Link>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          {feedbackMsg}
        </div>
      )}

      {/* Team Profile Banner */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={team.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150'}
            alt=""
            className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GameBadge game={team.game} size="sm" />
              <span className="text-xs font-mono font-bold text-purple-400">
                [{team.tag}]
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{team.name}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Squad Captain: <strong className="text-white">{team.ownerName || team.owner?.name || 'Verified Captain'}</strong>
            </p>
          </div>
        </div>

        {/* Invitation Code Pill */}
        <div className="bg-[#0c0e18] border border-slate-800 rounded-2xl p-4 flex flex-col items-end gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Secret Squad Invite Code
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black text-cyan-400 tracking-wider">
              {team.inviteCode}
            </span>
            <button
              onClick={copyInviteCode}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              title="Copy Invite Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] text-slate-500">Share with teammates to join roster</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Squad Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  Active Roster Lineup
                </h3>
                <p className="text-xs text-slate-400">Confirmed lineup for competition matchmaking</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {team.members?.length || 4} Members
              </span>
            </div>

            <div className="divide-y divide-slate-800/60">
              {team.members?.map((member, idx) => (
                <div key={member.id || idx} className="py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300">
                      {(member.name || member.user?.name || 'M').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {member.name || member.user?.name || 'Player'}
                        </span>
                        {member.role === 'Captain' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5" /> Captain
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        In-Game ID: <span className="text-slate-300">{member.bgmiId || member.freefireUid || member.inGameId || '5128938472'}</span>
                      </p>
                    </div>
                  </div>

                  {isCaptain && member.role !== 'Captain' && (
                    <button
                      onClick={() => {
                        setMemberToRemove(member);
                        setRemoveModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/40 transition"
                      title="Remove from squad"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tournament Participation History */}
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Tournament History & Status</h3>
            {teamRegistrations.length === 0 ? (
              <p className="text-xs text-slate-500">This squad hasn't registered for any tournaments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Tournament</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teamRegistrations.map(r => (
                      <tr key={r.id || r._id}>
                        <td className="py-3 font-bold text-white">BGMI Masters Championship Season 4</td>
                        <td className="py-3"><StatusBadge status={r.status} /></td>
                        <td className="py-3 text-right">
                          <Link to="/tournaments/tourn-bgmi-masters" className="text-purple-400 font-semibold hover:underline">
                            View Matches
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Squad Settings & Rules */}
        <div className="space-y-6">
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Squad Controls</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Squad tags are automatically prepended to roster names during match room verification.
            </p>

            {isCaptain ? (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleRegenerateCode}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Regenerate Invite Code
                </button>
                {eligibleNewCaptains.length > 0 && (
                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-purple-950/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Transfer Captaincy
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleLeaveTeam}
                className="w-full py-2 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Leave Squad
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Confirm Member Removal"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to remove <strong>{memberToRemove?.name || memberToRemove?.user?.name}</strong> from the squad roster? They will forfeit active match slot allocations.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setRemoveModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
            >
              Confirm Removal
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Captaincy Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Squad Captaincy"
      >
        <form onSubmit={handleTransferOwnership} className="space-y-4">
          <p className="text-xs text-slate-300">
            Select a squad teammate to designate as the new Captain. You will remain an active roster member with standard permissions.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select New Captain
            </label>
            <select
              required
              value={selectedNewCaptain}
              onChange={(e) => setSelectedNewCaptain(e.target.value)}
              className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Choose squad member --</option>
              {eligibleNewCaptains.map(m => (
                <option key={m.user?._id || m.id} value={m.user?._id || m.id}>
                  {m.name || m.user?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedNewCaptain}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              Transfer Ownership
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
