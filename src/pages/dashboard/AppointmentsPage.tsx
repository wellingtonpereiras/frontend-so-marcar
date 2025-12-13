import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { professionalsApi } from '../../api/professionals';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Plus, Pencil, Filter, MessageCircle, Globe, Monitor, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { EditAppointmentForm } from '../../components/appointments/EditAppointmentForm';
import { AppointmentForm } from '../../components/appointments/AppointmentForm';
import { Select } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import type { Appointment } from '../../types';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../components/ui/table";

export default function AppointmentsPage() {
  const user = useAuthStore((state) => state.user);

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [professionalFilter, setProfessionalFilter] = useState<string>('all');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.establishmentId],
    queryFn: () => appointmentsApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const { data: professionals = [] } = useQuery({
    queryKey: ['professionals', user?.establishmentId],
    queryFn: () => professionalsApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingAppointment(null);
  };

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Filtro de status
      if (statusFilter !== 'all' && appointment.status !== statusFilter) {
        return false;
      }

      // Filtro de data
      if (dateFilter && appointment.scheduledDate !== dateFilter) {
        return false;
      }

      // Filtro de profissional
      if (professionalFilter !== 'all' && appointment.professionalId !== professionalFilter) {
        return false;
      }

      return true;
    });
  }, [appointments, statusFilter, dateFilter, professionalFilter]);

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os agendamentos</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-lg border bg-card p-6">
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
                { value: 'all', label: 'Todos os status' },
                { value: 'confirmed', label: 'Confirmado' },
                { value: 'completed', label: 'Concluído' },
                { value: 'cancelled', label: 'Cancelado' },
                { value: 'no_show', label: 'Faltou' },
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
              placeholder="Filtrar por data"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="professional-filter">Profissional</Label>
            <Select
              id="professional-filter"
              value={professionalFilter}
              onChange={setProfessionalFilter}
              options={[
                { value: 'all', label: 'Todos os profissionais' },
                ...professionals.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
          </div>
        </div>
        {(statusFilter !== 'all' || dateFilter || professionalFilter !== 'all') && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Mostrando {filteredAppointments.length} de {appointments.length} agendamentos
            </span>
            <Button
              onClick={() => {
                setStatusFilter('all');
                setDateFilter('');
                setProfessionalFilter('all');
              }}
              className="h-auto p-0"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {appointments.length === 0
                ? 'Nenhum agendamento cadastrado'
                : 'Nenhum agendamento encontrado com os filtros selecionados'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Data/Hora
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Cliente
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Serviço
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Profissional
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Origem
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Lembrete
                  </TableHead>
                  <TableHead className="text-left py-3 px-4 text-sm font-semibold">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="border-b hover:bg-muted/50 transition-colors">
                    <TableCell className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(appointment.scheduledDate), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-muted-foreground">{appointment.scheduledTime}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium">
                          {appointment.customer?.name}
                        </div>
                        <div className="text-muted-foreground">{appointment.customer?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      {appointment.service?.name}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      {appointment.professional?.name}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {appointment.status === 'confirmed' && 'Confirmado'}
                        {appointment.status === 'completed' && 'Concluído'}
                        {appointment.status === 'cancelled' && 'Cancelado'}
                        {appointment.status === 'no_show' && 'Faltou'}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1" title={
                        appointment.bookingSource === 'whatsapp_bot' ? 'Via WhatsApp Bot' :
                        appointment.bookingSource === 'web' ? 'Via Web' :
                        'Criado manualmente'
                      }>
                        {appointment.bookingSource === 'whatsapp_bot' && (
                          <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        )}
                        {appointment.bookingSource === 'web' && (
                          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        )}
                        {appointment.bookingSource === 'manual' && (
                          <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {appointment.reminderSentAt && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Enviado
                          </span>
                        )}
                        {appointment.reminderConfirmed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Confirmado
                          </span>
                        )}
                        {!appointment.reminderSentAt && !appointment.reminderConfirmed && (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <Button
                        className='hover:bg'
                        onClick={() => handleEdit(appointment)}
                        disabled={appointment.status === 'cancelled' || appointment.status === 'completed'}
                        title={appointment.status === 'cancelled' || appointment.status === 'completed' ? 'Não é possível editar agendamentos cancelados ou concluídos' : 'Editar agendamento'}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AppointmentForm
        establishmentId={user!.establishmentId}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditAppointmentForm
        establishmentId={user!.establishmentId}
        open={editModalOpen}
        onOpenChange={handleCloseEdit}
        appointment={editingAppointment}
      />
    </div>
  );
}
