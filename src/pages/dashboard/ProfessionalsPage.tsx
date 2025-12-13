import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalsApi } from '../../api/professionals';
import { useAuthStore } from '../../stores/authStore';
import { UserCircle, Plus, Pencil, Trash2, Power } from 'lucide-react';
import { ProfessionalForm } from '../../components/professionals/ProfessionalForm';
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
import type { Professional } from '../../types';
import { Button } from '../../components/ui/button';

export default function ProfessionalsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null);

  const { data: professionals = [], isLoading } = useQuery({
    queryKey: ['professionals', user?.establishmentId],
    queryFn: () => professionalsApi.getAll(user ? user.establishmentId : '', true),
    enabled: !!user?.establishmentId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => professionalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success('Profissional excluído com sucesso!');
      setDeleteDialogOpen(false);
      setProfessionalToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir profissional');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => professionalsApi.toggleActive(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast.success(
        `Profissional ${data.isActive ? 'ativado' : 'desativado'} com sucesso!`
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status');
    },
  });

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setFormOpen(true);
  };

  const handleDelete = (professional: Professional) => {
    setProfessionalToDelete(professional);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = (professional: Professional) => {
    toggleActiveMutation.mutate(professional.id);
  };

  const handleNewProfessional = () => {
    setEditingProfessional(null);
    setFormOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-12 text-gray-900 dark:text-gray-100">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profissionais</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie sua equipe</p>
        </div>
        <Button
          onClick={handleNewProfessional}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Novo Profissional
        </Button>
      </div>

      {professionals.length === 0 ? (
        <div className="card text-center py-12">
          <UserCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Nenhum profissional cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional) => (
            <div key={professional.id} className="card rounded-md py-2 px-3 shadow hover:shadow-md transition-shadow hover:border hover:border-gray-300 dark:hover:border-gray-600">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 font-semibold text-lg">
                      {professional.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{professional.name}</h3>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        professional.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {professional.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              {professional.specialties && professional.specialties.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Especialidades:</p>
                  <div className="flex flex-wrap gap-2">
                    {professional.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(professional)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900 rounded-lg transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(professional)}
                  disabled={toggleActiveMutation.isPending}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    professional.isActive
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
                  }`}
                  title={professional.isActive ? 'Desativar' : 'Ativar'}
                >
                  <Power className="w-4 h-4" />
                  {professional.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button
                  onClick={() => handleDelete(professional)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Criar/Editar */}
      {user?.establishmentId && (
        <ProfessionalForm
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingProfessional(null);
          }}
          professional={editingProfessional}
          establishmentId={user.establishmentId}
        />
      )}

      {/* Modal de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o profissional{' '}
              <strong>{professionalToDelete?.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita e todos os agendamentos associados
              serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setProfessionalToDelete(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => professionalToDelete && deleteMutation.mutate(professionalToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

