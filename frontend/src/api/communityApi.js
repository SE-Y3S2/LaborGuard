import axiosInstance from './axiosInstance';

export const communityApi = {
  // Posts
  getPosts: (params) => axiosInstance.get('/community/posts', { params }),
  createPost: (data) => axiosInstance.post('/community/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPostById: (id) => axiosInstance.get(`/community/posts/${id}`),
  updatePost: (id, data) => axiosInstance.put(`/community/posts/${id}`, data),
  deletePost: (id) => axiosInstance.delete(`/community/posts/${id}`),
  likePost: (id) => axiosInstance.post(`/community/posts/${id}/like`),
  
  // Comments
  getComments: (postId) => axiosInstance.get(`/community/posts/${postId}/comments`),
  addComment: (postId, data) => axiosInstance.post(`/community/posts/${postId}/comments`, data),
  deleteComment: (postId, commentId) => axiosInstance.delete(`/community/posts/${postId}/comments/${commentId}`),
  
  // Profiles
  getProfile: (userId) => axiosInstance.get(`/community/profiles/${userId}`),
  updateProfile: (data) => axiosInstance.put('/community/profiles/me', data),
};
