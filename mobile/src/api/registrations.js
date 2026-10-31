import { apiClient } from './client';

export const registrationsAPI = {
  register: (tournamentId, teamId, roster) =>
    apiClient.post(`/tournaments/${tournamentId}/registrations`, { teamId, roster }),
  getMyRegistrations: () => apiClient.get('/registrations/me'),
};
