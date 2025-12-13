import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessHoursApi } from '../../api/businessHours';
import { useAuthStore } from '../../stores/authStore';
import { Clock, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

interface DaySchedule {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  id?: string;
}

export default function BusinessHoursPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [schedule, setSchedule] = useState<DaySchedule[]>(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day.value,
      openTime: '09:00',
      closeTime: '18:00',
      isOpen: day.value >= 1 && day.value <= 5,
    }))
  );

  const { data: businessHours = [], isLoading } = useQuery({
    queryKey: ['businessHours', user?.establishmentId],
    queryFn: () => businessHoursApi.getAllFromEstablishment(user.establishmentId),
    enabled: !!user?.establishmentId,
  });

  useEffect(() => {
    if (businessHours.length > 0) {
      const scheduleMap = new Map<number, DaySchedule>();
      
      businessHours.forEach((bh) => {
        scheduleMap.set(bh.dayOfWeek, {
          id: bh.id,
          dayOfWeek: bh.dayOfWeek,
          openTime: bh.openTime,
          closeTime: bh.closeTime,
          isOpen: bh.isOpen,
        });
      });

      setSchedule(
        DAYS_OF_WEEK.map((day) => {
          const existing = scheduleMap.get(day.value);
          return (
            existing || {
              dayOfWeek: day.value,
              openTime: '09:00',
              closeTime: '18:00',
              isOpen: false,
            }
          );
        })
      );
    }
  }, [businessHours]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const activeDays = schedule.filter((s) => s.isOpen);
      
      await Promise.all(
        businessHours.map((bh) => businessHoursApi.delete(bh.id))
      );

      const promises = activeDays.map((day) =>
        businessHoursApi.create({
          establishmentId: user.establishmentId,
          dayOfWeek: day.dayOfWeek,
          openTime: day.openTime,
          closeTime: day.closeTime,
          isOpen: true,
        })
      );

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessHours'] });
      toast.success('Horários salvos com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao salvar horários');
    },
  });

  const handleToggleDay = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex ? { ...day, isOpen: !day.isOpen } : day
      )
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex ? { ...day, [field]: value } : day
      )
    );
  };

  const handleCopyToAll = (dayIndex: number) => {
    const sourceDay = schedule[dayIndex];
    setSchedule((prev) =>
      prev.map((day) => ({
        ...day,
        openTime: sourceDay.openTime,
        closeTime: sourceDay.closeTime,
      }))
    );
    toast.success('Horários copiados para todos os dias!');
  };

  const handleSave = () => {
    const activeDays = schedule.filter((s) => s.isOpen);
    
    if (activeDays.length === 0) {
      toast.error('Selecione pelo menos um dia de funcionamento');
      return;
    }

    for (const day of activeDays) {
      if (day.openTime >= day.closeTime) {
        const dayName = DAYS_OF_WEEK[day.dayOfWeek].label;
        toast.error(`${dayName}: horário de abertura deve ser antes do fechamento`);
        return;
      }
    }

    saveMutation.mutate();
  };

  if (isLoading) {
    return <div className="text-center py-12 dark:text-gray-300">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Horários de Funcionamento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure os dias e horários de atendimento do estabelecimento
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="flex items-center gap-2">
          <Save className="w-5 h-5" />
          {saveMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="card">
        <div className="space-y-4">
          {schedule.map((day, index) => {
            const dayInfo = DAYS_OF_WEEK[index];
            return (
              <div
                key={dayInfo.value}
                className={`p-4 border rounded-lg transition-all ${
                  day.isOpen
                    ? 'border-primary-300 bg-primary-50/30 dark:border-primary-700 dark:bg-primary-900/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 w-48">
                    <input
                      type="checkbox"
                      checked={day.isOpen}
                      onChange={() => handleToggleDay(index)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <Label className="text-base font-medium cursor-pointer dark:text-gray-200" htmlFor={`day-${index}`}>
                      {dayInfo.label}
                    </Label>
                  </div>

                  {day.isOpen ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <Label className="text-sm text-gray-600 dark:text-gray-400">Abertura:</Label>
                        <Input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleTimeChange(index, 'openTime', e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-gray-600 dark:text-gray-400">Fechamento:</Label>
                        <Input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleTimeChange(index, 'closeTime', e.target.value)}
                          className="w-32"
                        />
                      </div>

                      <button
                        onClick={() => handleCopyToAll(index)}
                        className="ml-auto px-3 py-1.5 text-xs text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/50 dark:hover:bg-primary-900/70 rounded-md transition-colors"
                        title="Copiar para todos os dias"
                      >
                        Copiar para todos
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">Fechado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">Dicas importantes:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                <li>Marque os dias em que o estabelecimento funciona</li>
                <li>Defina horários de abertura e fechamento para cada dia</li>
                <li>Use "Copiar para todos" para aplicar o mesmo horário em todos os dias</li>
                <li>Os horários disponíveis para agendamento respeitarão essa configuração</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
