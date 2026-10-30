import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetTokenInfo, setResetTokenInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await authAPI.forgotPassword(email);
      if (res.data?.resetToken) {
        setResetTokenInfo(res.data.resetToken);
      }
    } catch (err) {
      console.warn('Forgot password fallback notice:', err.message);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#121624] border border-slate-800 rounded-2xl p-8 shadow-2xl text-center">
        
        <div className="inline-flex p-3 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20 mb-4">
          <KeyRound className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white">Reset Password</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Enter your registered email address to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Password Reset Link Sent</h4>
            <p className="text-xs text-slate-400">
              We've dispatched a secure recovery link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-xs font-bold text-purple-400 hover:text-purple-300"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition"
            >
              Send Recovery Instructions
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
