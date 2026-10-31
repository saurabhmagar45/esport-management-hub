import { apiClient } from './client';

export const tournamentsAPI = {
  list: (params) => apiClient.get('/tournaments', { params }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  getRoomDetails: (id) => apiClient.get(`/tournaments/${id}/room`),
  getStandings: (id) => apiClient.get(`/tournaments/${id}/standings`),
};
