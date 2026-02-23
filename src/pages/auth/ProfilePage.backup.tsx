import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { User, Phone, Mail, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // Buscar perfil atualizado
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; phone?: string }) => authApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Atualizar store do Zustand
      useAuthStore.getState().setUser(data);
      toast.success('Perfil atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar perfil');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid gap-6">
        {/* Informações da Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98888-8888"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
              </div>

              <div>
                <Label htmlFor="role">Função</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="role"
                    type="text"
                    value={profile?.role === 'OWNER' ? 'Proprietário' : 'Funcionário'}
                    disabled
                    className="pl-10 bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (profile) {
                      setFormData({
                        name: profile.name || '',
                        phone: profile.phone || '',
                      });
                    }
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Link para Trocar Senha */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Segurança</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Altere sua senha regularmente para manter sua conta segura
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/change-password')}
              >
                Trocar Senha
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
