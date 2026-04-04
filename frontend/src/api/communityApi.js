import { communityClient } from './apiClient';

export const communityApi = {
  getPosts: (params) => communityClient.get('/posts', { params }),
  getPostById: (id) => communityClient.get(`/posts/${id}`),
  createPost: (formData) => communityClient.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  likePost: (id) => communityClient.post(`/posts/${id}/like`),
  addComment: (postId, content) => communityClient.post(`/posts/${postId}/comments`, { content }),
  reportPost: (id, reason) => communityClient.post(`/posts/${id}/report`, { reason }),
  deletePost: (id) => communityClient.delete(`/posts/${id}`),
  getProfile: (userId) => communityClient.get(`/profiles/${userId}`),
  updateProfile: (data) => communityClient.patch('/profiles/me', data),
};
