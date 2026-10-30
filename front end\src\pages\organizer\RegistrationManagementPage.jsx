import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrationsAPI, tournamentsAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  Check, 
  X, 
  Search, 
  ArrowLeft, 
  Eye, 
  Loader2,
  KeyRound,
  AlertCircle,
  Mail,
  User,
  Gamepad2
} from 'lucide-react';

export const RegistrationManagementPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const tournRes = await tournamentsAPI.get(id);
      if (tournRes.data && tournRes.data.success) {
        setTournament(tournRes.data.tournament);
      }
      const res = await registrationsAPI.list(id);
      if (res.data && res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.warn('Error loading registrations:', err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const availableSlots = (tournament?.maxTeams || 16) - approvedCount;

  const handleApprove = async (regId) => {
    if (availableSlots <= 0) {
      alert('Tournament slots are already full! Cannot approve more teams.');
      return;
    }
    setActionLoading(true);
    try {
      await registrationsAPI.approve(regId);
      setRegistrations(prev =>
        prev.map(r => ((r._id === regId || r.id === regId) ? { ...r, status: 'approved' } : r))
      );
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to approve registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (reg) => {
    setSelectedReg(reg);
    setRejectReason('Roster information unverified or incomplete.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedReg) return;
    setActionLoading(true);
    try {
      await registrationsAPI.reject(selectedReg._id || selectedReg.id, rejectReason);
      setRegistrations(prev =>
        prev.map(r => ((r._id === selectedReg._id || r.id === selectedReg.id) ? { ...r, status: 'rejected', rejectionReason: rejectReason } : r))
      );
      setRejectModalOpen(false);
      setSelectedReg(null);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const teamName = r.teamName || r.team?.name || '';
    const teamTag = r.teamTag || r.team?.tag || '';
    const captainName = r.submittedBy?.name || '';
    const matchesSearch = teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          teamTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          captainName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        <span>Loading registration roster queue...</span>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-400">Tournament not found.</p>
        <Link to="/organizer" className="mt-4 inline-block text-xs text-purple-400 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <Link to="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Organizer Portal
        </Link>
        <Link
          to={`/organizer/tournaments/${tournament._id}/room`}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold transition"
        >
          <KeyRound className="w-3.5 h-3.5" />
          Manage Room ID & Password
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Team Registration Review</span>
          <h1 className="text-2xl font-black text-white mt-1">{tournament.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted squads, verify teammate details (Name, IGN, Game ID, Email), and Accept or Reject registration requests
          </p>
        </div>

        {/* Slot Progress Tag */}
        <div className="bg-[#0c0e18] border border-slate-800 rounded-xl p-4 text-center min-w-[200px]">
          <span className="text-[10px] text-slate-500 font-semibold uppercase">Approved Slots</span>
          <p className="text-xl font-mono font-black text-purple-400 mt-0.5">
            {approvedCount} / {tournament.maxTeams} Teams
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{availableSlots} slots remaining</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121624] border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search submitted team, tag, or captain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0c0e18] border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#161a2b] text-slate-400">
                <th className="py-3.5 px-6 font-semibold">Registered Squad</th>
                <th className="py-3.5 px-4 font-semibold">Teammates</th>
                <th className="py-3.5 px-4 font-semibold">Captain</th>
                <th className="py-3.5 px-4 font-semibold">Submitted On</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Authority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No registrations found. As players sign up with their squads, their entries will appear here for your review.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0c0e18] border border-slate-800 flex items-center justify-center font-bold text-purple-400 font-mono">
                          {reg.teamTag || reg.team?.tag || 'SQD'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{reg.teamName || reg.team?.name}</p>
                          <span className="font-mono text-purple-400 text-xs">[{reg.teamTag || reg.team?.tag}]</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-300">
                      {reg.roster?.length || reg.team?.members?.length || 4} Players
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <p className="font-semibold text-white">{reg.submittedBy?.name || 'Captain'}</p>
                      <p className="text-[11px] text-slate-400">{reg.submittedBy?.email}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(reg.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedReg(reg); setRosterModalOpen(true); }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 font-semibold"
                          title="View Teammate Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Roster</span>
                        </button>

                        {reg.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApprove(reg._id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold flex items-center gap-1 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleOpenReject(reg)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold flex items-center gap-1 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Roster Teammates Modal */}
      {selectedReg && (
        <Modal
          isOpen={rosterModalOpen}
          onClose={() => setRosterModalOpen(false)}
          title={`Squad Roster • ${selectedReg.teamName || selectedReg.team?.name} [${selectedReg.teamTag || selectedReg.team?.tag}]`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="p-3 rounded-xl bg-[#0c0e18] border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500">Registered By Captain:</span>
                <p className="text-white font-bold text-sm mt-0.5">{selectedReg.submittedBy?.name}</p>
                <p className="text-slate-400">{selectedReg.submittedBy?.email}</p>
              </div>
              <StatusBadge status={selectedReg.status} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Teammates Details ({selectedReg.roster?.length || 0} Players):</span>
              
              <div className="space-y-2">
                {selectedReg.roster && selectedReg.roster.length > 0 ? (
                  selectedReg.roster.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0e121f] border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-400" />
                          {m.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">Player #{idx + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                        <div>
                          <span className="text-slate-500">IGN:</span>{' '}
                          <strong className="text-purple-300 font-mono">{m.inGameName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Game ID:</span>{' '}
                          <strong className="text-cyan-300 font-mono">{m.gameId}</strong>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-500">Email:</span>{' '}
                          <span className="text-slate-300">{m.email}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 p-4 text-center">No individual teammate roster recorded.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              {selectedReg.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      setRosterModalOpen(false);
                      handleApprove(selectedReg._id);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept Squad
                  </button>
                  <button
                    onClick={() => {
                      setRosterModalOpen(false);
                      handleOpenReject(selectedReg);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Squad
                  </button>
                </>
              )}
              <button
                onClick={() => setRosterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Modal */}
      {selectedReg && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Registration • ${selectedReg.teamName || selectedReg.team?.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Specify the reason for rejecting this squad's registration. The team captain will receive an immediate in-app notification.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Unverified In-Game Name, incomplete squad roster..."
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
