import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Trophy, 
  Users, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  PlusCircle, 
  LayoutDashboard,
  CheckCircle2,
  ExternalLink,
  Swords,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  FolderKanban,
  UserCog
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showDemoRolePicker, setShowDemoRolePicker] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-[#0a0c14]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-[#0d101d] rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ESPORT<span className="text-purple-500">HUB</span>
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-cyan-400 -mt-1 uppercase">Tournaments</span>
              </div>
            </Link>

            {/* Desktop Navigation Links — Strictly Tailored to Current Role */}
            <div className="hidden md:flex items-center gap-1">
              
              {/* 1. NOT LOGGED IN / GUEST LINKS */}
              {!user && (
                <>
                  <Link 
                    to="/tournaments" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/tournaments') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    Tournaments
                  </Link>
                  <Link 
                    to="/teams" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive('/teams') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    Teams
                  </Link>
                </>
              )}

              {/* 2. PLAYER LINKS */}
              {user?.role === 'player' && (
                <>
                  <Link 
                    to="/tournaments" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/tournaments') ? 'text-purple-300 bg-purple-950/40 border border-purple-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-purple-400" />
                    Tournaments
                  </Link>
                  <Link 
                    to="/teams" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/teams') ? 'text-purple-300 bg-purple-950/40 border border-purple-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Users className="w-4 h-4 text-purple-400" />
                    My Squad
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/dashboard') ? 'text-purple-300 bg-purple-950/40 border border-purple-500/30 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    Player Dashboard
                  </Link>
                </>
              )}

              {/* 3. ORGANIZER LINKS */}
              {user?.role === 'organizer' && (
                <>
                  <Link 
                    to="/organizer" 
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive('/organizer') ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/30' : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    Organizer Hub
                  </Link>
                  <Link 
                    to="/organizer" 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
                  >
                    <FolderKanban className="w-4 h-4 text-cyan-400" />
                    My Competitions
                  </Link>
                  <Link 
                    to="/tournaments" 
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      isActive('/tournaments') ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    All Tournaments
                  </Link>
                </>
              )}

              {/* 4. ADMIN LINKS */}
              {user?.role === 'admin' && (
                <>
                  <Link 
                    to="/admin" 
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                      isActive('/admin') ? 'text-amber-300 bg-amber-950/50 border border-amber-500/30' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    Admin Console
                  </Link>
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Dispute Center
                  </Link>
                  <Link 
                    to="/tournaments" 
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    All Tournaments
                  </Link>
                </>
              )}

            </div>
          </div>

          {/* Right Section: Role Action, Notifications, User Menu */}
          <div className="hidden md:flex items-center gap-3.5">
            
            {/* Quick Action Button for Player */}
            {user?.role === 'player' && (
              <Link
                to="/teams/create"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-purple-600/20 transition"
              >
                <Users className="w-4 h-4" />
                <span>+ Create Squad</span>
              </Link>
            )}

            {/* Quick Action Button for Organizer & Admin */}
            {(user?.role === 'organizer' || user?.role === 'admin') && (
              <Link
                to="/organizer/tournaments/create"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-600/20 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Host Tournament</span>
              </Link>
            )}

            {/* Quick Status Badge for Admin */}
            {user?.role === 'admin' && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>ADMIN ACCESS</span>
              </div>
            )}

            {/* Notifications Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-purple-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121624] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#161a2b]">
                      <span className="text-sm font-bold text-white flex items-center gap-2">
                        Notifications {unreadCount > 0 && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-slate-400 hover:text-purple-400 flex items-center gap-1 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No notifications</div>
                      ) : (
                        notifications.slice(0, 5).map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3.5 hover:bg-slate-800/40 cursor-pointer transition ${!n.read ? 'bg-purple-950/20' : ''}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold ${!n.read ? 'text-purple-300' : 'text-slate-300'}`}>{n.title}</p>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">Recent</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="block text-center py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-[#0e121d] border-t border-slate-800 transition"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-purple-500/40 object-cover"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-200 line-clamp-1">{user.name}</p>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      user.role === 'admin' 
                        ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' 
                        : user.role === 'organizer' 
                        ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' 
                        : 'text-purple-400 bg-purple-950/40 border border-purple-500/30'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#121624] border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    
                    {/* User Identity Header */}
                    <div className="px-4 py-2.5 border-b border-slate-800 bg-[#0e111c] rounded-t-xl">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          user.role === 'admin' 
                            ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40' 
                            : user.role === 'organizer' 
                            ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/40' 
                            : 'text-purple-300 bg-purple-500/20 border border-purple-500/40'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Role-Specific Navigation Menu Items */}
                    <div className="py-1">
                      {user.role === 'player' && (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-400" />
                            Player Dashboard
                          </Link>

                          <Link
                            to="/teams"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Users className="w-4 h-4 text-purple-400" />
                            My Squad & Lineup
                          </Link>

                          <Link
                            to="/tournaments"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Trophy className="w-4 h-4 text-purple-400" />
                            Join Competitions
                          </Link>
                        </>
                      )}

                      {user.role === 'organizer' && (
                        <>
                          <Link
                            to="/organizer"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                            Organizer Dashboard
                          </Link>

                          <Link
                            to="/organizer/tournaments/create"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <PlusCircle className="w-4 h-4 text-cyan-400" />
                            Create Tournament
                          </Link>
                        </>
                      )}

                      {user.role === 'admin' && (
                        <>
                          <Link
                            to="/organizer/tournaments/create"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <PlusCircle className="w-4 h-4 text-cyan-400" />
                            Host Tournament
                          </Link>

                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            Admin Console
                          </Link>

                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                          >
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            Dispute Center
                          </Link>
                        </>
                      )}

                      <Link
                        to="/notifications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Bell className="w-4 h-4 text-slate-400" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-purple-600/40 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation — Role Specific */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0d101d] px-4 pt-2 pb-4 space-y-2">
          
          {/* Public links when logged out */}
          {!user && (
            <>
              <Link
                to="/tournaments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Tournaments
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Teams
              </Link>
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white"
                >
                  Register
                </Link>
              </div>
            </>
          )}

          {/* Player Mobile Links */}
          {user?.role === 'player' && (
            <>
              <div className="px-3 py-1 text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                Player Menu
              </div>
              <Link
                to="/tournaments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Explore Tournaments
              </Link>
              <Link
                to="/teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                My Squad
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-purple-400 hover:bg-purple-950/20"
              >
                Player Dashboard
              </Link>
              <Link
                to="/teams/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white bg-purple-600/40 border border-purple-500/30"
              >
                + Create Squad
              </Link>
            </>
          )}

          {/* Organizer Mobile Links */}
          {user?.role === 'organizer' && (
            <>
              <div className="px-3 py-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Organizer Menu
              </div>
              <Link
                to="/organizer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-cyan-400 hover:bg-cyan-950/20 font-semibold"
              >
                Organizer Hub
              </Link>
              <Link
                to="/organizer/tournaments/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white bg-cyan-600/40 border border-cyan-500/30"
              >
                + Host Tournament
              </Link>
              <Link
                to="/tournaments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                All Tournaments
              </Link>
            </>
          )}

          {/* Admin Mobile Links */}
          {user?.role === 'admin' && (
            <>
              <div className="px-3 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Administrator Menu
              </div>
              <Link
                to="/organizer/tournaments/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white bg-cyan-600/40 border border-cyan-500/30 font-semibold"
              >
                + Host Tournament
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-950/20 font-semibold"
              >
                Admin Console
              </Link>
              <Link
                to="/tournaments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800"
              >
                All Tournaments
              </Link>
            </>
          )}

          {/* Shared logged-in items (Notifications & Sign out) */}
          {user && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                Notifications ({unreadCount})
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20 font-medium"
              >
                Sign Out
              </button>
            </div>
          )}

        </div>
      )}
    </nav>
  );
};
