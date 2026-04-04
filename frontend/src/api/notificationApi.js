import { notificationClient } from './apiClient'; 

export const notificationApi = {
  /**
   * Fetch all notifications for the authenticated user.
   * Service: Notification-Service (Port 3004)
   */
  getNotifications: () => notificationClient.get('/notifications'),
  
  /**
   * Mark a single notification as read.
   */
  markAsRead: (id) => notificationClient.patch(`/notifications/${id}/read`),
  
  /**
   * Mark all notifications as read.
   */
  markAllAsRead: () => notificationClient.patch('/notifications/read-all'),
  
  /**
   * Get unread notification count.
   */
  getUnreadCount: () => notificationClient.get('/notifications/unread-count'),
  
  /**
   * Update notification settings/preferences.
   */
  updateSettings: (data) => notificationClient.patch('/notifications/settings', data),
};
