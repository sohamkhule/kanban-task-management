import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kanban_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getUsers = () => api.get('/auth/users');

// Tasks
export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const moveTask = (id, data) => api.patch(`/tasks/${id}/move`, data);

// Columns
export const getColumns = () => api.get('/columns');
export const createColumn = (title) => api.post('/columns', { title });
export const deleteColumn = (id) => api.delete(`/columns/${id}`);
export const reorderColumns = (columnOrder) => api.patch('/columns/reorder', { columnOrder });

export default api;
