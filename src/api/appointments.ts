import { api } from './client';
import type { Appointment, CreateAppointmentDto } from '../types';

export const appointmentsApi = {
  getAll: async (establishmentId: string, date?: string): Promise<Appointment[]> => {
    const params = new URLSearchParams({ establishmentId });
    if (date) params.append('date', date);
    const { data } = await api.get(`/appointments?${params}`);
    return data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const { data } = await api.get(`/appointments/${id}`);
    return data;
  },

  create: async (appointment: CreateAppointmentDto): Promise<Appointment> => {
    const { data } = await api.post('/appointments', appointment);
    return data;
  },

  update: async (id: string, updates: Partial<CreateAppointmentDto>): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}`, updates);
    return data;
  },

  cancel: async (id: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/cancel`);
    return data;
  },

  complete: async (id: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/complete`);
    return data;
  },

  approve: async (id: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/approve`);
    return data;
  },

  reject: async (id: string): Promise<Appointment> => {
    const { data } = await api.patch(`/appointments/${id}/reject`);
    return data;
  },
};
