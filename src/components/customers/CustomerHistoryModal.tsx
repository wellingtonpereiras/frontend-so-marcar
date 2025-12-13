import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User, Scissors } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomerHistoryModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
}

export function CustomerHistoryModal({ open, onClose, customer }: CustomerHistoryModalProps) {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['customer-appointments', customer.id],
    queryFn: async () => {
      // Buscar todos agendamentos do estabelecimento e filtrar por cliente
      const allAppointments = await appointmentsApi.getAll(customer.establishmentId);
      return allAppointments.filter(apt => apt.customerId === customer.id);
    },
    enabled: open && !!customer.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'no_show':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'Faltou';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Histórico de Agendamentos - {customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
              <p className="text-2xl font-bold">{customer.totalAppointments}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cancelamentos</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {customer.cancelledAppointments}
              </p>
            </div>
          </div>

          {/* Lista de Agendamentos */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando histórico...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .sort((a, b) => {
                  // Ordenar por data decrescente (mais recente primeiro)
                  const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`);
                  const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Data e Hora */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {format(new Date(appointment.scheduledDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {appointment.scheduledTime}
                          </div>
                        </div>

                        {/* Serviço e Profissional */}
                        <div className="flex flex-col gap-1">
                          {appointment.service && (
                            <div className="flex items-center gap-2 text-sm">
                              <Scissors className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.service.name}</span>
                              <span className="text-muted-foreground">
                                ({appointment.durationMinutes} min)
                              </span>
                            </div>
                          )}
                          {appointment.professional && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              {appointment.professional.name}
                            </div>
                          )}
                        </div>

                        {/* Observações */}
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            "{appointment.notes}"
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
