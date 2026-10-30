import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { PageTransition } from './components/common/PageTransition';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { TournamentsPage } from './pages/public/TournamentsPage';
import { TournamentDetailPage } from './pages/public/TournamentDetailPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Player Pages
import { PlayerDashboardPage } from './pages/player/PlayerDashboardPage';
import { TeamsPage } from './pages/teams/TeamsPage';
import { CreateTeamPage } from './pages/teams/CreateTeamPage';
import { TeamDetailPage } from './pages/teams/TeamDetailPage';
import { PlayerMatchDetailPage } from './pages/player/PlayerMatchDetailPage';
import { NotificationsPage } from './pages/player/NotificationsPage';

// Organizer Pages
import { OrganizerDashboardPage } from './pages/organizer/OrganizerDashboardPage';
import { TournamentWizardPage } from './pages/organizer/TournamentWizardPage';
import { RegistrationManagementPage } from './pages/organizer/RegistrationManagementPage';
import { MatchCenterPage } from './pages/organizer/MatchCenterPage';
import { RoomManagementPage } from './pages/organizer/RoomManagementPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/tournaments" element={<PageTransition><TournamentsPage /></PageTransition>} />
        <Route path="/tournaments/:id" element={<PageTransition><TournamentDetailPage /></PageTransition>} />

        {/* Auth */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />

        {/* Player */}
        <Route path="/dashboard" element={<PageTransition><PlayerDashboardPage /></PageTransition>} />
        <Route path="/teams" element={<PageTransition><TeamsPage /></PageTransition>} />
        <Route path="/teams/create" element={<PageTransition><CreateTeamPage /></PageTransition>} />
        <Route path="/teams/:id" element={<PageTransition><TeamDetailPage /></PageTransition>} />
        <Route path="/matches/:id" element={<PageTransition><PlayerMatchDetailPage /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><NotificationsPage /></PageTransition>} />

        {/* Organizer */}
        <Route path="/organizer" element={<PageTransition><OrganizerDashboardPage /></PageTransition>} />
        <Route path="/organizer/tournaments/create" element={<PageTransition><TournamentWizardPage /></PageTransition>} />
        <Route path="/organizer/tournaments/:id/registrations" element={<PageTransition><RegistrationManagementPage /></PageTransition>} />
        <Route path="/organizer/tournaments/:id/room" element={<PageTransition><RoomManagementPage /></PageTransition>} />
        <Route path="/tournaments/:id/matches" element={<PageTransition><MatchCenterPage /></PageTransition>} />
        <Route path="/tournaments/:id/bracket" element={<PageTransition><MatchCenterPage /></PageTransition>} />
        <Route path="/organizer/matches/:id/room" element={<PageTransition><RoomManagementPage /></PageTransition>} />

        {/* Admin */}
        <Route path="/admin" element={<PageTransition><AdminDashboardPage /></PageTransition>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#0a0c14] text-slate-100 selection:bg-purple-600 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
