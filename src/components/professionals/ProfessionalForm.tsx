import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalsApi } from '../../api/professionals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import toast from 'react-hot-toast';
import type { Professional } from '../../types';

interface ProfessionalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  establishmentId: string;
}

export function ProfessionalForm({
  open,
  onOpenChange,
  professional,
  establishmentId,
}: ProfessionalFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!professional;

  const [formData, setFormData] = useState({
    name: '',
    specialtiesInput: '',
  });

  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        specialtiesInput: '',
      });
      setSpecialties(professional.specialties || []);
    } else {
      setFormData({
        name: '',
        specialtiesInput: '',
      });
      setSpecialties([]);
    }
  }, [professional, open]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<Professional, 'id' | 'createdAt'>) =>
      professionalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional criado com sucesso!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar profissional');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Professional> }) =>
      professionalsApi.update(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional atualizado com sucesso!');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar profissional');
    },
  });

  const handleAddSpecialty = () => {
    const trimmed = formData.specialtiesInput.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setFormData({ ...formData, specialtiesInput: '' });
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecialty();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (specialties.length === 0) {
      toast.error('Adicione pelo menos uma especialidade');
      return;
    }

    const professionalData = {
      establishmentId,
      name: formData.name.trim(),
      specialties,
      isActive: true,
    };

    if (isEditing) {
      updateMutation.mutate({
        id: professional.id,
        updates: {
          name: professionalData.name,
          specialties: professionalData.specialties,
        },
      });
    } else {
      createMutation.mutate(professionalData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do profissional"
              required
            />
          </div>

          <div>
            <Label htmlFor="specialties">Especialidades *</Label>
            <div className="flex gap-2">
              <Input
                id="specialties"
                type="text"
                value={formData.specialtiesInput}
                onChange={(e) =>
                  setFormData({ ...formData, specialtiesInput: e.target.value })
                }
                onKeyPress={handleKeyPress}
                placeholder="Digite e pressione Enter"
              />
              <Button
                type="button"
                onClick={handleAddSpecialty}
                disabled={!formData.specialtiesInput.trim()}
              >
                Adicionar
              </Button>
            </div>

            {/* Lista de especialidades */}
            {specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(specialty)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Salvando...'
                : isEditing
                ? 'Atualizar'
                : 'Criar'}
            </Button>
          </DialogFooter>
    </Dialog>
  );
}
