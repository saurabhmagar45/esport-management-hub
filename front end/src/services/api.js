import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? 'https://esport-management-hub.onrender.com/api/v1'
    : 'http://localhost:5000/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization bearer token from storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('esport_hub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('esport_hub_token');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, newPassword })
};

export const tournamentsAPI = {
  list: (params) => apiClient.get('/tournaments', { params }),
  get: (id) => apiClient.get(`/tournaments/${id}`),
  create: (data) => apiClient.post('/tournaments', data),
  update: (id, data) => apiClient.put(`/tournaments/${id}`, data),
  addAnnouncement: (id, data) => apiClient.post(`/tournaments/${id}/announcements`, data),
  setRoom: (id, data) => apiClient.post(`/tournaments/${id}/room`, data),
  getRoom: (id) => apiClient.get(`/tournaments/${id}/room`),
  getStandings: (id) => apiClient.get(`/tournaments/${id}/standings`),
  updateStandings: (id, standings) => apiClient.put(`/tournaments/${id}/standings`, { standings })
};

export const teamsAPI = {
  list: (params) => apiClient.get('/teams', { params }),
  get: (id) => apiClient.get(`/teams/${id}`),
  create: (data) => apiClient.post('/teams', data),
  join: (inviteCode) => apiClient.post('/teams/join', { inviteCode }),
  removeMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
  regenerateCode: (teamId) => apiClient.post(`/teams/${teamId}/regenerate-code`),
  transferOwnership: (teamId, newOwnerId) => apiClient.post(`/teams/${teamId}/transfer-ownership`, { newOwnerId }),
  leave: (teamId) => apiClient.post(`/teams/${teamId}/leave`)
};

export const registrationsAPI = {
  register: (tournamentId, data) => {
    const payload = typeof data === 'string' ? { teamId: data } : data;
    return apiClient.post(`/tournaments/${tournamentId}/registrations`, payload);
  },
  list: (tournamentId) => apiClient.get(`/tournaments/${tournamentId}/registrations`),
  myRegistrations: () => apiClient.get('/registrations/me'),
  approve: (regId) => apiClient.patch(`/registrations/${regId}/approve`),
  reject: (regId, reason) => apiClient.patch(`/registrations/${regId}/reject`, { reason })
};

export const matchesAPI = {
  generateBracket: (tournamentId) => apiClient.post(`/tournaments/${tournamentId}/bracket/generate`),
  getMatches: (tournamentId) => apiClient.get(`/tournaments/${tournamentId}/matches`),
  getMatch: (id) => apiClient.get(`/matches/${id}`),
  schedule: (id, scheduledAt) => apiClient.patch(`/matches/${id}/schedule`, { scheduledAt }),
  submitResults: (id, data) => apiClient.post(`/matches/${id}/results`, data)
};

export const roomsAPI = {
  setRoom: (matchId, data) => apiClient.post(`/matches/${matchId}/room`, data),
  getRoom: (matchId) => apiClient.get(`/matches/${matchId}/room`),
  toggleRevoke: (matchId) => apiClient.patch(`/matches/${matchId}/room/revoke`)
};

export const notificationsAPI = {
  list: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.post('/notifications/read-all')
};

export const adminAPI = {
  getStats: () => apiClient.get('/admin/stats'),
  getUsers: () => apiClient.get('/admin/users'),
  toggleUserStatus: (id) => apiClient.patch(`/admin/users/${id}/status`),
  cancelTournament: (id, reason) => apiClient.post(`/admin/tournaments/${id}/cancel`, { reason }),
  getAuditLogs: () => apiClient.get('/admin/audit-logs')
};

export const disputesAPI = {
  create: (data) => apiClient.post('/disputes', data),
  list: (params) => apiClient.get('/disputes', { params }),
  resolve: (id, data) => apiClient.patch(`/disputes/${id}`, data)
};

export const paymentsAPI = {
  createOrder: (tournamentId, teamId) => apiClient.post('/payments/create-order', { tournamentId, teamId }),
  verify: (data) => apiClient.post('/payments/verify', data),
  getHistory: () => apiClient.get('/payments/history')
};

