import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Axios instance with default configuration
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor for error handling
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth API
// ============================================

export const authAPI = {
    requestOTP: (email) => api.post('/auth/request-otp', { email }),
    verifyOTP: (email, code) => api.post('/auth/verify-otp', { email, code }),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/me', data),
    searchUsers: (search) => api.get('/auth/users', { params: { search } }),
};

// ============================================
// Chat API
// ============================================

export const chatAPI = {
    getChats: () => api.get('/chats'),
    createChat: (participantId) => api.post('/chats', { participantId }),
    getChat: (chatId) => api.get(`/chats/${chatId}`),
};

// ============================================
// Message API
// ============================================

export const messageAPI = {
    getMessages: (chatId, params = {}) => api.get(`/messages/${chatId}`, { params }),
    sendMessage: (chatId, content) => api.post(`/messages/${chatId}`, { content }),
    markSeen: (chatId) => api.put(`/messages/${chatId}/seen`),
};

export default api;
