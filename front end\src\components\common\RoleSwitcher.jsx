import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, User, Trophy } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
      <span className="text-slate-400 font-medium px-2 hidden sm:inline">Role View:</span>
      <button
        onClick={() => switchRole('player')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
          user?.role === 'player'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="View as Player / Squad Captain"
      >
        <User className="w-3.5 h-3.5" />
        <span>Player</span>
      </button>

      <button
        onClick={() => switchRole('organizer')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
          user?.role === 'organizer'
            ? 'bg-cyan-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="View as Tournament Organizer"
      >
        <Trophy className="w-3.5 h-3.5" />
        <span>Organizer</span>
      </button>

      <button
        onClick={() => switchRole('admin')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition ${
          user?.role === 'admin'
            ? 'bg-amber-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
        title="View as Platform Admin"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>
    </div>
  );
};
