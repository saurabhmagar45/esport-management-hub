import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomsAPI, matchesAPI, tournamentsAPI } from '../../services/api';
import { 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Send,
  Ban,
  Loader2,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const RoomManagementPage = () => {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [match, setMatch] = useState(null);
  const [isTournamentMode, setIsTournamentMode] = useState(false);

  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [releaseTime, setReleaseTime] = useState('');
  const [instructions, setInstructions] = useState('Join designated lobby slot. Screen recording mandatory for team captains.');
  const [status, setStatus] = useState('published');
  const [showPassword, setShowPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      // First try to check if id belongs to a Tournament
      try {
        const tournRes = await tournamentsAPI.get(id);
        if (tournRes.data && tournRes.data.success) {
          setTournament(tournRes.data.tournament);
          setIsTournamentMode(true);

          // If tournament already has room credentials
          try {
            const roomRes = await tournamentsAPI.getRoom(id);
            if (roomRes.data && roomRes.data.success) {
              setRoomId(roomRes.data.roomId || '');
              setPassword(roomRes.data.password || '');
              if (roomRes.data.releaseAt) {
                setReleaseTime(new Date(roomRes.data.releaseAt).toISOString().slice(0, 16));
              }
              if (roomRes.data.instructions) {
                setInstructions(roomRes.data.instructions);
              }
            }
          } catch (e) {
            // Default release time to 5 minutes before tournament kickoff
            if (tournRes.data.tournament?.startDate) {
              const fiveMinBefore = new Date(new Date(tournRes.data.tournament.startDate).getTime() - 5 * 60 * 1000);
              setReleaseTime(fiveMinBefore.toISOString().slice(0, 16));
            }
          }
          return;
        }
      } catch (e) {}

      // Otherwise try loading Match
      try {
        const matchRes = await matchesAPI.getMatch(id);
        if (matchRes.data && matchRes.data.success) {
          setMatch(matchRes.data.match);
          setTournament(matchRes.data.match.tournament);
          setIsTournamentMode(false);

          try {
            const roomRes = await roomsAPI.getRoom(id);
            if (roomRes.data && roomRes.data.success) {
              setRoomId(roomRes.data.roomId || '');
              setPassword(roomRes.data.password || '');
              if (roomRes.data.releaseAt) {
                setReleaseTime(new Date(roomRes.data.releaseAt).toISOString().slice(0, 16));
              }
              if (roomRes.data.instructions) {
                setInstructions(roomRes.data.instructions);
              }
            }
          } catch (e) {
            if (matchRes.data.match?.scheduledAt) {
              const fiveMinBefore = new Date(new Date(matchRes.data.match.scheduledAt).getTime() - 5 * 60 * 1000);
              setReleaseTime(fiveMinBefore.toISOString().slice(0, 16));
            }
          }
        }
      } catch (e) {}
    }

    loadData();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!roomId.trim() || !password.trim()) {
      alert('Please provide both Room ID and Password.');
      return;
    }

    setSaving(true);
    try {
      if (isTournamentMode) {
        await tournamentsAPI.setRoom(id, {
          roomId: roomId.trim(),
          password: password.trim(),
          releaseAt: releaseTime ? new Date(releaseTime) : undefined,
          instructions
        });
      } else {
        await roomsAPI.setRoom(id, {
          roomId: roomId.trim(),
          password: password.trim(),
          releaseAt: releaseTime ? new Date(releaseTime) : new Date(Date.now() - 60000),
          instructions
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save room credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-yellow-400 uppercase flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" />
              Room ID & Password Manager
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            {isTournamentMode ? `Tournament Room Key: ${tournament?.name || ''}` : `Match #${match?.matchNumber || 1} Room Key`}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter the actual in-game Room ID and Password. The platform securely encrypts and releases them to accepted players exactly 5 minutes before scheduled match start.
          </p>
        </div>

        <div className="bg-[#0c0e18] border border-slate-800 p-4 rounded-xl text-xs space-y-1">
          <span className="text-slate-500 block">5-Minute Release Status:</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Automatic Timed Unlock
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Room credentials saved! Registered players will be able to view them 5 minutes prior to match kickoff.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Actual In-Game Custom Room ID
              </label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="e.g. 8492019"
                className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                In-Game Room Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. BATTLE#2026"
                  className="w-full pl-4 pr-10 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Scheduled Release Timestamp (Unlocks 5 Minutes Before Start)
            </label>
            <input
              type="datetime-local"
              value={releaseTime}
              onChange={(e) => setReleaseTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Before this timestamp, registered players will see a countdown. Once reached, Room ID and Password immediately become visible.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Lobby Instructions & Slot Allocations
            </label>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Team Alpha in Slot 1, Team Beta in Slot 2. Mobile devices only."
              className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Room Credentials
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
