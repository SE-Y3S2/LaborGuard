import { messageClient } from './apiClient';

export const messageApi = {
  // FIX: added — useMessaging hook calls messageApi.createConversation(data) but old file had no such method
  createConversation: (data) => messageClient.post('/conversations', data),

  // FIX: was GET /conversations (no backend route existed for that)
  // Backend: GET /api/conversations — userId read from JWT inside controller
  getConversations: () => messageClient.get('/conversations'),

  // FIX: was GET /conversations/:conversationId/messages — backend route is GET /messages/:conversationId
  getMessages: (conversationId) => messageClient.get(`/messages/${conversationId}`),

  sendMessage: (data) => messageClient.post('/messages', data),

  // FIX: was PATCH /conversations/:conversationId/read — backend route is PATCH /messages/:conversationId/read
  markAsRead: (conversationId) => messageClient.patch(`/messages/${conversationId}/read`),

  deleteMessage: (messageId) => messageClient.delete(`/messages/${messageId}`),

  // NOTE: getUnreadCount removed — no backend route exists for this endpoint.
  // Unread counts are derived from the conversations list (lastMessage.readBy) on the frontend.
};