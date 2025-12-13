import { api } from './client';
import type { Professional } from '../types';

export const professionalsApi = {
  getAll: async (establishmentId: string, includeInactive: boolean = false): Promise<Professional[]> => {
    const { data } = await api.get(`/professionals?establishmentId=${establishmentId}&includeInactive=${includeInactive}`);
    return data;
  },

  getById: async (id: string): Promise<Professional> => {
    const { data } = await api.get(`/professionals/${id}`);
    return data;
  },

  create: async (professional: Omit<Professional, 'id' | 'createdAt'>): Promise<Professional> => {
    const { data } = await api.post('/professionals', professional);
    return data;
  },

  update: async (id: string, updates: Partial<Professional>): Promise<Professional> => {
    const { data } = await api.patch(`/professionals/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/professionals/${id}`);
  },

  toggleActive: async (id: string): Promise<Professional> => {
    const { data} = await api.patch(`/professionals/${id}/toggle-active`);
    return data;
  },
};
