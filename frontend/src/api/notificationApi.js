import { notificationClient } from './apiClient';

export const notificationApi = {
  // FIX: was GET /notifications/:userId (required userId in URL — now read from JWT in backend)
  // Backend: GET /api/notifications — userId from req.user.userId
  getNotifications: () => notificationClient.get('/notifications'),

  // FIX: was GET /notifications/unread-count — backend now GET /notifications/unread-count (JWT-based)
  getUnreadCount: () => notificationClient.get('/notifications/unread-count'),

  // Mark single notification read — uses notification document _id, not userId — no change needed
  markAsRead: (id) => notificationClient.patch(`/notifications/${id}/read`),

  // FIX: was PATCH /notifications/read-all — backend now PATCH /notifications/read-all (JWT-based)
  markAllAsRead: () => notificationClient.patch('/notifications/read-all'),

  // Update notification settings
  updateSettings: (data) => notificationClient.patch('/notifications/settings', data),
};