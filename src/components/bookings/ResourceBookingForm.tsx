import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resourceBookingsApi } from '../../api/resourceBookings';
import { resourcesApi } from '../../api/resources';
import { customersApi } from '../../api/customers';
import { useAuthStore } from '../../stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import toast from 'react-hot-toast';
import type { Appointment } from '../../types';

interface ResourceBookingFormProps {
  open: boolean;
  onClose: () => void;
  booking?: Appointment | null; // Mudado de ResourceBooking para Appointment
}

export function ResourceBookingForm({ open, onClose, booking }: ResourceBookingFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [resourceId, setResourceId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', user?.establishmentId],
    queryFn: () => resourcesApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId && open,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', user?.establishmentId],
    queryFn: () => customersApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId && open,
  });

  useEffect(() => {
    if (booking) {
      setResourceId(booking.resourceId || '');
      setCustomerId(booking.customerId);
      setScheduledDate(booking.scheduledDate);
      setScheduledTime(booking.scheduledTime);
      setEndTime(booking.endTime || '');
      setNotes(booking.notes || '');
    } else {
      setResourceId('');
      setCustomerId('');
      setScheduledDate('');
      setScheduledTime('');
      setEndTime('');
      setNotes('');
    }
  }, [booking, open]);

  const createMutation = useMutation<Appointment, Error, any>({
    mutationFn: (data: any) => resourceBookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Reserva criada com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar reserva';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      resourceBookingsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Reserva atualizada com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar reserva';
      toast.error(message);
    },
  });

  const validateForm = () => {
    if (!resourceId) {
      toast.error('Selecione um recurso');
      return false;
    }

    if (!customerId) {
      toast.error('Selecione um cliente');
      return false;
    }

    if (!scheduledDate) {
      toast.error('Selecione uma data');
      return false;
    }

    if (!scheduledTime || !endTime) {
      toast.error('Preencha os horários de início e fim');
      return false;
    }

    if (scheduledTime >= endTime) {
      toast.error('Horário de início deve ser anterior ao horário de fim');
      return false;
    }

    return true;
  };

  const buildBookingData = () => {
    // Calcular durationMinutes baseado em scheduledTime e endTime
    const [startHour, startMin] = scheduledTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    return {
      resourceId,
      customerId,
      scheduledDate,
      scheduledTime,
      endTime,
      durationMinutes,
      establishmentId: user!.establishmentId,
      bookingSource: 'web' as const,
      notes: notes.trim() || undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = buildBookingData();

    if (booking) {
      updateMutation.mutate({ id: booking.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const activeResources = resources.filter((r) => r.isActive);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>
          {booking ? 'Editar Reserva' : 'Nova Reserva'}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="resource">Recurso *</Label>
            <Select
              id="resource"
              value={resourceId}
              onChange={setResourceId}
              options={activeResources.map((resource) => ({
                value: resource.id,
                label: resource.name,
                subtitle: resource.isFree ? 'Gratuito' : `R$ ${resource.hourlyRate}/h`
              }))}
              placeholder="Selecione um recurso"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Select
              id="customer"
              value={customerId}
              onChange={setCustomerId}
              options={customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
                subtitle: customer.phone
              }))}
              placeholder="Selecione um cliente"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">Hora Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais (opcional)"
              className="w-full min-h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
            />
          </div>


        </form>
      </DialogContent>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {createMutation.isPending || updateMutation.isPending
            ? 'Salvando...'
            : booking
            ? 'Atualizar'
            : 'Criar'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
