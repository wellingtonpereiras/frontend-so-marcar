import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Users, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { AppointmentForm } from '../../components/appointments/AppointmentForm';
import { AppointmentsByDayChart } from '../../components/charts/AppointmentsByDayChart';
import { PopularServicesChart } from '../../components/charts/PopularServicesChart';
import { RevenueChart } from '../../components/charts/RevenueChart';
import { useState } from 'react';

export default function DashboardPage() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const today = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd'); // Last 30 days

  // Appointments for today (for stats and list)
  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['appointments', user?.establishmentId, today],
    queryFn: () => appointmentsApi.getAll(user!.establishmentId, today),
    enabled: !!user?.establishmentId,
  });

  // Appointments for last 30 days (for analytics charts)
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['appointments-analytics', user?.establishmentId, startDate],
    queryFn: () => appointmentsApi.getAll(user!.establishmentId, startDate),
    enabled: !!user?.establishmentId,
  });

  const totalRevenue = Number(todayAppointments.reduce((sum, a) => sum + (Number(a.service?.price) || 0), 0));

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Confirmados',
      value: todayAppointments.filter((a) => a.status === 'confirmed').length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Receita Estimada',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Clientes Únicos',
      value: new Set(todayAppointments.map((a) => a.customerId)).size,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
        <Button
          onClick={() => setOpen(true)}
          className='flex items-center gap-2 cursor-pointer'
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Análises e Relatórios</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsByDayChart appointments={allAppointments} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <PopularServicesChart appointments={allAppointments} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receita dos Últimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart appointments={allAppointments} />
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
        
        {todayAppointments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum agendamento para hoje
          </p>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {appointment.scheduledTime.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{appointment.customer?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.service?.name} • {appointment.professional?.name}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {appointment.status === 'confirmed' && 'Confirmado'}
                    {appointment.status === 'completed' && 'Concluído'}
                    {appointment.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        </CardContent>
      </Card>

      {user?.establishmentId && (
        <AppointmentForm establishmentId={user.establishmentId} open={open} onOpenChange={setOpen} />
      )}
    </div>
  );
}
