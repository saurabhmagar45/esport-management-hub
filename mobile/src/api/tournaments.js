import { apiClient } from './client';

export const tournamentsAPI = {
  list: (params) => apiClient.get('/tournaments', { params }),
  getById: (id) => apiClient.get(`/tournaments/${id}`),
  getRoomDetails: (id) => apiClient.get(`/tournaments/${id}/room`),
  setRoomDetails: (id, data) => apiClient.post(`/tournaments/${id}/room`, data),
  create: (data) => apiClient.post('/tournaments', data),
  getStandings: (id) => apiClient.get(`/tournaments/${id}/standings`),
};
