import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceBookingsApi } from '../../api/resourceBookings';
import { resourcesApi } from '../../api/resources';
import { useAuthStore } from '../../stores/authStore';
import { Plus, Pencil, X, CheckCircle, Calendar, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResourceBookingForm } from '../../components/bookings/ResourceBookingForm';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import toast from 'react-hot-toast';
import type { ResourceBooking } from '../../types';

export default function ResourceBookingsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<ResourceBooking | null>(null);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [resourceFilter, setResourceFilter] = useState<string>('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['resource-bookings', user?.establishmentId, dateFilter],
    queryFn: () => resourceBookingsApi.getAll(user!.establishmentId, dateFilter || undefined),
    enabled: !!user?.establishmentId,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['resources', user?.establishmentId],
    queryFn: () => resourcesApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => resourceBookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      toast.success('Reserva cancelada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cancelar reserva');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => resourceBookingsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      toast.success('Reserva concluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao concluir reserva');
    },
  });

  const handleEdit = (booking: ResourceBooking) => {
    setEditingBooking(booking);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingBooking(null);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateFilter('');
    setResourceFilter('all');
  };

  // Filtrar reservas
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }

      if (resourceFilter !== 'all' && booking.resourceId !== resourceFilter) {
        return false;
      }

      return true;
    });
  }, [bookings, statusFilter, resourceFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: 'Agendado',
      confirmed: 'Confirmado',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas de Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as reservas de espaços e recursos
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                id="status-filter"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'scheduled', label: 'Agendado' },
                  { value: 'confirmed', label: 'Confirmado' },
                  { value: 'completed', label: 'Concluído' },
                  { value: 'cancelled', label: 'Cancelado' }
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-filter">Data</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-filter">Recurso</Label>
              <Select
                id="resource-filter"
                value={resourceFilter}
                onChange={setResourceFilter}
                options={[
                  { value: 'all', label: 'Todos' },
                  ...resources.map((resource) => ({
                    value: resource.id,
                    label: resource.name
                  }))
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredBookings.length} de {bookings.length} reservas
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reservas */}
      <Card>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {bookings.length === 0
                  ? 'Nenhuma reserva cadastrada'
                  : 'Nenhuma reserva encontrada com os filtros selecionados'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => {
                    const duration = booking.endTime && booking.startTime
                      ? `${parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0])}h`
                      : '-';

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(booking.bookingDate), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{booking.resource?.name}</div>
                            {booking.recurrencePattern && (
                              <div className="text-xs text-muted-foreground">
                                Recorrente
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{booking.customer?.name}</div>
                            <div className="text-muted-foreground">{booking.customer?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{duration}</TableCell>
                        <TableCell className="text-sm">
                          {booking.resource?.isFree ? (
                            <span className="text-green-600 font-medium">Grátis</span>
                          ) : (
                            `R$ ${booking.totalPrice.toFixed(2)}`
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleEdit(booking)}
                              disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                              title="Editar"
                              variant="outline"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => completeMutation.mutate(booking.id)}
                              disabled={booking.status !== 'scheduled' && booking.status !== 'confirmed'}
                              title="Concluir"
                              variant="outline"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => cancelMutation.mutate(booking.id)}
                              disabled={booking.status === 'cancelled' || booking.status === 'completed'}
                              title="Cancelar"
                              variant="outline"
                              className="text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ResourceBookingForm
        open={formOpen}
        onClose={handleCloseForm}
        booking={editingBooking}
      />
    </div>
  );
}
