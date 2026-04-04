import axiosInstance from './axiosInstance';

export const messageApi = {
  getConversations: () => axiosInstance.get('/messaging/conversations'),
  getMessages: (conversationId) => axiosInstance.get(`/messaging/conversations/${conversationId}/messages`),
  sendMessage: (data) => axiosInstance.post('/messaging/messages', data),
  markAsRead: (messageId) => axiosInstance.patch(`/messaging/messages/${messageId}/read`),
  deleteMessage: (messageId) => axiosInstance.delete(`/messaging/messages/${messageId}`),
};
