import { api } from './client';
import type { Service } from '../types';

export const servicesApi = {
  getAll: async (establishmentId: string): Promise<Service[]> => {
    const { data } = await api.get(`/services?establishmentId=${establishmentId}`);
    return data;
  },

  getById: async (id: string): Promise<Service> => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },

  create: async (service: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    const { data } = await api.post('/services', service);
    return data;
  },

  update: async (id: string, updates: Partial<Service>): Promise<Service> => {
    const { data } = await api.patch(`/services/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },

  toggleActive: async (id: string): Promise<Service> => {
    const { data } = await api.patch(`/services/${id}/toggle-active`);
    return data;
  },
};
