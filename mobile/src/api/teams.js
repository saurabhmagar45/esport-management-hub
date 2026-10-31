import { apiClient } from './client';

export const teamsAPI = {
  getMyTeams: () => apiClient.get('/teams'),
  getById: (id) => apiClient.get(`/teams/${id}`),
  create: (data) => apiClient.post('/teams', data),
  join: (inviteCode) => apiClient.post('/teams/join', { inviteCode }),
  removeMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
  regenerateCode: (teamId) => apiClient.post(`/teams/${teamId}/regenerate-code`),
  leaveTeam: (teamId) => apiClient.post(`/teams/${teamId}/leave`),
};
