import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../api/customers';
import { useAuthStore } from '../../stores/authStore';
import { Users, Plus, Phone, Mail, Pencil, Trash2, History } from 'lucide-react';
import { format } from 'date-fns';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { CustomerHistoryModal } from '../../components/customers/CustomerHistoryModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import toast from 'react-hot-toast';
import type { Customer } from '../../types';
import { Button } from '../../components/ui/button';

export default function CustomersPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', user?.establishmentId],
    queryFn: () => customersApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente excluído com sucesso!');
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    },
    onError: () => {
      toast.error('Erro ao excluir cliente');
    },
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setHistoryModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCustomer(null);
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </Button>
      </div>

      {customers.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum cliente cadastrado</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-left py-3 px-4 text-sm font-semibold'>Nome</TableHead>
                <TableHead className='text-left py-3 px-4 text-sm font-semibold'>Contato</TableHead>
                <TableHead className='text-left py-3 px-4 text-sm font-semibold'>Cadastro</TableHead>
                <TableHead className='py-3 px-4 text-center text-sm font-semibold'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {customers.map((customer) => (
                <>
          <TableRow key={customer.id}>
            <TableCell className=' py-3 px-4'>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-medium">
              {customer.name.charAt(0).toUpperCase()}
            </span>
                </div>
                <div className="font-medium">{customer.name}</div>
              </div>
            </TableCell>
            <TableCell className=' py-3 px-4'>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {customer.phone}
                </div>
                {customer.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {customer.email}
            </div>
                )}
              </div>
            </TableCell>
            <TableCell className=' py-3 px-4 text-sm text-muted-foreground'>
              {format(new Date(customer.createdAt), 'dd/MM/yyyy')}
            </TableCell>
            <TableCell className='py-3 px-4 flex justify-center'>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleViewHistory(customer)}
                  className='hover:text-blue-600 cursor-pointer'
                  title="Ver histórico"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleEdit(customer)}
                  className='hover:text-primary-300 cursor-pointer'
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(customer)}
                  title="Excluir"
                  className="text-destructive hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
                  </TableRow >
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerForm
        open={formOpen}
        onClose={handleCloseForm}
        customer={editingCustomer}
      />

      {selectedCustomer && (
        <CustomerHistoryModal
          open={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{customerToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e todos os agendamentos relacionados poderão ser afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCustomerToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => customerToDelete && deleteMutation.mutate(customerToDelete.id)}
              variant="destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
