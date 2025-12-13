import { useState, useEffect, use } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../../api/services';
import { useAuthStore } from '../../stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import type { Service } from '../../types';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
}

export function ServiceForm({ open, onClose, service }: ServiceFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [price, setPrice] = useState<number>(0);
  const [bufferBefore, setBufferBefore] = useState<number>(0);
  const [bufferAfter, setBufferAfter] = useState<number>(0);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description || '');
      setDurationMinutes(service.durationMinutes);
      setPrice(service.price);
      setBufferBefore(service.bufferBefore || 0);
      setBufferAfter(service.bufferAfter || 0);
    } else {
      setName('');
      setDescription('');
      setDurationMinutes(30);
      setPrice(0);
      setBufferBefore(0);
      setBufferAfter(0);
    }
  }, [service, open]);

  const createMutation = useMutation({
    mutationFn: (newService: Omit<Service, 'id' | 'createdAt'>) =>
      servicesApi.create(newService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço criado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao criar serviço');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Service> }) => {
      console.log({id, updates});
      
      return servicesApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao atualizar serviço');
    },
  });

  const validateForm = () => {
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }

    if (durationMinutes <= 0) {
      toast.error('Duração deve ser maior que zero');
      return false;
    }

    if (price < 0) {
      toast.error('Preço não pode ser negativo');
      return false;
    }

    return true;
  };

  const buildServiceData = (): unknown => ({
    name: name.trim(),
    description: description.trim() || undefined,
    durationMinutes,
    price,
    bufferBefore: bufferBefore > 0 ? bufferBefore : undefined,
    bufferAfter: bufferAfter > 0 ? bufferAfter : undefined,
    isActive: true,
  });

  const handleCreate = () => {
    const serviceData = buildServiceData() as Omit<Service, 'id' | 'createdAt'>;
    serviceData['establishmentId'] = user.establishmentId;
    createMutation.mutate(serviceData);
  };

  const handleUpdate = () => {
    const serviceData = buildServiceData();
    updateMutation.mutate({
      id: service?.id ?? '',
      updates: serviceData as Partial<Service>,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (service) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='grid gap-2'>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte de Cabelo"
              required
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o serviço (opcional)"
              className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div> 

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duração (min) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bufferBefore">Buffer Antes (min)</Label>
              <Input
                id="bufferBefore"
                type="number"
                min="0"
                step="5"
                value={bufferBefore}
                onChange={(e) => setBufferBefore(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tempo de preparação antes do serviço
              </p>
            </div>

            <div>
              <Label htmlFor="bufferAfter">Buffer Depois (min)</Label>
              <Input
                id="bufferAfter"
                type="number"
                min="0"
                step="5"
                value={bufferAfter}
                onChange={(e) => setBufferAfter(Number(e.target.value))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tempo de limpeza após o serviço
              </p>
            </div>
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
                : service
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </DialogFooter>
    </Dialog>
  );
}
