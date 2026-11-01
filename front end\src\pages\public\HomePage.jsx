import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { 
  Trophy, 
  ShieldCheck, 
  Users, 
  Zap, 
  Gamepad2, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  Sparkles,
  Flame,
  Crosshair
} from 'lucide-react';

export const HomePage = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true);
        const res = await tournamentsAPI.list();
        if (res.data && res.data.success) {
          setTournaments(res.data.tournaments || []);
        }
      } catch (err) {
        console.warn('Home page tournament fetch:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  const featured = tournaments[0] || null;
  const upcoming = tournaments.slice(1, 4);

  return (
    <div className="space-y-20 pb-16 relative">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 z-10">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-600/15 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[350px] bg-cyan-500/15 rounded-full blur-[130px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-inner animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Next-Gen Esports Platform • BGMI, Free Fire, Valorant & COD</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
            YOUR GAME.<br />
            YOUR TEAM.<br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">YOUR GLORY.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Host and play competitive tournaments. Organize events for BGMI, Free Fire, Call of Duty, Valorant, and Football. Review registered teammate rosters, manage brackets, and securely release actual game room keys 5 minutes before kickoff.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/tournaments"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition duration-200"
            >
              <Trophy className="w-4 h-4" />
              <span>Explore Tournaments</span>
            </Link>

            {/* Host Tournament Option: ONLY for Organizer and Admin */}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <Link
                to="/organizer/tournaments/create"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition duration-200"
              >
                <Zap className="w-4 h-4" />
                <span>Host a Tournament</span>
              </Link>
            )}

            {/* If regular Player, show Squad Manager */}
            {user?.role === 'player' && (
              <Link
                to="/teams/create"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#151928] hover:bg-[#1c2237] text-white border border-slate-700/80 font-bold text-sm hover:border-purple-500/40 transition duration-200"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Create Squad</span>
              </Link>
            )}

            {/* If Guest, show Join as Player */}
            {!user && (
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#151928] hover:bg-[#1c2237] text-white border border-slate-700/80 font-bold text-sm hover:border-purple-500/40 transition duration-200"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Join as Player</span>
              </Link>
            )}
          </div>

          {/* Quick Metrics Counter */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-[#121624]/70 border border-slate-800/60 shadow-lg">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">Multiple</p>
              <p className="text-xs text-slate-400 mt-1">Game Titles</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121624]/70 border border-slate-800/60 shadow-lg">
              <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">100% Verified</p>
              <p className="text-xs text-slate-400 mt-1">Player Rosters</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121624]/70 border border-slate-800/60 shadow-lg">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">5 Min Release</p>
              <p className="text-xs text-slate-400 mt-1">Room Key & Pass</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121624]/70 border border-slate-800/60 shadow-lg">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">Real-Time</p>
              <p className="text-xs text-slate-400 mt-1">Bracket & Scores</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Game Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Competitive Titles</h2>
            <p className="text-xs text-slate-400 mt-1">Discover tournaments across premier esports titles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BGMI Card */}
          <Link
            to="/tournaments?game=BGMI"
            className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#121624] p-6 hover:border-amber-500/60 transition duration-300 flex flex-col justify-between h-56"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Crosshair className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Squad / Solo / Duo
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition">
                BGMI
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Battle Royale scrims on Erangel and Miramar with time-locked custom room IDs and passwords.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <span>View BGMI Events</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>

          {/* Free Fire Card */}
          <Link
            to="/tournaments?game=Free Fire"
            className="group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-[#121624] p-6 hover:border-orange-500/60 transition duration-300 flex flex-col justify-between h-56"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-400">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300">
                Clash Squad & BR
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-orange-300 transition">
                Free Fire (MAX)
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Clash Squad 4v4 action and classic matches with live bracket scoring and automatic winner advancement.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <span>View Free Fire Events</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>

          {/* Valorant / COD Card */}
          <Link
            to="/tournaments?game=Valorant"
            className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-[#121624] p-6 hover:border-rose-500/60 transition duration-300 flex flex-col justify-between h-56"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                5v5 & Tactical
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white group-hover:text-rose-300 transition">
                Valorant & COD
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Tactical 5v5 tournaments with teammate roster registration and organizer review queues.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <span>View Tactical Events</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Spotlight Tournament */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Active Spotlight Tournament</h2>
              <p className="text-xs text-slate-400 mt-1">Featured competition accepting squad registrations</p>
            </div>
            <Link to={`/tournaments/${featured._id || featured.id}`} className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View Tournament <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 bg-[#121624] shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[260px]">
                <img
                  src={featured.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'}
                  alt={featured.name}
                  className="w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-[#121624]/60 to-[#121624]" />
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">
                    {featured.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {featured.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-[#0e121e] p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block">Game</span>
                      <strong className="text-purple-300 font-bold">{featured.game}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Format</span>
                      <strong className="text-slate-200 capitalize">{featured.format?.replace('_', ' ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Slots</span>
                      <strong className="text-cyan-400">{featured.registeredCount || 0}/{featured.maxTeams} Teams</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Daily Match Time</span>
                      <strong className="text-slate-200">{featured.matchTiming || '6:00 PM IST'}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/tournaments/${featured._id || featured.id}`}
                  className="w-full text-center py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
                >
                  View Details & Register Squad
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Tournaments Grid */}
      {upcoming.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Upcoming Competitions</h2>
              <p className="text-xs text-slate-400 mt-1">Register before registration deadlines close</p>
            </div>
            <Link to="/tournaments" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map(tourn => (
              <TournamentCard key={tourn._id || tourn.id} tournament={tourn} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">How It Works</h2>
          <p className="text-xs text-slate-400 mt-2">
            Seamless tournament lifecycle tailored for Players and Organizers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#121624] border border-slate-800 p-6 rounded-2xl relative shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black font-mono mb-4 text-base">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">Host Tournament</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organizers set up tournament rules, format, match timing, slot capacity, and schedule across multiple games.
            </p>
          </div>

          <div className="bg-[#121624] border border-slate-800 p-6 rounded-2xl relative shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-black font-mono mb-4 text-base">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">Register Squad</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Players fill in team name and each teammate's Full Name, In-Game Name (IGN), Game ID, and Email.
            </p>
          </div>

          <div className="bg-[#121624] border border-slate-800 p-6 rounded-2xl relative shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black font-mono mb-4 text-base">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">Organizer Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organizer inspects all submitted squad rosters and holds complete authority to Accept or Reject registration requests.
            </p>
          </div>

          <div className="bg-[#121624] border border-slate-800 p-6 rounded-2xl relative shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black font-mono mb-4 text-base">
              04
            </div>
            <h3 className="text-base font-bold text-white mb-2">5-Min Room Release</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The organizer creates the room in-game and enters Room ID & Password. It unlocks for approved players exactly 5 minutes before start.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
