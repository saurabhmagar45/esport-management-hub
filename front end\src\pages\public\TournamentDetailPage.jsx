import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentsAPI, matchesAPI, registrationsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GameBadge } from '../../components/common/GameBadge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BracketViewer } from '../../components/tournaments/BracketViewer';
import { Modal } from '../../components/common/Modal';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  FileText, 
  GitBranch, 
  ListOrdered, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Loader2,
  Megaphone,
  KeyRound,
  Lock,
  Copy,
  Check,
  AlertCircle,
  Award,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';

export const TournamentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('details');
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [myRegistration, setMyRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room Credentials State (5-min timed release)
  const [roomData, setRoomData] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Organizer / Admin Room Key Add & Update Modal State
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [modalRoomId, setModalRoomId] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalReleaseTime, setModalReleaseTime] = useState('');
  const [modalInstructions, setModalInstructions] = useState('');
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  // Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [roster, setRoster] = useState([]);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await tournamentsAPI.get(id);
      if (res.data && res.data.success) {
        setTournament(res.data.tournament);
      } else {
        setError('Tournament not found.');
        return;
      }

      // Load matches for bracket
      try {
        const matchesRes = await matchesAPI.getMatches(id);
        if (matchesRes.data && matchesRes.data.success) {
          setMatches(matchesRes.data.matches);
        }
      } catch (e) {}

      // If logged in, check user's registration
      if (user) {
        try {
          const myRegRes = await registrationsAPI.myRegistrations();
          if (myRegRes.data && myRegRes.data.success) {
            const current = myRegRes.data.registrations.find(
              r => r.tournament?._id === id || r.tournament === id
            );
            setMyRegistration(current || null);
          }
        } catch (e) {}

        // If organizer or admin, load all registrations
        if (user.role === 'organizer' || user.role === 'admin') {
          try {
            const allRegRes = await registrationsAPI.list(id);
            if (allRegRes.data && allRegRes.data.success) {
              setRegistrations(allRegRes.data.registrations);
            }
          } catch (e) {}
        }

        // Attempt to fetch room details
        try {
          setRoomLoading(true);
          const roomRes = await tournamentsAPI.getRoom(id);
          if (roomRes.data && roomRes.data.success) {
            setRoomData(roomRes.data);
          }
        } catch (rErr) {
          if (rErr.response?.data?.message) {
            setRoomError(rErr.response.data.message);
          }
        } finally {
          setRoomLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error loading tournament details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadData();
    // Auto-refresh room status every 30 seconds
    const timer = setInterval(() => {
      if (user) {
        tournamentsAPI.getRoom(id).then(res => {
          if (res.data && res.data.success) setRoomData(res.data);
        }).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, id, user]);

  // Initialize roster when opening registration modal
  const handleOpenRegister = () => {
    if (!user) {
      alert('Please log in as a Player to register your team.');
      return;
    }
    const requiredCount = tournament?.teamMemberCount || (tournament?.teamSize === 'solo' ? 1 : tournament?.teamSize === 'duo' ? 2 : 4);
    
    // Player 1 defaults to the logged-in user
    const initialRoster = Array.from({ length: requiredCount }, (_, idx) => {
      if (idx === 0) {
        return {
          name: user.name || '',
          inGameName: user.gameProfiles?.bgmiIgn || user.name || '',
          gameId: user.gameProfiles?.bgmiId || '',
          email: user.email || ''
        };
      }
      return {
        name: '',
        inGameName: '',
        gameId: '',
        email: ''
      };
    });

    setRoster(initialRoster);
    setTeamName(user.name ? `${user.name.split(' ')[0]}'s Squad` : 'Squad Alpha');
    setTeamTag('ALPHA');
    setRegisterError('');
    setRegisterSuccess(false);
    setRegisterModalOpen(true);
  };

  const handleRosterChange = (index, field, value) => {
    setRoster(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!teamName.trim() || !teamTag.trim()) {
      setRegisterError('Please provide team name and a short tag (e.g. SOUL).');
      return;
    }

    for (let i = 0; i < roster.length; i++) {
      const m = roster[i];
      if (!m.name.trim() || !m.inGameName.trim() || !m.gameId.trim() || !m.email.trim()) {
        setRegisterError(`Please fill in all details for Teammate #${i + 1} (Name, IGN, Game ID, and Email).`);
        return;
      }
    }

    setRegisterSubmitting(true);
    try {
      const payload = {
        teamName: teamName.trim(),
        teamTag: teamTag.trim().toUpperCase(),
        roster: roster.map(m => ({
          name: m.name.trim(),
          inGameName: m.inGameName.trim(),
          gameId: m.gameId.trim(),
          email: m.email.trim().toLowerCase()
        }))
      };

      const res = await registrationsAPI.register(id, payload);
      if (res.data && res.data.success) {
        setRegisterSuccess(true);
        setTimeout(() => {
          setRegisterModalOpen(false);
          setRegisterSuccess(false);
          loadData();
        }, 1800);
      }
    } catch (err) {
      setRegisterError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const copyRoomId = () => {
    if (roomData?.roomId) {
      navigator.clipboard.writeText(roomData.roomId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const copyRoomPass = () => {
    if (roomData?.password) {
      navigator.clipboard.writeText(roomData.password);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleOpenRoomModal = () => {
    setModalRoomId(roomData?.roomId || '');
    setModalPassword(roomData?.password || '');
    setModalInstructions(
      roomData?.instructions ||
      'Join designated lobby slot. Screen recording mandatory for team captains.'
    );
    if (roomData?.releaseAt) {
      try {
        setModalReleaseTime(new Date(roomData.releaseAt).toISOString().slice(0, 16));
      } catch (e) {
        setModalReleaseTime('');
      }
    } else if (tournament?.startDate) {
      try {
        const fiveMinBefore = new Date(new Date(tournament.startDate).getTime() - 5 * 60 * 1000);
        setModalReleaseTime(fiveMinBefore.toISOString().slice(0, 16));
      } catch (e) {
        setModalReleaseTime('');
      }
    }
    setModalError('');
    setModalSuccess(false);
    setRoomModalOpen(true);
  };

  const handleSaveRoomModal = async (e) => {
    e.preventDefault();
    if (!modalRoomId.trim() || !modalPassword.trim()) {
      setModalError('Please provide both Room ID and Password.');
      return;
    }
    setModalSaving(true);
    setModalError('');
    try {
      const payload = {
        roomId: modalRoomId.trim(),
        password: modalPassword.trim(),
        instructions: modalInstructions.trim() || 'Join designated lobby slot. Mobile only.',
        releaseAt: modalReleaseTime ? new Date(modalReleaseTime) : undefined,
      };
      const res = await tournamentsAPI.setRoom(id, payload);
      setRoomData({
        roomId: modalRoomId.trim(),
        password: modalPassword.trim(),
        instructions: modalInstructions.trim() || 'Join designated lobby slot. Mobile only.',
        releaseAt: res.data?.releaseAt || payload.releaseAt || new Date().toISOString(),
        isReleased: true,
      });
      setRoomError('');
      setModalSuccess(true);
      setTimeout(() => {
        setModalSuccess(false);
        setRoomModalOpen(false);
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to update Room ID & Password.');
    } finally {
      setModalSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        <span>Loading tournament specifications...</span>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">{error || 'Tournament Not Found'}</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">The tournament you requested does not exist or may have been removed.</p>
        <Link to="/tournaments" className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition">
          Browse Tournaments
        </Link>
      </div>
    );
  }

  const isOrganizer = Boolean(
    user && (
      user.role === 'admin' ||
      user._id === tournament.organizer?._id ||
      user._id === tournament.organizer ||
      user.role === 'organizer'
    )
  );
  const isApproved = myRegistration?.status === 'approved';
  const isPending = myRegistration?.status === 'pending';
  const isRejected = myRegistration?.status === 'rejected';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Tournament Banner & Hero Header */}
      <div className="relative bg-slate-900 border-b border-slate-800">
        <div className="h-64 sm:h-80 w-full overflow-hidden relative">
          <img
            src={tournament.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'}
            alt={tournament.name}
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <GameBadge game={tournament.game} size="md" />
                <StatusBadge status={tournament.status} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {tournament.gameMode || `${tournament.teamSize?.toUpperCase()} Mode`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {tournament.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  Organized by <strong className="text-white font-bold">{tournament.organizer?.name || 'Tournament Organizer'}</strong>
                  {tournament.organizer?.verified && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Starts: {new Date(tournament.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick Actions / Registration Button */}
            <div className="flex items-center gap-3">
              {isApproved && (
                <div className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Squad Approved & Ready
                </div>
              )}

              {isPending && (
                <div className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Registration Pending Organizer Review
                </div>
              )}

              {isRejected && (
                <div className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Registration Rejected
                </div>
              )}

              {!myRegistration && !isOrganizer && (
                tournament.status === 'registration_open' ? (
                  <button
                    onClick={handleOpenRegister}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-xl shadow-purple-600/30 transition duration-200"
                  >
                    Register Squad Now
                  </button>
                ) : (
                  <div className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold">
                    Registration Closed
                  </div>
                )
              )}

              {isOrganizer && (
                <>
                  <button
                    onClick={handleOpenRoomModal}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-yellow-500/25"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{roomData?.roomId ? 'Update Room ID & Pass' : '+ Add Room ID & Pass'}</span>
                  </button>

                  <Link
                    to={`/organizer/tournaments/${tournament._id}/registrations`}
                    className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
                  >
                    <Users className="w-4 h-4" />
                    Review Teams ({tournament.pendingCount || 0} Pending)
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ROOM KEY 5-MINUTE VAULT CARD (If Approved Player or Organizer) */}
        {(isApproved || isOrganizer) && (
          <div className="bg-[#121624] border border-purple-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-yellow-400" />
                  In-Game Custom Match Room Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual Room ID and Password created from the game by the tournament organizer
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                {roomData?.isReleased ? (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Room Credentials Unlocked
                  </span>
                ) : (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" />
                    Unlocks 5 Minutes Before Kickoff
                  </span>
                )}

                {/* Organizer Quick Action Button */}
                {isOrganizer && (
                  <button
                    onClick={handleOpenRoomModal}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{roomData?.roomId ? 'Update ID & Pass' : '+ Add ID & Pass'}</span>
                  </button>
                )}
              </div>
            </div>

            {roomData?.isReleased ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Room ID Box */}
                  <div className="bg-[#0c0e18] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-semibold uppercase">Custom Room ID</span>
                      <p className="text-2xl font-mono font-black text-white mt-1 tracking-wider">
                        {roomData.roomId}
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
                      <p className="text-2xl font-mono font-black text-purple-400 mt-1 tracking-wider">
                        {roomData.password}
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

                {roomData.instructions && (
                  <div className="p-4 rounded-xl bg-[#0c0e18] border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400 block mb-1">Lobby Instructions from Organizer:</strong>
                    {roomData.instructions}
                  </div>
                )}
              </div>
            ) : isOrganizer ? (
              <div className="text-center py-6 space-y-3">
                <KeyRound className="w-10 h-10 text-yellow-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  {roomData?.roomId ? 'Room Credentials Scheduled' : 'No Room Credentials Configured Yet'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {roomData?.roomId
                    ? `Current Room ID is configured as "${roomData.roomId}". Verified squads can access it 5 minutes prior to kickoff.`
                    : 'As the tournament organizer, please enter the custom in-game Room ID and Password so approved teams can join on time.'}
                </p>
                <button
                  onClick={handleOpenRoomModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs shadow-lg shadow-yellow-500/30 transition"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{roomData?.roomId ? 'Update Room ID & Pass' : '+ Add In-Game Room ID & Pass'}</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Lock className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                <h4 className="text-sm font-bold text-white">Room Credentials Time-Locked</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {roomError || 'Room credentials will unlock automatically 5 minutes prior to match start. Stay tuned!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tournament Specification Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block">Competition Format</span>
            <p className="text-sm font-bold text-white mt-1 capitalize">
              {tournament.format?.replace('_', ' ') || 'Single Elimination'}
            </p>
          </div>
          <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block">Match Timings</span>
            <p className="text-sm font-bold text-cyan-400 mt-1">
              {tournament.matchTiming || 'Daily 6:00 PM IST'}
            </p>
          </div>
          <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block">Number of Matches</span>
            <p className="text-base font-mono font-bold text-purple-400 mt-1">
              {tournament.numberOfMatches || 3} Matches
            </p>
          </div>
          <div className="bg-[#121624] border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] text-slate-400 block">Approved Slots</span>
            <p className="text-base font-mono font-bold text-emerald-400 mt-1">
              {tournament.registeredCount || 0} / {tournament.maxTeams} Teams
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tournament Details & Rules
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'standings'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Overall Standings
          </button>
          <button
            onClick={() => setActiveTab('bracket')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'bracket'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Tournament Bracket
          </button>
          {isOrganizer && (
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === 'teams'
                  ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Registered Teams ({registrations.length})
            </button>
          )}
        </div>

        {/* TAB 1: DETAILS & RULES */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3">About the Tournament</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {tournament.description}
                </p>
              </div>

              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-3">Official Rulebook & Guidelines</h3>
                <pre className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap bg-[#0c0e18] p-4 rounded-xl border border-slate-800/80">
                  {tournament.rules || 'Standard tournament rules apply.'}
                </pre>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase text-purple-400">Schedule & Timelines</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Registration Deadline</span>
                    <p className="text-slate-200 font-bold mt-0.5">
                      {new Date(tournament.registrationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tournament Starts</span>
                    <p className="text-slate-200 font-bold mt-0.5">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Daily Match Time</span>
                    <p className="text-cyan-400 font-bold mt-0.5">
                      {tournament.matchTiming || '6:00 PM IST'}
                    </p>
                  </div>
                </div>
              </div>

              {tournament.announcements?.length > 0 && (
                <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    Announcements
                  </h3>
                  {tournament.announcements.map((ann, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0c0e18] border border-slate-800 text-xs">
                      <p className="font-bold text-white">{ann.title}</p>
                      <p className="text-slate-400 mt-1">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OVERALL STANDINGS */}
        {activeTab === 'standings' && (
          <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Overall Tournament Standings
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live ranking, matches played, wins, and total points updated by tournament officials
                </p>
              </div>
            </div>

            {(!tournament.standings || tournament.standings.length === 0) ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No standings recorded yet. Standings will be published by the organizer as matches conclude.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#161a2b] text-slate-400">
                      <th className="py-3 px-6 font-semibold">Rank</th>
                      <th className="py-3 px-6 font-semibold">Team</th>
                      <th className="py-3 px-4 font-semibold text-center">Matches</th>
                      <th className="py-3 px-4 font-semibold text-center">Wins</th>
                      <th className="py-3 px-4 font-semibold text-center">Kills</th>
                      <th className="py-3 px-6 font-semibold text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tournament.standings.map((st, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-6 font-mono font-bold text-purple-400">
                          #{st.rank || idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-white">{st.teamName}</span>
                          {st.teamTag && <span className="text-slate-500 ml-1.5 font-mono">[{st.teamTag}]</span>}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-300 font-mono">{st.matchesPlayed || 0}</td>
                        <td className="py-4 px-4 text-center text-emerald-400 font-mono font-bold">{st.wins || 0}</td>
                        <td className="py-4 px-4 text-center text-cyan-400 font-mono">{st.kills || 0}</td>
                        <td className="py-4 px-6 text-right font-mono font-black text-yellow-400 text-sm">{st.points || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BRACKET */}
        {activeTab === 'bracket' && (
          <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-white">Knockout Stage Bracket</h3>
                <p className="text-xs text-slate-400">Deterministic tournament fixtures and live match scores</p>
              </div>
            </div>

            {matches.length > 0 ? (
              <BracketViewer matches={matches} />
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Brackets will be generated by the organizer once squad registrations close.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REGISTERED TEAMS (Organizer View) */}
        {activeTab === 'teams' && isOrganizer && (
          <div className="bg-[#121624] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Registered Squad Rosters</h3>
              <p className="text-xs text-slate-400">Inspect submitted squads and teammate details</p>
            </div>

            <div className="divide-y divide-slate-800">
              {registrations.map((reg) => (
                <div key={reg._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      {reg.teamName || reg.team?.name}
                      <span className="text-xs font-mono text-purple-400">[{reg.teamTag || reg.team?.tag}]</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">Captain: {reg.submittedBy?.name} ({reg.submittedBy?.email})</p>
                    
                    {/* Teammates List */}
                    {reg.roster?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {reg.roster.map((m, mIdx) => (
                          <span key={mIdx} className="text-[11px] px-2 py-0.5 rounded bg-[#0c0e18] border border-slate-800 text-slate-300">
                            {m.name} | IGN: <strong className="text-purple-300">{m.inGameName}</strong> | ID: {m.gameId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <StatusBadge status={reg.status} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* SQUAD REGISTRATION MODAL WITH TEAMMATE DETAILS */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Tournament Squad Registration"
      >
        {registerSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Squad Submitted Successfully!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your squad roster has been submitted to the tournament organizer for review. You will receive an alert once accepted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitRegistration} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300">
              Registering for <strong>{tournament.name}</strong> ({tournament.game}). Please fill in your team details and all {roster.length} teammate specifications.
            </div>

            {registerError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Team Basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Team Hydra"
                  className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Team Tag (Max 6 Chars)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value.toUpperCase())}
                  placeholder="e.g. HYDRA"
                  className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Teammate Detail Inputs */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                <span>Roster Teammates ({roster.length} Players)</span>
                <span className="text-[10px] text-purple-400 font-normal">All fields required for each player</span>
              </h4>

              {roster.map((member, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#0c0e18] border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      Player #{idx + 1} {idx === 0 ? '(Captain / You)' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={member.name}
                        onChange={(e) => handleRosterChange(idx, 'name', e.target.value)}
                        placeholder="Player Full Name"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">In-Game Name (IGN)</label>
                      <input
                        type="text"
                        required
                        value={member.inGameName}
                        onChange={(e) => handleRosterChange(idx, 'inGameName', e.target.value)}
                        placeholder="e.g. Soul_Mortal"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Game ID / UID</label>
                      <input
                        type="text"
                        required
                        value={member.gameId}
                        onChange={(e) => handleRosterChange(idx, 'gameId', e.target.value)}
                        placeholder="e.g. 5128938472"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={member.email}
                        onChange={(e) => handleRosterChange(idx, 'email', e.target.value)}
                        placeholder="player@example.com"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registerSubmitting}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                {registerSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Submit Squad Registration
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Organizer Room Credentials Add & Update Modal */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={roomData?.roomId ? `Update Room ID & Password • ${tournament?.name || ''}` : `Add Room ID & Password • ${tournament?.name || ''}`}
      >
        {modalSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white">Room Credentials Saved!</h4>
            <p className="text-xs text-slate-400">
              Room ID and Password updated successfully. Verified squads can unlock them 5 minutes before scheduled match start.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveRoomModal} className="space-y-4">
            <p className="text-xs text-slate-400">
              Enter the custom game Room ID and Password created from {tournament?.game || 'the game'}. Credentials are encrypted and revealed only to approved participants.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  In-Game Custom Room ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalRoomId}
                  onChange={(e) => setModalRoomId(e.target.value)}
                  placeholder="e.g. 7482910"
                  className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  In-Game Room Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={modalShowPassword ? 'text' : 'password'}
                    required
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="e.g. BATTLE#2026"
                    className="w-full pl-3 pr-9 py-2 bg-[#0c0e18] border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    type="button"
                    onClick={() => setModalShowPassword(!modalShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {modalShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Release Timestamp (Unlocks 5 Minutes Before Start)
              </label>
              <input
                type="datetime-local"
                value={modalReleaseTime}
                onChange={(e) => setModalReleaseTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Leave default or select a specific time for automated unlock.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Lobby Instructions & Slot Allocations
              </label>
              <textarea
                rows={3}
                value={modalInstructions}
                onChange={(e) => setModalInstructions(e.target.value)}
                placeholder="e.g. Team Alpha Slot 1, Team Beta Slot 2. Mobile devices only. Emulators strictly prohibited."
                className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRoomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalSaving}
                className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black text-xs font-bold transition shadow-lg shadow-yellow-500/25 flex items-center gap-1.5"
              >
                {modalSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {roomData?.roomId ? 'Update Room ID & Pass' : 'Publish Room ID & Pass'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
