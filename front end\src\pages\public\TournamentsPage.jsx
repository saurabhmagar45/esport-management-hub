import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tournamentsAPI } from '../../services/api';
import { TournamentCard } from '../../components/tournaments/TournamentCard';
import { 
  Search, 
  RotateCcw, 
  LayoutGrid, 
  List, 
  Calendar, 
  Users, 
  Clock,
  Frown, 
  Loader2,
  Gamepad2,
  Trophy
} from 'lucide-react';
import { GameBadge } from '../../components/common/GameBadge';
import { StatusBadge } from '../../components/common/StatusBadge';

const GAMES = [
  'all',
  'BGMI',
  'Free Fire',
  'Call of Duty: Mobile',
  'Valorant',
  'Football (EA FC)'
];

export const TournamentsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGame = searchParams.get('game') || 'all';

  const [tournamentsList, setTournamentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function fetchTournaments() {
      try {
        setLoading(true);
        const res = await tournamentsAPI.list();
        if (res.data && res.data.success) {
          setTournamentsList(res.data.tournaments || []);
        }
      } catch (err) {
        console.warn('API fetch tournaments notice:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTournaments();
  }, []);

  // Filter & Sort Logic
  const filteredTournaments = useMemo(() => {
    return tournamentsList.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.organizer?.name && item.organizer.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGame = selectedGame === 'all' || item.game.toLowerCase().includes(selectedGame.toLowerCase()) || selectedGame.toLowerCase().includes(item.game.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesGame && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'startDate') return new Date(a.startDate) - new Date(b.startDate);
      if (sortBy === 'slots') return (b.registeredCount || 0) - (a.registeredCount || 0);
      return 0;
    });
  }, [tournamentsList, searchQuery, selectedGame, selectedStatus, sortBy]);

  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage) || 1;
  const paginatedList = filteredTournaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGame('all');
    setSelectedStatus('all');
    setSortBy('startDate');
    setCurrentPage(1);
    setSearchParams({});
  };

  const isFiltered = searchQuery !== '' || selectedGame !== 'all' || selectedStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Tournament Discovery</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore esports competitions across BGMI, Free Fire, Call of Duty, Valorant, and Football
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-[#121624] border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tournament title or organizer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedGame}
              onChange={(e) => { setSelectedGame(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Disciplines & Games</option>
              <option value="BGMI">BGMI</option>
              <option value="Free Fire">Free Fire</option>
              <option value="Call of Duty: Mobile">Call of Duty: Mobile</option>
              <option value="Valorant">Valorant</option>
              <option value="Football (EA FC)">Football (EA FC)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-[#0c0e18] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="registration_open">Registration Open</option>
              <option value="ongoing">Live / In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

        </div>

        {/* Quick Game Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">Game:</span>
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => { setSelectedGame(g); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedGame === g
                    ? 'bg-purple-600 text-white'
                    : 'bg-[#0c0e18] hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {g === 'all' ? 'All' : g}
              </button>
            ))}

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="ml-2 flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold px-2 py-1 rounded transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">{filteredTournaments.length} Tournaments</span>
            <div className="flex items-center bg-[#0d101a] border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          <span>Synchronizing tournaments...</span>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl p-16 text-center shadow-xl">
          <Frown className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Tournaments Hosted Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No tournaments found matching your filters. Tournament organizers can create events anytime from the Organizer Portal.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Reset Filters
            </button>
            <Link
              to="/organizer/tournaments/create"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition"
            >
              Host a Tournament
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedList.map((tourn) => (
            <TournamentCard key={tourn._id || tourn.id} tournament={tourn} />
          ))}
        </div>
      ) : (
        <div className="bg-[#121624] border border-slate-800 rounded-2xl divide-y divide-slate-800 overflow-hidden shadow-xl">
          {paginatedList.map((t) => (
            <div key={t._id || t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition">
              <div className="flex items-center gap-4">
                <img src={t.banner} alt="" className="w-16 h-16 rounded-xl object-cover" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <GameBadge game={t.game} size="sm" />
                    <StatusBadge status={t.status} />
                  </div>
                  <h3 className="text-sm font-bold text-white hover:text-purple-300 transition">
                    <Link to={`/tournaments/${t._id || t.id}`}>{t.name}</Link>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    By {t.organizer?.name || 'Organizer'} • {t.teamSize?.toUpperCase()} • {t.matchTiming || '6:00 PM IST'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-300 font-semibold">{t.registeredCount || 0}/{t.maxTeams} Teams</p>
                  <p className="text-[10px] text-slate-500">Starts {new Date(t.startDate).toLocaleDateString()}</p>
                </div>
                <Link
                  to={`/tournaments/${t._id || t.id}`}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                currentPage === idx + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};
