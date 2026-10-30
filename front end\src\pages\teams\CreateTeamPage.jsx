import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teamsAPI } from '../../services/api';
import { Users, ArrowLeft, Sparkles, Check, Loader2, Plus, Trash2 } from 'lucide-react';

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=150&auto=format&fit=crop&q=80'
];

const GAMES = [
  'BGMI',
  'Free Fire',
  'Call of Duty: Mobile',
  'Valorant',
  'Football (EA FC)',
  'Custom Game'
];

export const CreateTeamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [game, setGame] = useState('BGMI');
  const [customGame, setCustomGame] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(PRESET_LOGOS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Teammates state
  const [teammates, setTeammates] = useState([
    {
      name: user?.name || '',
      inGameName: user?.gameProfiles?.bgmiIgn || user?.name || '',
      gameId: user?.gameProfiles?.bgmiId || '',
      email: user?.email || '',
      role: 'Captain'
    }
  ]);

  const addTeammate = () => {
    setTeammates(prev => [
      ...prev,
      { name: '', inGameName: '', gameId: '', email: '', role: 'Member' }
    ]);
  };

  const removeTeammate = (idx) => {
    if (teammates.length <= 1) return;
    setTeammates(prev => prev.filter((_, i) => i !== idx));
  };

  const handleTeammateChange = (idx, field, value) => {
    setTeammates(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !tag.trim()) {
      setErrorMsg('Please provide a team name and tag.');
      return;
    }

    const activeGame = game === 'Custom Game' && customGame.trim() ? customGame.trim() : game;

    setSubmitting(true);
    try {
      await teamsAPI.create({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        game: activeGame,
        logo: selectedLogo,
        members: teammates.map(t => ({
          name: t.name.trim(),
          inGameName: t.inGameName.trim(),
          gameId: t.gameId.trim(),
          email: t.email.trim().toLowerCase(),
          role: t.role || 'Member'
        }))
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Create Squad & Roster</h1>
            <p className="text-xs text-slate-400">Assemble your team with teammate IGNs, Game IDs, and emails</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GodLike Warriors"
                className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Team Tag (Max 6 letters)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="GODL"
                className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Esports Game Discipline
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {GAMES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGame(g)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition text-left ${
                    game === g
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                      : 'bg-[#0c0e18] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {game === 'Custom Game' && (
              <input
                type="text"
                required
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                placeholder="Enter custom game title..."
                className="mt-2 w-full px-4 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* Teammates Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Teammate Roster Details</h3>
                <p className="text-[11px] text-slate-500">Provide teammate Full Name, In-Game Name (IGN), Game ID, and Email</p>
              </div>
              <button
                type="button"
                onClick={addTeammate}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Player
              </button>
            </div>

            <div className="space-y-3">
              {teammates.map((m, idx) => (
                <div key={idx} className="p-3 bg-[#0c0e18] rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="text-purple-400">Player #{idx + 1} {idx === 0 ? '(Captain)' : ''}</span>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTeammate(idx)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={m.name}
                        onChange={(e) => handleTeammateChange(idx, 'name', e.target.value)}
                        placeholder="Player Name"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">In-Game Name (IGN)</label>
                      <input
                        type="text"
                        required
                        value={m.inGameName}
                        onChange={(e) => handleTeammateChange(idx, 'inGameName', e.target.value)}
                        placeholder="e.g. Soul_Mortal"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Game ID / UID</label>
                      <input
                        type="text"
                        required
                        value={m.gameId}
                        onChange={(e) => handleTeammateChange(idx, 'gameId', e.target.value)}
                        placeholder="e.g. 5128938472"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={m.email}
                        onChange={(e) => handleTeammateChange(idx, 'email', e.target.value)}
                        placeholder="player@example.com"
                        className="w-full px-2.5 py-1.5 bg-[#121624] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Squad Roster
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
