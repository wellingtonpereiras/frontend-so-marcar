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
import type { ResourceBooking } from '../../types';

interface ResourceBookingFormProps {
  open: boolean;
  onClose: () => void;
  booking?: ResourceBooking | null;
}

const RECURRENCE_PATTERNS = [
  { value: '', label: 'Sem recorrência' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' },
];

export function ResourceBookingForm({ open, onClose, booking }: ResourceBookingFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [resourceId, setResourceId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

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
      setResourceId(booking.resourceId);
      setCustomerId(booking.customerId);
      setBookingDate(booking.bookingDate);
      setStartTime(booking.startTime);
      setEndTime(booking.endTime);
      setNotes(booking.notes || '');
      setRecurrencePattern(booking.recurrencePattern || '');
      setRecurrenceEndDate(booking.recurrenceEndDate || '');
    } else {
      setResourceId('');
      setCustomerId('');
      setBookingDate('');
      setStartTime('');
      setEndTime('');
      setNotes('');
      setRecurrencePattern('');
      setRecurrenceEndDate('');
    }
  }, [booking, open]);

  const createMutation = useMutation<ResourceBooking | ResourceBooking[], unknown, any>({
    mutationFn: (data: any) =>
      recurrencePattern
        ? resourceBookingsApi.createRecurring(data)
        : resourceBookingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      toast.success(
        recurrencePattern
          ? 'Reservas recorrentes criadas com sucesso!'
          : 'Reserva criada com sucesso!'
      );
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

    if (!bookingDate) {
      toast.error('Selecione uma data');
      return false;
    }

    if (!startTime || !endTime) {
      toast.error('Preencha os horários de início e fim');
      return false;
    }

    if (startTime >= endTime) {
      toast.error('Horário de início deve ser anterior ao horário de fim');
      return false;
    }

    if (recurrencePattern && !recurrenceEndDate) {
      toast.error('Informe a data de término da recorrência');
      return false;
    }

    return true;
  };

  const buildBookingData = () => ({
    resourceId,
    customerId,
    bookingDate,
    startTime,
    endTime,
    notes: notes.trim() || undefined,
    recurrencePattern: recurrencePattern || undefined,
    recurrenceInterval: recurrencePattern ? 1 : undefined,
    recurrenceEndDate: recurrencePattern ? recurrenceEndDate : undefined,
  });

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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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

          {!booking && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="recurrence">Recorrência</Label>
                <Select
                  id="recurrence"
                  value={recurrencePattern}
                  onChange={setRecurrencePattern}
                  options={RECURRENCE_PATTERNS}
                  placeholder="Sem recorrência"
                />
              </div>

              {recurrencePattern && (
                <div className="grid gap-2">
                  <Label htmlFor="recurrenceEndDate">Repetir até *</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    required={!!recurrencePattern}
                    min={bookingDate}
                  />
                  <p className="text-xs text-muted-foreground">
                    As reservas serão criadas automaticamente até esta data
                  </p>
                </div>
              )}
            </>
          )}
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
            : recurrencePattern
            ? 'Criar Reservas'
            : 'Criar'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
