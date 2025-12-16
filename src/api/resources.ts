import { api } from './client';
import type { Resource, CreateResourceDto } from '../types';

export const resourcesApi = {
  async getAll(establishmentId: string): Promise<Resource[]> {
    const response = await api.get(`/resources/establishment/${establishmentId}`);
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
  ): Promise<{
    available: boolean;
    currentOccupancy: number;
    maxCapacity: number;
    reason: string | null;
  }> {
    const response = await api.get(`/resources/${resourceId}/availability`, {
      params: { date, startTime, endTime },
    });
    return response.data;
  },

  async getAvailableSlots(
    resourceId: string,
    date: string
  ): Promise<Array<{
    time: string;
    available: boolean;
    currentOccupancy: number;
  }>> {
    const response = await api.get(`/resources/${resourceId}/slots`, {
      params: { date },
    });
    return response.data;
  },

  async getBookings(
    resourceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const response = await api.get(`/resources/${resourceId}/bookings`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getStats(
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalBookings: number;
    totalHours: number;
    averageOccupancy: number;
  }> {
    const response = await api.get(`/resources/${resourceId}/stats`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
