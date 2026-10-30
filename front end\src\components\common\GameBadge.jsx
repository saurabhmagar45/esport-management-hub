import React from 'react';
import { Crosshair, Flame } from 'lucide-react';

export const GameBadge = ({ game, size = 'md' }) => {
  const isBgmi = game?.toLowerCase().includes('bgmi') || game?.toLowerCase().includes('battlegrounds');
  const isFreeFire = game?.toLowerCase().includes('free fire') || game?.toLowerCase().includes('ff');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  if (isBgmi) {
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
        <Crosshair className="w-3.5 h-3.5" />
        BGMI
      </span>
    );
  }

  if (isFreeFire) {
    return (
      <span className={`inline-flex items-center font-semibold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 ${sizeClasses}`}>
        <Flame className="w-3.5 h-3.5" />
        Free Fire
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 ${sizeClasses}`}>
      {game}
    </span>
  );
};
