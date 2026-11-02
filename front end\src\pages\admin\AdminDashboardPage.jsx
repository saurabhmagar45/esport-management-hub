import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOCK_USERS, MOCK_TOURNAMENTS, MOCK_AUDIT_LOGS } from '../../data/mockData';
import { adminAPI, tournamentsAPI, disputesAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { 
  Shield, 
  Users, 
  Trophy, 
  CheckCircle2, 
  Ban, 
  Loader2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Check,
  Trash2
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [userList, setUserList] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 1, totalTournaments: 0, activeTournaments: 0, totalMatches: 0 });
  const [loading, setLoading] = useState(false);

  // Tournament Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetTournament, setTargetTournament] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cleaning, setCleaning] = useState(false);

  const handleCleanCredentials = async () => {
    if (!window.confirm('Are you sure you want to clean all non-admin login credentials? All player & organizer test accounts will be removed. Only Master Admin will remain.')) {
      return;
    }
    setCleaning(true);
    try {
      const res = await adminAPI.cleanUsers();
      alert(res.data?.message || 'All login credentials cleaned successfully.');
      await loadAdminData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to clean credentials.');
    } finally {
      setCleaning(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, tournRes, logsRes, disputesRes] = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        tournamentsAPI.list(),
        adminAPI.getAuditLogs(),
        disputesAPI.list()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.stats);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) {
        setUserList(usersRes.value.data.users);
      }
      if (tournRes.status === 'fulfilled' && tournRes.value.data?.success) {
        setTournaments(tournRes.value.data.tournaments);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.data?.success) {
        setAuditLogs(logsRes.value.data.logs);
      }
      if (disputesRes.status === 'fulfilled' && disputesRes.value.data?.success) {
        setDisputes(disputesRes.value.data.disputes);
      }
    } catch (err) {
      console.warn('API fallback for admin oversight:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const toggleUserStatus = async (u) => {
    try {
      await adminAPI.toggleUserStatus(u._id || u.id);
      await loadAdminData();
    } catch (e) {
      setUserList(prev => prev.map(item => {
        if ((item.id === u.id) || (item._id === u._id)) {
          const nextStatus = item.accountStatus === 'active' ? 'suspended' : 'active';
          return { ...item, accountStatus: nextStatus };
        }
        return item;
      }));
    }
  };

  const handleConfirmCancel = async () => {
    if (!targetTournament) return;
    try {
      await adminAPI.cancelTournament(targetTournament._id || targetTournament.id, cancelReason);
      await loadAdminData();
    } catch (e) {
      setTournaments(prev => prev.map(t => {
        if ((t.id === targetTournament.id) || (t._id === targetTournament._id)) {
          return { ...t, status: 'cancelled' };
        }
        return t;
      }));
    } finally {
      setCancelModalOpen(false);
      setTargetTournament(null);
      setCancelReason('');
    }
  };

  const handleResolveDispute = async (disputeId, resolution) => {
    try {
      await disputesAPI.resolve(disputeId, {
        status: resolution,
        resolutionNotes: `Resolved by administrator ${user?.name || ''}`
      });
      await loadAdminData();
    } catch (err) {
      setDisputes(prev => prev.map(d => d._id === disputeId ? { ...d, status: resolution } : d));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Administrative Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Oversight & Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Moderate player accounts, audit operational changes, and oversee competitive tournaments.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 bg-[#0c0e18] p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'users' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Accounts ({userList.length})
          </button>
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'tournaments' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tournaments ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'disputes' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disputes ({disputes.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'logs' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={loadAdminData}
            title="Refresh Data"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCleanCredentials}
            disabled={cleaning}
            title="Purge all test login credentials except Master Admin"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold transition disabled:opacity-50"
          >
            {cleaning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Clean Credentials</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Total Gamers</span>
          <p className="text-xl font-mono font-black text-white mt-1">{stats.totalUsers || userList.length}</p>
        </div>
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Total Tournaments</span>
          <p className="text-xl font-mono font-black text-cyan-400 mt-1">{stats.totalTournaments || tournaments.length}</p>
        </div>
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Pending Issues</span>
          <p className="text-xl font-mono font-black text-rose-400 mt-1">{disputes.filter(d => d.status === 'pending').length}</p>
        </div>
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Security Events</span>
          <p className="text-xl font-mono font-black text-amber-400 mt-1">{auditLogs.length} Logged</p>
        </div>
      </div>

      {/* TAB 1: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a2b] text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">System Role</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {userList.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-700" />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        u.role === 'organizer' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.accountStatus === 'active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {u.accountStatus || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            u.accountStatus === 'active'
                              ? 'bg-rose-950/40 hover:bg-rose-950 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-950/40 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENTS */}
      {activeTab === 'tournaments' && (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a2b] text-slate-400">
                  <th className="py-3.5 px-4 font-semibold">Tournament</th>
                  <th className="py-3.5 px-4 font-semibold">Game</th>
                  <th className="py-3.5 px-4 font-semibold">Organizer</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Intervention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tournaments.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{t.name}</td>
                    <td className="py-3.5 px-4">{t.game}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{t.organizer?.name || 'Authorized Org'}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.status !== 'cancelled' && t.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setTargetTournament(t);
                            setCancelModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-950 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                        >
                          Cancel Event
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTES & ISSUES */}
      {activeTab === 'disputes' && (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
          {disputes.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No disputes or player complaints currently reported.
            </div>
          ) : (
            disputes.map((d) => (
              <div key={d._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Issue: {d.issueType.replace('_', ' ').toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      d.status === 'investigating' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{d.description}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Reported by {d.reportedBy?.name || 'Player'} ({d.reportedBy?.email || 'N/A'}) • {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>

                {d.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleResolveDispute(d._id, 'investigating')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition"
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => handleResolveDispute(d._id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
          {auditLogs.map((log, idx) => (
            <div key={log._id || log.id || idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-amber-400">{log.action}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-semibold">Actor: {log.actorName || log.actor?.name || log.performedBy?.name || 'Administrator'}</span>
                </div>
                <p className="text-slate-400">{log.target || log.targetType} — {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>
              </div>
              <span className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
                {new Date(log.timestamp || log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tournament Cancel Modal */}
      {targetTournament && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Administrative Cancellation • ${targetTournament.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-rose-300 bg-rose-950/20 p-3 rounded-xl border border-rose-500/30">
              Warning: Cancelling a tournament notifies all registered squads and immediately locks fixture brackets. An immutable audit record will be logged.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mandatory Reason for Cancellation
              </label>
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Organizer fair-play policy violation or publisher rule infringement..."
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
