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

interface PopularServicesChartProps {
  appointments: Appointment[];
}

export function PopularServicesChart({ appointments }: PopularServicesChartProps) {
  const chartData = useMemo(() => {
    // Count appointments by service
    const serviceCounts = new Map<string, { name: string; count: number }>();

    appointments.forEach((appointment) => {
      if (appointment.service) {
        const serviceId = appointment.service.id;
        const existing = serviceCounts.get(serviceId);
        
        if (existing) {
          existing.count++;
        } else {
          serviceCounts.set(serviceId, {
            name: appointment.service.name,
            count: 1,
          });
        }
      }
    });

    // Convert to array and sort by count (descending)
    const data = Array.from(serviceCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 services
      .map((item) => ({
        servico: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        agendamentos: item.count,
      }));

    return data;
  }, [appointments]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          type="number"
          className="text-sm dark:fill-gray-300"
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="servico"
          className="text-sm dark:fill-gray-300"
          width={120}
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
          fill="#10b981"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
