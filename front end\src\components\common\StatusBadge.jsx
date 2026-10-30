import React from 'react';

export const StatusBadge = ({ status }) => {
  const configs = {
    registration_open: {
      label: 'Registration Open',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    registration_closed: {
      label: 'Registration Closed',
      bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
    },
    ongoing: {
      label: 'Live / In Progress',
      bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
    },
    completed: {
      label: 'Completed',
      bg: 'bg-slate-500/15 text-slate-400 border-slate-600/30'
    },
    draft: {
      label: 'Draft',
      bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    approved: {
      label: 'Approved',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    pending: {
      label: 'Pending Review',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    },
    scheduled: {
      label: 'Scheduled',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    suspended: {
      label: 'Suspended',
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }
  };

  const current = configs[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    bg: 'bg-slate-700/30 text-slate-300 border-slate-600/30'
  };

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${current.bg}`}>
      {current.label}
    </span>
  );
};
