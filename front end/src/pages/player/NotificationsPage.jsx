import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Bell, 
  CheckCircle2, 
  KeyRound, 
  Trophy, 
  Clock, 
  ExternalLink,
  Check
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'room_released':
        return <KeyRound className="w-5 h-5 text-yellow-400" />;
      case 'reg_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'match_scheduled':
        return <Clock className="w-5 h-5 text-cyan-400" />;
      default:
        return <Trophy className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-purple-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time updates on registration approvals, room ID releases, and match schedules
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <Check className="w-4 h-4 text-purple-400" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No notifications in your inbox.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={`p-5 flex items-start justify-between gap-4 transition cursor-pointer hover:bg-slate-800/40 ${
                !n.read ? 'bg-purple-950/20' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#0c0e18] border border-slate-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link
                  to={n.link}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold shrink-0 flex items-center gap-1 transition"
                >
                  <span>View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
