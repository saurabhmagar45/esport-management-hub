import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registrationsAPI, teamsAPI, matchesAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GameBadge } from '../../components/common/GameBadge';
import { 
  Trophy, 
  Users, 
  Clock, 
  ShieldCheck, 
  KeyRound, 
  ChevronRight, 
  Plus,
  Loader2
} from 'lucide-react';

export const PlayerDashboardPage = () => {
  const { user } = useAuth();

  const [myTeam, setMyTeam] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Load user's registered teams
        const teamsRes = await teamsAPI.list({ myTeams: 'true' });
        if (teamsRes.data && teamsRes.data.success && teamsRes.data.teams.length > 0) {
          setMyTeam(teamsRes.data.teams[0]);
        }

        // Load user registrations
        const regRes = await registrationsAPI.myRegistrations();
        if (regRes.data && regRes.data.success) {
          setRegistrations(regRes.data.registrations || []);
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/50 via-[#121624] to-[#121624] border border-purple-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
            alt=""
            className="w-16 h-16 rounded-2xl border-2 border-purple-500/50 object-cover shadow-lg shadow-purple-900/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                Competitor Dashboard
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Player Account
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome, {user?.name || 'Player'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {user?.email} • {myTeam ? `Active Squad: ${myTeam.name} [${myTeam.tag}]` : 'Ready to enter competitive circuits'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tournaments"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-900/20"
          >
            Explore Tournaments
          </Link>
          <Link
            to="/teams/create"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Create Team
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Tournaments Registered</span>
          <p className="text-xl font-mono font-black text-white mt-1">{registrations.length}</p>
        </div>
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Approved by Organizers</span>
          <p className="text-xl font-mono font-black text-emerald-400 mt-1">
            {registrations.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400">Pending Review</span>
          <p className="text-xl font-mono font-black text-amber-400 mt-1">
            {registrations.filter(r => r.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Main Grid: Registrations & Active Squad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Registered Tournaments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-400" />
                My Tournament Applications
              </h3>
              <Link to="/tournaments" className="text-xs text-purple-400 hover:underline">
                Browse More
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                <span>Loading your entries...</span>
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-8 text-center bg-[#0c0e18] rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-3">
                <p>You haven't registered for any tournaments yet.</p>
                <Link
                  to="/tournaments"
                  className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Find Upcoming Tournaments
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((r) => {
                  const tourn = r.tournament;
                  if (!tourn) return null;

                  return (
                    <div
                      key={r._id || r.id}
                      className="p-4 rounded-xl bg-[#0c0e18] border border-slate-800 hover:border-purple-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <GameBadge game={tourn.game} size="sm" />
                          <StatusBadge status={r.status} />
                        </div>
                        <h4 className="text-sm font-bold text-white">{tourn.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Registered Squad: <strong className="text-slate-300">{r.teamName || r.team?.name}</strong> • Timing: {tourn.matchTiming || '6:00 PM IST'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Link
                          to={`/tournaments/${tourn._id || tourn.id}`}
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition flex items-center gap-1"
                        >
                          <span>Tournament Page</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Active Squad & Info */}
        <div className="space-y-6">
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Active Squad
              </h3>
            </div>

            {myTeam ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#0e121e] rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121624] border border-slate-800 flex items-center justify-center font-bold text-purple-400 font-mono">
                    {myTeam.tag}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{myTeam.name}</p>
                    <p className="text-[11px] text-slate-400">Game: <strong className="text-slate-300">{myTeam.game}</strong></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Roster Members:</span>
                  {myTeam.members?.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900/40 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{m.name || m.inGameName || `Player ${idx + 1}`}</span>
                      <span className="font-mono text-purple-400 text-[11px]">{m.gameId || m.inGameId || 'ID'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-[#0c0e18] rounded-xl border border-slate-800">
                <p className="mb-3">You don't have a saved squad yet. You can create one now or fill in your teammate roster when registering for any tournament!</p>
                <Link
                  to="/teams/create"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Squad
                </Link>
              </div>
            )}
          </div>

          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 text-xs space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-yellow-400" />
              Room ID & Password Timed Release
            </h4>
            <p className="text-slate-400 leading-relaxed">
              For tournaments you are approved to play in, the in-game Room ID and Password will automatically unlock on the tournament page <strong>5 minutes before the match start time</strong>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
