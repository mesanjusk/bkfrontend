import api from '../api';

export const whatsappService = {
  getConnections: () => api.get('/whatsapp/connections'),
  getTemplates: () => api.get('/whatsapp/templates'),
  getMessages: () => api.get('/whatsapp/messages'),
  getRecipients: () => api.get('/whatsapp/recipients'),
  getInbox: () => api.get('/whatsapp/inbox'),
  getConversation: (conversationKey) => api.get(`/whatsapp/conversation/${conversationKey}`),
  markConversationRead: (conversationKey) => api.post(`/whatsapp/conversation/${conversationKey}/read`),
  getRules: () => api.get('/whatsapp/auto-reply-rules'),
  saveRule: (payload, id) => id ? api.put(`/whatsapp/auto-reply-rules/${id}`, payload) : api.post('/whatsapp/auto-reply-rules', payload),
  sendText: (payload) => api.post('/whatsapp/send-text', payload),
  sendInvitation: (payload) => api.post('/whatsapp/send-invitation', payload),
};

export default whatsappService;
