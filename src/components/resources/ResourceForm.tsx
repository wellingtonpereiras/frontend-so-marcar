import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi } from '../../api/resources';
import { useAuthStore } from '../../stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import type { Resource } from '../../types';

interface ResourceFormProps {
  open: boolean;
  onClose: () => void;
  resource?: Resource | null;
}

const ALLOWED_DURATIONS = [
  { value: '60', label: '1 hora' },
  { value: '120', label: '2 horas' },
  { value: '240', label: '4 horas' },
  { value: '480', label: '8 horas' },
];

export function ResourceForm({ open, onClose, resource }: ResourceFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number>(1);
  const [isShared, setIsShared] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [cancellationHours, setCancellationHours] = useState<number>(24);
  const [selectedDurations, setSelectedDurations] = useState<number[]>([60, 120]);

  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setDescription(resource.description || '');
      setCapacity(resource.capacity);
      setIsShared(resource.isShared);
      setIsFree(resource.isFree);
      setHourlyRate(resource.hourlyRate || 0);
      setCancellationHours(resource.cancellationHours || 24);
      
      // Garantir que allowedDurations sejam apenas números únicos e válidos
      const validValues = ALLOWED_DURATIONS.map(d => Number(d.value));
      const durations = resource.allowedDurations || [60, 120];
      const uniqueDurations = Array.from(new Set(durations.map(d => Number(d))))
        .filter(d => validValues.includes(d)); // Filtrar apenas valores válidos
      setSelectedDurations(uniqueDurations.length > 0 ? uniqueDurations : [60, 120]);
    } else {
      setName('');
      setDescription('');
      setCapacity(1);
      setIsShared(false);
      setIsFree(false);
      setHourlyRate(0);
      setCancellationHours(24);
      setSelectedDurations([60, 120]);
    }
  }, [resource, open]);

  const createMutation = useMutation({
    mutationFn: (newResource: any) => resourcesApi.create(newResource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Recurso criado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao criar recurso');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      resourcesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Recurso atualizado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao atualizar recurso');
    },
  });

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }

    if (capacity <= 0) {
      toast.error('Capacidade deve ser maior que zero');
      return false;
    }

    if (!isFree && hourlyRate <= 0) {
      toast.error('Valor/hora deve ser maior que zero para recursos pagos');
      return false;
    }

    if (selectedDurations.length === 0) {
      toast.error('Selecione pelo menos uma duração permitida');
      return false;
    }

    return true;
  };

  const buildResourceData = () => {
    // Garantir que allowedDurations seja array de números únicos e ordenados
    const uniqueDurations = Array.from(new Set(selectedDurations.map(d => Number(d)))).sort((a, b) => a - b);
    
    return {
      establishmentId: user!.establishmentId,
      name: name.trim(),
      description: description.trim() || undefined,
      capacity,
      isShared,
      isFree,
      hourlyRate: isFree ? 0 : hourlyRate,
      cancellationHours,
      allowedDurations: uniqueDurations,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = buildResourceData();

    if (resource) {
      updateMutation.mutate({ id: resource.id, updates: data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>
          {resource ? 'Editar Recurso' : 'Novo Recurso'}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sala de Reunião A"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o recurso (opcional)"
              className="w-full min-h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacidade *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
                placeholder="Máximo de pessoas"
              />
            </div>

            <div>
              <Label htmlFor="cancellationHours">Cancelamento (horas) *</Label>
              <Input
                id="cancellationHours"
                type="number"
                min="1"
                max="168"
                value={cancellationHours}
                onChange={(e) => setCancellationHours(Number(e.target.value))}
                required
                placeholder="Ex: 24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Horas mínimas para cancelamento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isShared"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <Label htmlFor="isShared" className="cursor-pointer">
                Compartilhado
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <Label htmlFor="isFree" className="cursor-pointer">
                Gratuito
              </Label>
            </div>
          </div>

          {!isFree && (
            <div className="grid gap-2">
              <Label htmlFor="hourlyRate">Valor por hora (R$) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                required={!isFree}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label>Durações permitidas *</Label>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_DURATIONS.map((dur) => {
                const durValue = Number(dur.value);
                const isSelected = selectedDurations.includes(durValue);
                return (
                  <label
                    key={dur.value}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-900 border-primary-500'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDurations([...selectedDurations, durValue]);
                        } else {
                          setSelectedDurations(selectedDurations.filter(d => d !== durValue));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{dur.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione as durações de reserva permitidas
            </p>
          </div>
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
            : resource
            ? 'Atualizar'
            : 'Criar'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
