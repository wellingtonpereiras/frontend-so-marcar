import { api } from './client';
import type { Customer } from '../types';

export const customersApi = {
  getAll: async (establishmentId: string): Promise<Customer[]> => {
    const { data } = await api.get(`/customers?establishmentId=${establishmentId}`);
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

  create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'totalAppointments' | 'cancelledAppointments'>): Promise<Customer> => {
    const { data } = await api.post('/customers', customer);
    return data;
  },

  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    const { data } = await api.patch(`/customers/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
