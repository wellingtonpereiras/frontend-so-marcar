import { api } from './client';
import type { Resource, CreateResourceDto } from '../types';

export const resourcesApi = {
  async getAll(establishmentId: string): Promise<Resource[]> {
    const response = await api.get(`/resources`, {
      params: { establishmentId },
    });
    return response.data;
  },

  async getById(id: string): Promise<Resource> {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  async create(data: CreateResourceDto): Promise<Resource> {
    const response = await api.post('/resources', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateResourceDto>): Promise<Resource> {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },

  async toggleActive(id: string): Promise<Resource> {
    const response = await api.patch(`/resources/${id}/toggle-active`);
    return response.data;
  },

  async checkAvailability(
    resourceId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<{ available: boolean; conflicts?: any[] }> {
    const response = await api.get(`/resources/${resourceId}/availability`, {
      params: { date, startTime, endTime },
    });
    return response.data;
  },
};
