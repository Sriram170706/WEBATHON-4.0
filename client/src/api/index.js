import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('mwp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Global response error handler
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('mwp_token');
            localStorage.removeItem('mwp_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── AUTH ──────────────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// ── FREELANCER ────────────────────────────────────────────────────
export const getDashboard = () => api.get('/tasks/dashboard');
export const getMyDomains = () => api.get('/tasks/my-domains');
export const getAvailableTasks = (params) => api.get('/tasks/available-tasks', { params });

// ── CLIENT ────────────────────────────────────────────────────────
export const createTask = (data) => api.post('/tasks/create-task', data);
export const getMyTasks = () => api.get('/tasks/my-tasks');
export const getTaskApplicants = (id) => api.get(`/tasks/task/${id}/applicants`);

// ── TASK ACTIONS ──────────────────────────────────────────────────
export const applyToTask = (taskId, data) => api.post(`/tasks/apply/${taskId}`, data);
export const selectFreelancer = (taskId, fId) => api.post(`/tasks/select/${taskId}/${fId}`);
export const completeTask = (taskId) => api.post(`/tasks/complete/${taskId}`);
export const rateTask = (taskId, data) => api.post(`/tasks/rate/${taskId}`, data);

export default api;
