import React from 'react';
import { Link } from 'react-router-dom';
import { GameBadge } from '../common/GameBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Calendar, Users, Clock, ShieldCheck, Gamepad2 } from 'lucide-react';

export const TournamentCard = ({ tournament }) => {
  const {
    id,
    _id,
    name,
    game,
    gameMode,
    banner,
    organizer,
    format,
    teamSize,
    maxTeams,
    registeredCount,
    matchTiming,
    startDate,
    status
  } = tournament;

  const tournamentId = _id || id;

  const formattedStartDate = new Date(startDate).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group bg-[#121624] hover:bg-[#161c30] border border-slate-800/80 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20">
      {/* Banner & Badges */}
      <div className="relative h-44 overflow-hidden bg-slate-900">
        <img
          src={banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121624] via-transparent to-black/40" />
        
        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3">
          <GameBadge game={game} />
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>

        {/* Mode Tag on Banner */}
        <div className="absolute bottom-3 left-3 bg-[#0c0e18]/80 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-1.5 text-slate-200">
          <Gamepad2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-bold">{gameMode || `${teamSize?.toUpperCase()} Format`}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <span>By</span>
            <span className="text-slate-200 font-semibold flex items-center gap-1">
              {organizer?.name || 'Esport Hub Host'}
              {organizer?.verified && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-2 leading-snug mb-3">
            {name}
          </h3>

          {/* Tournament Specifications Meta Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/60 mb-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>{teamSize?.toUpperCase() || 'SQUAD'} • {registeredCount || 0}/{maxTeams} Slots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">{matchTiming || '6:00 PM IST'}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Starts: <strong className="text-slate-200">{formattedStartDate}</strong></span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px] text-slate-400 capitalize">{format?.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/tournaments/${tournamentId}`}
          className="w-full text-center py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-purple-600 text-white font-semibold text-xs transition duration-200 shadow-sm"
        >
          View Tournament & Details
        </Link>
      </div>
    </div>
  );
};
