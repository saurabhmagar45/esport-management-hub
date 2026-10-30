import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, UserCheck, Shield } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('player'); // 'player' | 'organizer'
  const [bgmiIgn, setBgmiIgn] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        bgmiIgn
      });

      if (res.success) {
        if (role === 'organizer') navigate('/organizer');
        else navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. An account with this email may already exist.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10" />

        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20 mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Account</h2>
          <p className="text-xs text-slate-400 mt-1">Register as a Player to enter tournaments or as an Organizer to host events</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('player')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  role === 'player'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-md shadow-purple-600/20'
                    : 'bg-[#0c0e18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Player
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                  role === 'organizer'
                    ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-600/20'
                    : 'bg-[#0c0e18] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                Tournament Organizer
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {role === 'player' 
                ? 'Players can create squads, register teammates with IGN/Game ID, and view room passwords.' 
                : 'Organizers can create tournaments, approve/reject squads, release room details, and manage match scores.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name or Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aman Sandhu"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Player In-Game Name */}
          {role === 'player' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary In-Game Name (IGN)
              </label>
              <input
                type="text"
                value={bgmiIgn}
                onChange={(e) => setBgmiIgn(e.target.value)}
                placeholder="e.g. Soul_Mortal / Ninja_X"
                className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'organizer' ? 'Organizer' : 'Player'}`}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-purple-400 font-bold hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
