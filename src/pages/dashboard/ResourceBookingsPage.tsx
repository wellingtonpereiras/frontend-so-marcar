import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Clock, User, Phone, MapPin, DollarSign, CheckCircle, XCircle, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAppointmentsSocket } from '../../hooks/useAppointmentsSocket';

export default function ResourceBookingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Buscar todos os agendamentos
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments', user?.establishmentId],
    queryFn: () => appointmentsApi.getAll(user?.establishmentId || ''),
    enabled: !!user?.establishmentId,
  });

  // Filtrar apenas reservas de recursos (têm resourceId)
  const resourceBookings = appointments.filter(apt => apt.resourceId);

  // Aplicar filtro de status
  const filteredBookings = resourceBookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.status === 'pending';
    if (filter === 'approved') return booking.status === 'confirmed';
    if (filter === 'rejected') return booking.status === 'rejected';
    return true;
  });

  // Contar por status
  const pendingCount = resourceBookings.filter(b => b.status === 'pending').length;
  const approvedCount = resourceBookings.filter(b => b.status === 'confirmed').length;
  const rejectedCount = resourceBookings.filter(b => b.status === 'rejected').length;

  // Função para tocar som de notificação
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Som de notificação não disponível:', err));
    } catch (err) {
      // Som não disponível, ignorar
    }
  }, []);

  // Callbacks memoizadas para evitar reconexões do WebSocket
  const handleNewBooking = useCallback((appointment: any) => {
    console.log('🆕 Nova solicitação recebida em tempo real!', appointment);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    toast.success(
      `Nova solicitação de reserva!\n${appointment.customer?.name || 'Cliente'} - ${appointment.resource?.name || 'Recurso'}`,
      { duration: 5000, icon: '🔔' }
    );
    playNotificationSound();
  }, [queryClient, playNotificationSound]);

  const handleBookingApproved = useCallback((appointment: any) => {
    console.log('✅ Reserva aprovada!', appointment);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }, [queryClient]);

  const handleBookingRejected = useCallback((appointment: any) => {
    console.log('❌ Reserva rejeitada!', appointment);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }, [queryClient]);

  const handleBookingCancelled = useCallback((appointment: any) => {
    console.log('🚫 Reserva cancelada!', appointment);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    toast(`Reserva cancelada: ${appointment.resource?.name || 'Recurso'}`);
  }, [queryClient]);

  const handleBookingUpdated = useCallback((appointment: any) => {
    console.log('🔄 Reserva atualizada!', appointment);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }, [queryClient]);

  // WebSocket para notificações em tempo real
  const { isConnected, isSubscribed } = useAppointmentsSocket({
    establishmentId: user?.establishmentId || '',
    enabled: !!user?.establishmentId,
    onNewBooking: handleNewBooking,
    onBookingApproved: handleBookingApproved,
    onBookingRejected: handleBookingRejected,
    onBookingCancelled: handleBookingCancelled,
    onBookingUpdated: handleBookingUpdated,
  });



  // Mutation para aprovar
  const approveMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.approve(id),
    onSuccess: () => {
      toast.success('Reserva aprovada com sucesso! 🎉');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao aprovar reserva';
      toast.error(message);
    },
  });

  // Mutation para rejeitar
  const rejectMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.reject(id),
    onSuccess: () => {
      toast.success('Reserva rejeitada');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao rejeitar reserva';
      toast.error(message);
    },
  });

  const handleApprove = (id: string, resourceName: string) => {
    if (confirm(`Aprovar reserva de "${resourceName}"?`)) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string, resourceName: string) => {
    if (confirm(`Rejeitar reserva de "${resourceName}"?\n\nEsta ação não pode ser desfeita.`)) {
      rejectMutation.mutate(id);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      confirmed: { label: 'Aprovada', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: XCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Erro ao carregar reservas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reservas de Salas
          </h1>
          
          {/* Indicador de Conexão WebSocket */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {isConnected && isSubscribed ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Tempo Real Ativo
                </span>
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Desconectado
                </span>
              </>
            )}
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as solicitações de reserva de recursos do seu estabelecimento
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Aguardando ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Aprovadas ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Rejeitadas ({rejectedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Todas ({resourceBookings.length})
        </button>
      </div>

      {/* Lista de Reservas */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'pending'
              ? 'Nenhuma solicitação pendente no momento'
              : 'Nenhuma reserva encontrada'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {booking.resource?.name || 'Recurso'}
                    </h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  {booking.resource?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {booking.resource.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Data e Horário */}
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">
                    {formatDate(booking.scheduledDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">
                    {booking.scheduledTime} ({booking.durationMinutes} min)
                  </span>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">{booking.customer?.name}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm">{booking.customer?.phone}</span>
                </div>

                {/* Comodidades */}
                {booking.resource?.amenities && booking.resource.amenities.length > 0 && (
                  <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {booking.resource.amenities.map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preço */}
                {!booking.resource?.isFree && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium">
                      {formatPrice(
                        (booking.resource?.hourlyRate || 0) *
                          (booking.durationMinutes / 60)
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Observações */}
              {booking.notes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Observações:</span> {booking.notes}
                  </p>
                </div>
              )}

              {/* Data da solicitação */}
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Solicitado em {format(new Date(booking.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </div>

              {/* Botões de Ação */}
              {booking.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleApprove(booking.id, booking.resource?.name || 'Recurso')}
                    disabled={approveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Aprovar Reserva
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(booking.id, booking.resource?.name || 'Recurso')}
                    disabled={rejectMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Rejeitar
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Informação de status para aprovadas/rejeitadas */}
              {booking.status === 'confirmed' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Reserva confirmada e lembretes agendados</span>
                  </div>
                </div>
              )}

              {booking.status === 'rejected' && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                    <XCircle className="h-4 w-4" />
                    <span>Reserva rejeitada - horário liberado para novas solicitações</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
