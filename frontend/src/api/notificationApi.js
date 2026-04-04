import axiosInstance from "./axiosInstance";

export const notificationApi = {
  getNotifications: (userId, params) => 
    axiosInstance.get(`/api/notifications/${userId}`, { params }),
    
  getUnreadCount: (userId) => 
    axiosInstance.get(`/api/notifications/${userId}/unread-count`),
    
  markAsRead: (id) => 
    axiosInstance.patch(`/api/notifications/${id}/read`),
    
  markAllAsRead: (userId) => 
    axiosInstance.patch(`/api/notifications/${userId}/read-all`),
    
  deleteNotification: (id) => 
    axiosInstance.delete(`/api/notifications/${id}`),
};
