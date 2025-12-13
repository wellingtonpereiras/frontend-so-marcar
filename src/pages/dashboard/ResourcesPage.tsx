import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourcesApi } from '../../api/resources';
import { useAuthStore } from '../../stores/authStore';
import { Plus, Pencil, Trash2, Users, DollarSign } from 'lucide-react';
import { ResourceForm } from '../../components/resources/ResourceForm';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import type { Resource } from '../../types';

export default function ResourcesPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', user?.establishmentId],
    queryFn: () => resourcesApi.getAll(user!.establishmentId),
    enabled: !!user?.establishmentId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Recurso excluído com sucesso!');
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    },
    onError: () => {
      toast.error('Erro ao excluir recurso');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: string) => resourcesApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormOpen(true);
  };

  const handleDelete = (resource: Resource) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingResource(null);
  };

  const getResourceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      meeting_room: 'Sala de Reunião',
      sports_court: 'Quadra Esportiva',
      studio: 'Estúdio',
      office: 'Escritório',
      equipment: 'Equipamento',
      other: 'Outro',
    };
    return types[type] || type;
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recursos e Espaços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie salas, quadras, equipamentos e outros recursos
          </p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Recurso
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum recurso cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource: Resource) => (
            <Card
              key={resource.id}
              className={!resource.isActive ? 'opacity-60' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getResourceTypeLabel(resource.type)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      resource.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {resource.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {resource.description && (
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Capacidade: {resource.capacity} pessoas</span>
                  </div>

                  {resource.isFree ? (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Gratuito</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>R$ {resource.hourlyRate?.toFixed(2)}/hora</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleEdit(resource)}
                    className="flex-1"
                    variant="outline"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => toggleActiveMutation.mutate(resource.id)}
                    variant="outline"
                    disabled={toggleActiveMutation.isPending}
                  >
                    {resource.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(resource)}
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ResourceForm
        open={formOpen}
        onClose={handleCloseForm}
        resource={editingResource}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o recurso{' '}
              <strong>{resourceToDelete?.name}</strong>? Esta ação não pode ser
              desfeita e todas as reservas relacionadas poderão ser afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResourceToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                resourceToDelete && deleteMutation.mutate(resourceToDelete.id)
              }
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
