import axios from 'axios';

const API_URL = 'https://quizquest-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Challenge API
export const challengeApi = {
  getAll: () => api.get('/challenges/'),
  getById: (id) => api.get(`/challenges/${id}/`),
  create: (data) => api.post('/challenges/', data),
  update: (id, data) => api.put(`/challenges/${id}/`, data),
  delete: (id) => api.delete(`/challenges/${id}/`),
};

// User API
export const userApi = {
  getAll: () => api.get('/users/'),
  getById: (uid) => api.get(`/users/${uid}/`),
  create: (data) => api.post('/users/', data),
  update: (uid, data) => api.put(`/users/${uid}/`, data),
};

// Attempt API
export const attemptApi = {
  getAll: () => api.get('/attempts/'),
  getById: (id) => api.get(`/attempts/${id}/`),
  create: (data) => api.post('/attempts/', data),
  getUserAttempts: (uid) => api.get(`/attempts/?user_uid=${uid}`),
};

export default api;
