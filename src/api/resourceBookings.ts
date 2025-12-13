import { api } from './client';
import type { ResourceBooking, CreateResourceBookingDto } from '../types';

export const resourceBookingsApi = {
  async getAll(establishmentId: string, date?: string): Promise<ResourceBooking[]> {
    const response = await api.get('/resource-bookings', {
      params: { establishmentId, date },
    });
    return response.data;
  },

  async getById(id: string): Promise<ResourceBooking> {
    const response = await api.get(`/resource-bookings/${id}`);
    return response.data;
  },

  async create(data: CreateResourceBookingDto): Promise<ResourceBooking> {
    const response = await api.post('/resource-bookings', data);
    return response.data;
  },

  async update(
    id: string,
    data: Partial<CreateResourceBookingDto>
  ): Promise<ResourceBooking> {
    const response = await api.patch(`/resource-bookings/${id}`, data);
    return response.data;
  },

  async cancel(id: string): Promise<ResourceBooking> {
    const response = await api.patch(`/resource-bookings/${id}/cancel`);
    return response.data;
  },

  async complete(id: string): Promise<ResourceBooking> {
    const response = await api.patch(`/resource-bookings/${id}/complete`);
    return response.data;
  },

  async createRecurring(data: CreateResourceBookingDto): Promise<ResourceBooking[]> {
    const response = await api.post('/resource-bookings/recurring', data);
    return response.data;
  },
};
