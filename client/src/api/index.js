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
export const getMyApplications = () => api.get('/tasks/my-applications');
export const getAvailableTasks = (params) => api.get('/tasks/available-tasks', { params });
export const addDomain = (domainName) => api.patch('/tasks/add-domain', { domainName });

// ── CLIENT ────────────────────────────────────────────────────────
export const createTask = (data) => api.post('/tasks/create-task', data);
export const getMyTasks = () => api.get('/tasks/my-tasks');
export const getTaskApplicants = (id) => api.get(`/tasks/task/${id}/applicants`);

// ── TASK ACTIONS ──────────────────────────────────────────────────
export const applyToTask = (taskId, data) => api.post(`/tasks/apply/${taskId}`, data);
export const selectFreelancer = (taskId, fId) => api.post(`/tasks/select/${taskId}/${fId}`);
export const completeTask = (taskId, data = {}) => api.post(`/tasks/complete/${taskId}`, data);
export const rateTask = (taskId, data) => api.post(`/tasks/rate/${taskId}`, data);
export const getTaskById = (taskId) => api.get(`/tasks/task-detail/${taskId}`);

// ── MESSAGING ─────────────────────────────────────────────────────
export const getMessages = (taskId) => api.get(`/tasks/${taskId}/messages`);
export const sendMessage = (taskId, text) => api.post(`/tasks/${taskId}/messages`, { text });

export default api;
