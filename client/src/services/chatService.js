import api from './api';

export const getConversations = () => api.get('/messages/conversations');
export const getConversation = (userId) => api.get(`/messages/${userId}`);
