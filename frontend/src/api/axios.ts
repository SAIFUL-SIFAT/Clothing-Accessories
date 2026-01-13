import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
    const user = localStorage.getItem('user');
    if (user) {
        const { access_token } = JSON.parse(user);
        if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;

        // If it's a 500 error and we haven't retried yet, it might be the DB waking up
        if (response?.status === 500 && !config._retry) {
            config._retry = true;
            console.warn('Backend returned 500, might be DB wake-up. Retrying in 2s...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return api(config);
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
