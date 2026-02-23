import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X, Building2, Phone, Mail, MapPin, Image } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import adminApi, { type UpdateEstablishmentDto } from '../../api/admin';
import toast from 'react-hot-toast';

interface EditEstablishmentModalProps {
  establishmentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEstablishmentModal({
  establishmentId,
  isOpen,
  onClose,
  onSuccess,
}: EditEstablishmentModalProps) {
  const [formData, setFormData] = useState<UpdateEstablishmentDto>({
    name: '',
    phone: '',
    email: '',
    address: '',
    logoUrl: '',
    businessType: '',
    operationMode: 'services',
    planType: 'basic',
    isActive: true,
  });

  // Carregar dados do estabelecimento
  const { data: establishment, isLoading } = useQuery({
    queryKey: ['establishment', establishmentId],
    queryFn: () => adminApi.getEstablishmentById(establishmentId!),
    enabled: isOpen && !!establishmentId,
  });

  useEffect(() => {
    if (establishment) {
      setFormData({
        name: establishment.name,
        phone: establishment.phone,
        email: establishment.email || '',
        address: establishment.address || '',
        logoUrl: establishment.logoUrl || '',
        businessType: establishment.businessType || '',
        operationMode: establishment.operationMode,
        planType: establishment.planType,
        isActive: establishment.isActive,
      });
    }
  }, [establishment]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEstablishmentDto) =>
      adminApi.updateEstablishment(establishmentId!, data),
    onSuccess: () => {
      toast.success('Estabelecimento atualizado com sucesso!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao atualizar estabelecimento';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Editar Estabelecimento
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Atualize as informações do estabelecimento
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Informações Básicas
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Nome do Estabelecimento *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Barbearia do Zé"
                      required
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="11999887766"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contato@estabelecimento.com"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Rua das Flores, 123"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-gray-400" />
                      <Input
                        id="logoUrl"
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://exemplo.com/logo.png"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Configurações */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Configurações
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessType">Tipo de Negócio</Label>
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="salon">Salão de Beleza</option>
                      <option value="barbershop">Barbearia</option>
                      <option value="clinic">Clínica</option>
                      <option value="petshop">Pet Shop</option>
                      <option value="coworking">Coworking</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="operationMode">Modo de Operação</Label>
                    <select
                      id="operationMode"
                      value={formData.operationMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          operationMode: e.target.value as 'services' | 'spaces' | 'both',
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="services">Apenas Serviços</option>
                      <option value="spaces">Apenas Espaços</option>
                      <option value="both">Ambos</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="planType">Plano</Label>
                    <select
                      id="planType"
                      value={formData.planType}
                      onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="basic">Básico</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Estabelecimento Ativo
                      </span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={updateMutation.isPending}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
