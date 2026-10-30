import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tournamentsAPI } from '../../services/api';
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  Gamepad2,
  Calendar,
  Clock,
  ListOrdered,
  Users
} from 'lucide-react';

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80'
];

const SUPPORTED_GAMES = [
  { name: 'BGMI', label: 'BGMI (Battlegrounds Mobile India)', defaultSize: 'squad', defaultCount: 4, modes: ['Squad Battle Royale (Erangel/Miramar)', 'Duo Hardcore', '4v4 TDM'] },
  { name: 'Free Fire', label: 'Free Fire (MAX & Clash Squad)', defaultSize: 'squad', defaultCount: 4, modes: ['4v4 Clash Squad', 'Battle Royale Squad', '1v1 Solo'] },
  { name: 'Call of Duty: Mobile', label: 'Call of Duty: Mobile (CODM)', defaultSize: '5v5', defaultCount: 5, modes: ['5v5 Search & Destroy', 'Hardpoint Competitive', 'Battle Royale Squad'] },
  { name: 'Valorant', label: 'Valorant', defaultSize: '5v5', defaultCount: 5, modes: ['5v5 Standard Spike Defusal', 'Swiftplay Tournament', '1v1 Aim Duel'] },
  { name: 'Football (EA FC)', label: 'Football (EA FC / FIFA)', defaultSize: 'solo', defaultCount: 1, modes: ['1v1 Kickoff Competitive', '2v2 Co-op Friendly', '11v11 Pro Clubs'] },
  { name: 'Custom Game', label: 'Custom / Other Game', defaultSize: 'squad', defaultCount: 4, modes: ['Custom Competitive Mode'] }
];

export const TournamentWizardPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State - Step 1: Game & Basics
  const [name, setName] = useState('');
  const [game, setGame] = useState('BGMI');
  const [customGameName, setCustomGameName] = useState('');
  const [gameMode, setGameMode] = useState('Squad Battle Royale (Erangel/Miramar)');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState(PRESET_BANNERS[0]);
  const [customBannerUrl, setCustomBannerUrl] = useState('');

  // Step 2: Format, Slots & Schedule
  const [format, setFormat] = useState('single_elimination');
  const [teamSize, setTeamSize] = useState('squad');
  const [teamMemberCount, setTeamMemberCount] = useState(4);
  const [maxTeams, setMaxTeams] = useState(16);
  const [numberOfMatches, setNumberOfMatches] = useState(3);
  const [matchTiming, setMatchTiming] = useState('Daily 6:00 PM IST (Match 1: 6:00 PM, Match 2: 7:00 PM)');
  const [regStart, setRegStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [regDeadline, setRegDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 9);
    return d.toISOString().slice(0, 10);
  });

  // Step 3: Rules & Regulations
  const [rules, setRules] = useState(`1. Fair play & integrity: Any cheating, emulator manipulation, or unapproved hacks results in immediate team disqualification.
2. Room Credentials: The official Room ID and Password will unlock exactly 5 minutes before scheduled match start for all approved squads.
3. Punctuality: Squads must join within 10 minutes of room creation. Failure to show constitutes a walkover.
4. Screen recording is mandatory for team captains.`);

  const [createdSuccess, setCreatedSuccess] = useState(false);

  // Sync team size defaults when game changes
  const handleGameSelect = (g) => {
    setGame(g.name);
    setTeamSize(g.defaultSize);
    setTeamMemberCount(g.defaultCount);
    setGameMode(g.modes[0] || 'Standard Competitive');
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter a tournament title.');
        return;
      }
      if (game === 'Custom Game' && !customGameName.trim()) {
        setErrorMsg('Please provide your custom game title.');
        return;
      }
      if (!description.trim()) {
        setErrorMsg('Please provide a tournament description for participating squads.');
        return;
      }
    }
    if (step === 2) {
      if (!startDate || !regDeadline || !regStart) {
        setErrorMsg('Please configure all tournament dates.');
        return;
      }
      if (new Date(startDate) < new Date(regDeadline)) {
        setErrorMsg('Tournament start date must be after registration deadline.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setErrorMsg('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleFinish = async (publishNow = true) => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const activeGameTitle = game === 'Custom Game' && customGameName.trim() ? customGameName.trim() : game;
      const activeBanner = customBannerUrl.trim() ? customBannerUrl.trim() : banner;

      const payload = {
        name: name.trim(),
        game: activeGameTitle,
        gameMode,
        description: description.trim(),
        banner: activeBanner,
        format,
        teamSize,
        teamMemberCount: Number(teamMemberCount) || 4,
        maxTeams: Number(maxTeams),
        entryFee: 0, // Free - no fee option displayed
        matchTiming,
        numberOfMatches: Number(numberOfMatches) || 3,
        rules: rules.trim(),
        registrationStart: regStart,
        registrationDeadline: regDeadline,
        startDate,
        status: publishNow ? 'registration_open' : 'draft'
      };

      const res = await tournamentsAPI.create(payload);
      if (res.data && res.data.success) {
        setCreatedSuccess(true);
        setTimeout(() => {
          navigate('/organizer');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create tournament. Please check fields.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <Link to="/organizer" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Organizer Dashboard
      </Link>

      {/* Stepper Header */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, title: 'Game & Basics' },
            { num: 2, title: 'Format & Timings' },
            { num: 3, title: 'Rules & Policy' },
            { num: 4, title: 'Review & Host' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center relative flex-1 text-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition duration-200 z-10 ${
                  step === s.num
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-4 ring-purple-600/20'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[11px] font-semibold mt-2 ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Step Container Card */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        
        {createdSuccess ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-black text-white">Tournament Successfully Created!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your competition is now live. Players can register their squads with teammate IGNs and Game IDs. Room credentials will unlock 5 minutes prior to match start.
            </p>
          </div>
        ) : (
          <div>
            
            {/* STEP 1: GAME & BASICS */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    Step 1: Game Selection & Tournament Basics
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select your game discipline and specify tournament title and overview
                  </p>
                </div>

                <div className="space-y-4">
                  
                  {/* Game Selector Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Select Esports Game
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {SUPPORTED_GAMES.map((g) => (
                        <button
                          key={g.name}
                          type="button"
                          onClick={() => handleGameSelect(g)}
                          className={`p-3 rounded-xl text-left border transition ${
                            game === g.name
                              ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-600/30'
                              : 'bg-[#0c0e18] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          <p className="text-xs font-bold">{g.name}</p>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{g.label.split('(')[1]?.replace(')', '') || g.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {game === 'Custom Game' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Custom Game Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customGameName}
                        onChange={(e) => setCustomGameName(e.target.value)}
                        placeholder="e.g. Apex Legends Mobile, Rocket League, Chess"
                        className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tournament Title
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. BGMI Pro Championship Cup 2026"
                      className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Game Mode
                    </label>
                    <input
                      type="text"
                      value={gameMode}
                      onChange={(e) => setGameMode(e.target.value)}
                      placeholder="e.g. Squad Battle Royale (Erangel), 5v5 Bomb Defusal, 1v1 Classic"
                      className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tournament Description & Schedule Overview
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide comprehensive details about this tournament, participant eligibility, match schedule, and qualifications..."
                      className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Tournament Banner Image
                    </label>
                    <div className="grid grid-cols-4 gap-3 mb-2">
                      {PRESET_BANNERS.map((b, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setBanner(b); setCustomBannerUrl(''); }}
                          className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                            banner === b && !customBannerUrl ? 'border-purple-500 scale-105' : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={b} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={customBannerUrl}
                      onChange={(e) => setCustomBannerUrl(e.target.value)}
                      placeholder="Or enter custom image URL (https://...)"
                      className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500 mt-1"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2: FORMAT, SLOTS & TIMINGS */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    Step 2: Format, Slots, Timings & Matches
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Set up tournament team size, slot limits, match timings, and schedule
                  </p>
                </div>

                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tournament Format
                      </label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="single_elimination">Single Elimination (Knockout Bracket)</option>
                        <option value="battle_royale">Battle Royale Lobby (Points Table)</option>
                        <option value="round_robin">Round Robin / Group Stage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Team Size & Required Teammates
                      </label>
                      <select
                        value={teamSize}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTeamSize(val);
                          if (val === 'solo') setTeamMemberCount(1);
                          else if (val === 'duo') setTeamMemberCount(2);
                          else if (val === 'trio') setTeamMemberCount(3);
                          else if (val === 'squad') setTeamMemberCount(4);
                          else if (val === '5v5') setTeamMemberCount(5);
                          else if (val === '11v11') setTeamMemberCount(11);
                        }}
                        className="w-full px-3 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="squad">Squad (4 Players)</option>
                        <option value="duo">Duo (2 Players)</option>
                        <option value="solo">Solo (1 Player)</option>
                        <option value="5v5">5v5 Team (5 Players)</option>
                        <option value="trio">Trio (3 Players)</option>
                        <option value="11v11">11v11 Team (11 Players)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Total Participating Slots (Max Teams)
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="128"
                        value={maxTeams}
                        onChange={(e) => setMaxTeams(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Number of Matches / Rounds
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={numberOfMatches}
                        onChange={(e) => setNumberOfMatches(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Match Timing & Schedule Breakdown
                    </label>
                    <input
                      type="text"
                      value={matchTiming}
                      onChange={(e) => setMatchTiming(e.target.value)}
                      placeholder="e.g. Daily 6:00 PM IST (Match 1: 6:00 PM, Match 2: 7:00 PM)"
                      className="w-full px-4 py-2.5 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Registration Opens
                      </label>
                      <input
                        type="date"
                        value={regStart}
                        onChange={(e) => setRegStart(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Registration Deadline
                      </label>
                      <input
                        type="date"
                        value={regDeadline}
                        onChange={(e) => setRegDeadline(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tournament Kickoff Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 3: RULES & REGULATIONS */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-purple-400" />
                    Step 3: Tournament Regulations & Room Instructions
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Define competitive guidelines, fair-play rules, device policies, and lobby procedures
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tournament Rules & Disqualification Policy
                    </label>
                    <textarea
                      rows={8}
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-purple-400" />
                    <span>
                      <strong>Automatic 5-Minute Room Release:</strong> As the tournament organizer, you will share the actual Room ID & Password from the game. The platform guarantees these credentials will automatically unlock for accepted squads exactly 5 minutes before scheduled match start.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-white">Step 4: Review Tournament Specifications</h2>
                  <p className="text-xs text-slate-400 mt-1">Verify all details before publishing tournament to the competitive circuit</p>
                </div>

                <div className="bg-[#0c0e18] border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                  <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                    <img src={customBannerUrl.trim() || banner} alt="" className="w-24 h-16 rounded-xl object-cover" />
                    <div>
                      <h3 className="text-base font-bold text-white">{name || 'Untitled Tournament'}</h3>
                      <p className="text-purple-400 font-semibold">{game === 'Custom Game' ? customGameName : game} • {gameMode}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">{teamSize.toUpperCase()} ({teamMemberCount} Teammates Required) • {format.replace('_', ' ').toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-500 block">Total Slots:</span>
                      <p className="font-bold text-white mt-0.5">{maxTeams} Teams</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Matches / Rounds:</span>
                      <p className="font-bold text-cyan-400 mt-0.5">{numberOfMatches} Matches</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Match Timing:</span>
                      <p className="font-bold text-slate-300 mt-0.5">{matchTiming}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Tournament Starts:</span>
                      <p className="font-bold text-white mt-0.5">{startDate}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-slate-500 block mb-1">Registration Window:</span>
                    <p className="text-slate-300">
                      Opens: <strong>{regStart}</strong> | Closes: <strong>{regDeadline}</strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>
                    Upon publishing, registered players will be able to submit their rosters. You will have full authority to Accept or Reject each team's registration.
                  </span>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-800 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : <div />}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleFinish(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleFinish(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Publish Tournament
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
