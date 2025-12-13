import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { Appointment } from '../../types';

interface AppointmentsByDayChartProps {
  appointments: Appointment[];
}

export function AppointmentsByDayChart({ appointments }: AppointmentsByDayChartProps) {
  const chartData = useMemo(() => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    // Initialize counts for all days
    const dayCounts = dayNames.map((name, index) => ({
      day: name,
      dayIndex: index,
      agendamentos: 0,
    }));

    // Count appointments by day of week
    appointments.forEach((appointment) => {
      const date = new Date(appointment.scheduledDate);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      dayCounts[dayOfWeek].agendamentos++;
    });

    return dayCounts;
  }, [appointments]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="day"
          className="text-sm dark:fill-gray-300"
        />
        <YAxis
          className="text-sm dark:fill-gray-300"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--color-foreground)' }}
        />
        <Legend />
        <Bar
          dataKey="agendamentos"
          name="Agendamentos"
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
