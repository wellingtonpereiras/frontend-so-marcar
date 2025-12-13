import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '../../types';

interface RevenueChartProps {
  appointments: Appointment[];
}

export function RevenueChart({ appointments }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Get last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(startOfDay(subDays(new Date(), i)));
    }

    // Initialize revenue for each day
    const revenueByDay = days.map((day) => ({
      date: day,
      label: format(day, 'dd/MM', { locale: ptBR }),
      receita: 0,
    }));

    // Sum revenue from completed appointments
    appointments.forEach((appointment) => {
      if (appointment.status === 'completed' && appointment.service?.price) {
        const appointmentDate = startOfDay(new Date(appointment.scheduledDate));
        const dayIndex = revenueByDay.findIndex(
          (d) => d.date.getTime() === appointmentDate.getTime()
        );
        
        if (dayIndex !== -1) {
          revenueByDay[dayIndex].receita += Number(appointment.service.price);
        }
      }
    });

    return revenueByDay;
  }, [appointments]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="label"
          className="text-sm dark:fill-gray-300"
        />
        <YAxis
          className="text-sm dark:fill-gray-300"
          tickFormatter={formatCurrency}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'var(--color-foreground)' }}
          formatter={(value: number) => [formatCurrency(value), 'Receita']}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="receita"
          name="Receita"
          stroke="#f59e0b"
          fillOpacity={1}
          fill="url(#colorReceita)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
