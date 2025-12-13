import { api } from './client';
import type { BusinessHours, CreateBusinessHoursDto } from '../types';

export const businessHoursApi = {
  getAllFromEstablishment: async (establishmentId: string): Promise<BusinessHours[]> => {
    const { data } = await api.get(`/business-hours?establishmentId=${establishmentId}`);
    return data;
  },

  getAll: async (): Promise<BusinessHours[]> => {
    const { data } = await api.get(`/business-hours`);
    return data;
  },

  getById: async (id: string): Promise<BusinessHours> => {
    const { data } = await api.get(`/business-hours/${id}`);
    return data;
  },

  getByEstablishmentId: async (establishmentId: string): Promise<BusinessHours[]> => {
    const { data } = await api.get(`/business-hours/establishment/${establishmentId}`);
    return data;
  },

  create: async (businessHour: CreateBusinessHoursDto): Promise<BusinessHours> => {
    const { data } = await api.post('/business-hours', businessHour);
    return data;
  },

  update: async (id: string, updates: Partial<BusinessHours>): Promise<BusinessHours> => {
    const { data } = await api.patch(`/business-hours/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/business-hours/${id}`);
  },

  bulkUpdate: async (
    establishmentId: string,
    businessHours: CreateBusinessHoursDto[]
  ): Promise<BusinessHours[]> => {
    const { data } = await api.post('/business-hours/bulk-upsert', {
      establishmentId,
      businessHours,
    });
    return data;
  },
};
