import { api } from './client';
import type { Appointment } from '../types';

/**
 * API para gerenciar reservas de recursos.
 * 
 * IMPORTANTE: No backend, reservas de recursos são criadas como Appointments
 * com o campo resourceId preenchido. Não existe controller separado de ResourceBookings.
 * 
 * As reservas são listadas via GET /resources/{id}/bookings
 * E canceladas via DELETE /resources/bookings/{bookingId}
 */
export const resourceBookingsApi = {
  /**
   * Listar todas as reservas de um recurso específico
   * GET /resources/{id}/bookings
   */
  async getAllByResource(
    resourceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Appointment[]> {
    const response = await api.get(`/resources/${resourceId}/bookings`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  /**
   * Criar uma nova reserva de recurso
   * POST /appointments (com resourceId preenchido)
   */
  async create(data: {
    establishmentId: string;
    customerId: string;
    resourceId: string; // Campo que indica que é reserva de recurso
    scheduledDate: string; // YYYY-MM-DD
    scheduledTime: string; // HH:mm
    endTime: string; // HH:mm (obrigatório para recursos)
    durationMinutes: number;
    notes?: string;
    bookingSource?: 'manual' | 'whatsapp_bot' | 'web';
  }): Promise<Appointment> {
    const response = await api.post('/appointments', {
      ...data,
      bookingSource: data.bookingSource || 'manual',
    });
    return response.data;
  },

  /**
   * Atualizar uma reserva existente
   * PATCH /appointments/{id}
   */
  async update(
    id: string,
    data: {
      scheduledDate?: string;
      scheduledTime?: string;
      endTime?: string;
      notes?: string;
      status?: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    }
  ): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Cancelar uma reserva
   * DELETE /resources/bookings/{bookingId}
   */
  async cancel(bookingId: string, cancelAllRecurring = false): Promise<void> {
    await api.delete(`/resources/bookings/${bookingId}`, {
      params: { cancelAllRecurring },
    });
  },

  /**
   * Marcar reserva como concluída
   * PATCH /appointments/{id}/complete
   */
  async complete(id: string): Promise<Appointment> {
    const response = await api.patch(`/appointments/${id}/complete`);
    return response.data;
  },

  /**
   * Obter estatísticas de um recurso
   * GET /resources/{id}/stats
   */
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

  /**
   * Obter slots disponíveis de um recurso
   * GET /resources/{id}/slots
   */
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
};
