import { apiClient } from './client';

export const paymentsAPI = {
  createOrder: (tournamentId, teamId) =>
    apiClient.post('/payments/create-order', { tournamentId, teamId }),
  verifyPayment: (orderId, paymentId, signature) =>
    apiClient.post('/payments/verify', { orderId, paymentId, signature }),
  getHistory: () => apiClient.get('/payments/history'),
};
