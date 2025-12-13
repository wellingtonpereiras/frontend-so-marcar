import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi } from '../../api/resources';
import { useAuthStore } from '../../stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import toast from 'react-hot-toast';
import type { Resource } from '../../types';

interface ResourceFormProps {
  open: boolean;
  onClose: () => void;
  resource?: Resource | null;
}

const RESOURCE_TYPES = [
  { value: 'meeting_room', label: 'Sala de Reunião' },
  { value: 'sports_court', label: 'Quadra Esportiva' },
  { value: 'studio', label: 'Estúdio' },
  { value: 'office', label: 'Escritório' },
  { value: 'equipment', label: 'Equipamento' },
  { value: 'other', label: 'Outro' },
];

export function ResourceForm({ open, onClose, resource }: ResourceFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('meeting_room');
  const [capacity, setCapacity] = useState<number>(1);
  const [isFree, setIsFree] = useState(false);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setDescription(resource.description || '');
      setType(resource.type);
      setCapacity(resource.capacity);
      setIsFree(resource.isFree);
      setHourlyRate(resource.hourlyRate || 0);
    } else {
      setName('');
      setDescription('');
      setType('meeting_room');
      setCapacity(1);
      setIsFree(false);
      setHourlyRate(0);
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

    return true;
  };

  const buildResourceData = () => ({
    establishmentId: user!.establishmentId,
    name: name.trim(),
    description: description.trim() || undefined,
    type,
    capacity,
    isFree,
    hourlyRate: isFree ? undefined : hourlyRate,
    isActive: true,
  });

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
              <Label htmlFor="type">Tipo *</Label>
              <Select
                id="type"
                value={type}
                onChange={setType}
                options={RESOURCE_TYPES}
                placeholder="Selecione o tipo"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacidade *</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
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
              Recurso gratuito
            </Label>
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
