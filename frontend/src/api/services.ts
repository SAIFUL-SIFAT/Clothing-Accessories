import api from './axios';

export const productApi = {
    getAll: (type?: string, search?: string) => api.get('/products', { params: { type, q: search } }),
    getById: (id: number) => api.get(`/products/${id}`),
};

export const userApi = {
    signup: (data: any) => api.post('/users/signup', data),
    login: (data: any) => api.post('/users/login', data),
    getAll: () => api.get('/users'),
    update: (id: number, data: any) => api.patch(`/users/${id}`, data),
    remove: (id: number) => api.delete(`/users/${id}`),
};
