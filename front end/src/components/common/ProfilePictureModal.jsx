import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

export const PRESET_AVATARS = [
  {
    name: 'Master Admin',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250',
    tag: 'Official'
  },
  {
    name: 'Cyber Samurai',
    url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=250',
    tag: 'Esports Pro'
  },
  {
    name: 'Tactical Operator',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250',
    tag: 'BGMI Lead'
  },
  {
    name: 'Neon Sniper',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250',
    tag: 'Sharpshooter'
  },
  {
    name: 'Free Fire Slayer',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=250',
    tag: 'Clash Squad'
  },
  {
    name: 'Anime Champion',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=250',
    tag: 'MVP'
  },
  {
    name: 'Mecha Pilot',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250',
    tag: 'Squad Leader'
  },
  {
    name: 'Stealth Scout',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=250',
    tag: 'Support'
  }
];

export const ProfilePictureModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || PRESET_AVATARS[0].url);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'url'
  const [customUrl, setCustomUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with current user avatar on open
  React.useEffect(() => {
    if (isOpen && user?.avatar) {
      setSelectedAvatar(user.avatar);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      setError('Please paste a valid image URL.');
      return;
    }
    setError('');
    setSelectedAvatar(customUrl.trim());
  };

  const handleSave = async () => {
    if (!selectedAvatar) {
      setError('Please choose or upload a profile picture.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await authAPI.updateProfile({ avatar: selectedAvatar });
      if (res.data && res.data.success) {
        updateProfile({ avatar: selectedAvatar });
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1000);
      } else {
        throw new Error(res.data?.message || 'Failed to update profile picture.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error updating profile picture.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Profile Picture">
      {success ? (
        <div className="text-center py-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
          <h4 className="text-base font-bold text-white">Profile Picture Updated!</h4>
          <p className="text-xs text-slate-400">
            Your new gaming avatar is active across all leaderboards, tournament rosters, and matches.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Selection Live Preview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0c0e18] border border-slate-800">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt="Avatar Preview"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500 shadow-lg shadow-purple-500/20"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150';
                }}
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-purple-600 rounded-full text-white shadow">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                Active Selection
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{user?.name || 'Competitor'}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Will be visible on squad cards, match lobbies, and tournament brackets.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'presets'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Gaming Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'upload'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Photo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition ${
                activeTab === 'url'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Image URL
            </button>
          </div>

          {/* Tab 1: Gaming Presets Grid */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
              {PRESET_AVATARS.map((preset, idx) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(preset.url);
                      setError('');
                    }}
                    className={`relative rounded-xl p-1.5 border transition flex flex-col items-center group text-center ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/20'
                        : 'border-slate-800 bg-[#0c0e18] hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-12 h-12 rounded-lg object-cover mb-1 group-hover:scale-105 transition"
                    />
                    <span className="text-[10px] font-bold text-white truncate w-full">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-slate-500 truncate w-full">
                      {preset.tag}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-purple-600 rounded-full p-0.5 text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Upload Device File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-2xl p-6 text-center cursor-pointer bg-[#0c0e18] hover:bg-slate-900/40 transition space-y-2"
              >
                <div className="p-3 rounded-full bg-purple-600/10 text-purple-400 w-12 h-12 mx-auto flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Click to Browse Photo</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP from your phone or PC (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Custom Web URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Direct Image Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Discord image link"
                    className="flex-1 px-3 py-2 bg-[#0c0e18] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Set As Profile Picture'}</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
