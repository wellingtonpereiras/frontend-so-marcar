import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { useAuthStore } from '../../stores/authStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';
import type { Customer } from '../../types';

interface CustomerFormProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function CustomerForm({ open, onClose, customer }: CustomerFormProps) {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setEmail(customer.email || '');
      setNotes(customer.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
    }
  }, [customer, open]);

  const createMutation = useMutation({
    mutationFn: (newCustomer: Omit<Customer, 'id' | 'createdAt' | 'totalAppointments' | 'cancelledAppointments'>) =>
      customersApi.create(newCustomer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente cadastrado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao cadastrar cliente');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) =>
      customersApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente atualizado com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!phone.trim()) {
      toast.error('Telefone é obrigatório');
      return;
    }

    // Validação básica de telefone (apenas números e alguns caracteres especiais)
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Telefone inválido');
      return;
    }

    // Validação de email se fornecido
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Email inválido');
        return;
      }
    }

    const customerData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      establishmentId: user!.establishmentId,
    };

    if (customer) {
      updateMutation.mutate({
        id: customer.id,
        updates: customerData,
      });
    } else {
      createMutation.mutate(customerData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogHeader>
          <DialogTitle>
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone/WhatsApp *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Será usado para enviar lembretes via WhatsApp
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email (opcional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
            />
          </div>

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o cliente..."
              className="w-full min-h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </form>
      </DialogContent>
      <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Salvando...'
                : customer
                ? 'Atualizar'
                : 'Cadastrar'}
            </Button>
          </DialogFooter>
    </Dialog>
  );
}
