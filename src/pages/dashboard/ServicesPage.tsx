import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../../api/services';
import { useAuthStore } from '../../stores/authStore';
import { Scissors, Plus, Clock, Pencil, Trash2, Power } from 'lucide-react';
import { ServiceForm } from '../../components/services/ServiceForm';
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
import toast from 'react-hot-toast';
import type { Service } from '../../types';
import { Button } from '../../components/ui/button';

export default function ServicesPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', user?.establishmentId],
    queryFn: () => servicesApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço excluído com sucesso!');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    },
    onError: () => {
      toast.error('Erro ao excluir serviço');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => servicesApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingService(null);
  };

  if (isLoading) {
    return <div className="text-center py-12 dark:text-gray-300">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Serviços</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie os serviços oferecidos</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="card text-center py-12">
          <Scissors className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum serviço cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="card py-2 px-3 rounded-md shadow hover:shadow-lg transition-shadow hover:border hover:border-gray-300 dark:hover:border-gray-600">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                    service.isActive
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {service.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{service.durationMinutes} min</span>
                </div>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  R$ {service.price}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-700 bg-primary-50 hover:bg-primary-100 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800 rounded-md transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActiveMutation.mutate(service.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    service.isActive
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                      : 'text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800'
                  }`}
                  title={service.isActive ? 'Desativar' : 'Ativar'}
                >
                  <Power className="w-4 h-4" />
                  {service.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-300 dark:bg-red-900 dark:hover:bg-red-800 rounded-md transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ServiceForm
        open={formOpen}
        onClose={handleCloseForm}
        service={editingService}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço <strong>{serviceToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => serviceToDelete && deleteMutation.mutate(serviceToDelete.id)}
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
