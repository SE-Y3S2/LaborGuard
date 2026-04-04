import { messageClient } from './apiClient';

export const messageApi = {
  getConversations: () => messageClient.get('/conversations'),
  getMessages: (conversationId) => messageClient.get(`/conversations/${conversationId}/messages`),
  sendMessage: (data) => messageClient.post('/messages', data),
  getUnreadCount: () => messageClient.get('/messages/unread-count'),
  markAsRead: (conversationId) => messageClient.patch(`/conversations/${conversationId}/read`),
};
