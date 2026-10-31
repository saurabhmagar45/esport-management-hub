import { apiClient } from './client';

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.post('/notifications/read-all'),
};

export const disputesAPI = {
  create: (data) => apiClient.post('/disputes', data),
};
