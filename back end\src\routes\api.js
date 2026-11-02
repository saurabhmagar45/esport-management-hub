import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

import * as authCtrl from '../controllers/authController.js';
import * as tournCtrl from '../controllers/tournamentController.js';
import * as teamCtrl from '../controllers/teamController.js';
import * as regCtrl from '../controllers/registrationController.js';
import * as matchCtrl from '../controllers/matchController.js';
import * as roomCtrl from '../controllers/roomController.js';
import * as notifCtrl from '../controllers/notificationController.js';
import * as adminCtrl from '../controllers/adminController.js';
import * as disputeCtrl from '../controllers/disputeController.js';
import * as paymentCtrl from '../controllers/paymentController.js';

const router = Router();

// ==================== AUTH ====================
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.post('/auth/logout', authenticateToken, authCtrl.logout);
router.get('/auth/me', authenticateToken, authCtrl.getMe);
router.put('/auth/profile', authenticateToken, authCtrl.updateProfile);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);

// ==================== TOURNAMENTS ====================
router.get('/tournaments', tournCtrl.getTournaments);
router.get('/tournaments/:id', tournCtrl.getTournamentById);
router.post('/tournaments', authenticateToken, requireRole(['organizer', 'admin']), tournCtrl.createTournament);
router.put('/tournaments/:id', authenticateToken, requireRole(['organizer', 'admin']), tournCtrl.updateTournament);
router.post('/tournaments/:id/announcements', authenticateToken, requireRole(['organizer', 'admin']), tournCtrl.addAnnouncement);
router.post('/tournaments/:id/room', authenticateToken, requireRole(['organizer', 'admin']), tournCtrl.setTournamentRoom);
router.get('/tournaments/:id/room', authenticateToken, tournCtrl.getTournamentRoom);
router.get('/tournaments/:id/standings', tournCtrl.getTournamentStandings);
router.put('/tournaments/:id/standings', authenticateToken, requireRole(['organizer', 'admin']), tournCtrl.updateTournamentStandings);

// ==================== TEAMS ====================
router.get('/teams', authenticateToken, teamCtrl.getTeams);
router.get('/teams/:id', teamCtrl.getTeamById);
router.post('/teams', authenticateToken, teamCtrl.createTeam);
router.post('/teams/join', authenticateToken, teamCtrl.joinTeam);
router.delete('/teams/:id/members/:userId', authenticateToken, teamCtrl.removeMember);
router.post('/teams/:id/regenerate-code', authenticateToken, teamCtrl.regenerateInviteCode);
router.post('/teams/:id/transfer-ownership', authenticateToken, teamCtrl.transferOwnership);
router.post('/teams/:id/leave', authenticateToken, teamCtrl.leaveTeam);

// ==================== REGISTRATIONS ====================
router.post('/tournaments/:id/registrations', authenticateToken, regCtrl.registerForTournament);
router.get('/tournaments/:id/registrations', authenticateToken, requireRole(['organizer', 'admin']), regCtrl.getTournamentRegistrations);
router.get('/registrations/me', authenticateToken, regCtrl.getMyRegistrations);
router.patch('/registrations/:regId/approve', authenticateToken, requireRole(['organizer', 'admin']), regCtrl.approveRegistration);
router.patch('/registrations/:regId/reject', authenticateToken, requireRole(['organizer', 'admin']), regCtrl.rejectRegistration);

// ==================== BRACKETS & MATCHES ====================
router.post('/tournaments/:id/bracket/generate', authenticateToken, requireRole(['organizer', 'admin']), matchCtrl.generateBracket);
router.get('/tournaments/:id/matches', matchCtrl.getTournamentMatches);
router.get('/matches/:id', matchCtrl.getMatchById);
router.patch('/matches/:id/schedule', authenticateToken, requireRole(['organizer', 'admin']), matchCtrl.scheduleMatch);
router.post('/matches/:id/results', authenticateToken, requireRole(['organizer', 'admin']), matchCtrl.submitMatchResults);

// ==================== ROOM CREDENTIALS ====================
router.post('/matches/:id/room', authenticateToken, requireRole(['organizer', 'admin']), roomCtrl.setRoomDetails);
router.get('/matches/:id/room', authenticateToken, roomCtrl.getRoomDetails);
router.patch('/matches/:id/room/revoke', authenticateToken, requireRole(['organizer', 'admin']), roomCtrl.toggleRevokeRoom);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authenticateToken, notifCtrl.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, notifCtrl.markAsRead);
router.post('/notifications/read-all', authenticateToken, notifCtrl.markAllAsRead);

// ==================== DISPUTES & REPORTS ====================
router.post('/disputes', authenticateToken, disputeCtrl.createDispute);
router.get('/disputes', authenticateToken, requireRole(['organizer', 'admin']), disputeCtrl.getDisputes);
router.patch('/disputes/:id', authenticateToken, requireRole(['admin']), disputeCtrl.resolveDispute);

// ==================== PAYMENTS (TEST / SANDBOX) ====================
router.post('/payments/create-order', authenticateToken, paymentCtrl.createPaymentOrder);
router.post('/payments/verify', authenticateToken, paymentCtrl.verifyPayment);
router.get('/payments/history', authenticateToken, paymentCtrl.getPaymentHistory);

// ==================== ADMIN OVERSIGHT ====================
router.get('/admin/stats', authenticateToken, requireRole(['admin']), adminCtrl.getAdminStats);
router.get('/admin/users', authenticateToken, requireRole(['admin']), adminCtrl.getUsers);
router.patch('/admin/users/:id/status', authenticateToken, requireRole(['admin']), adminCtrl.toggleUserStatus);
router.post('/admin/tournaments/:id/cancel', authenticateToken, requireRole(['admin']), adminCtrl.cancelTournamentByAdmin);
router.get('/admin/audit-logs', authenticateToken, requireRole(['admin']), adminCtrl.getAuditLogs);
router.post('/admin/clean-users', authenticateToken, requireRole(['admin']), adminCtrl.cleanAllUsers);

export default router;
