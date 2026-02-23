import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  UserCheck, 
  BarChart3, 
  Plus,
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  LogOut,
  Home,
  Edit2,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import adminApi from '../../api/admin';
import OnboardingModal from '../../components/admin/OnboardingModal';
import EditEstablishmentModal from '../../components/admin/EditEstablishmentModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const navigate = useNavigate();

  // Verificar se está autenticado como admin
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
      return;
    }

    const user = JSON.parse(adminUser);
    if (user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Carregar métricas
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminApi.getMetrics,
  });

  // Carregar estabelecimentos
  const { 
    data: establishments, 
    isLoading: establishmentsLoading,
    refetch: refetchEstablishments 
  } = useQuery({
    queryKey: ['admin-establishments'],
    queryFn: adminApi.getEstablishments,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteEstablishment,
    onSuccess: () => {
      toast.success('Estabelecimento desativado com sucesso!');
      refetchEstablishments();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar estabelecimento');
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: adminApi.reactivateEstablishment,
    onSuccess: () => {
      toast.success('Estabelecimento reativado com sucesso!');
      refetchEstablishments();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reativar estabelecimento');
    },
  });

  // Filtrar estabelecimentos pela busca e status
  const filteredEstablishments = establishments
    ?.filter((est) => {
      // Filtro de status
      if (statusFilter === 'active' && !est.isActive) return false;
      if (statusFilter === 'inactive' && est.isActive) return false;

      // Filtro de busca
      if (searchTerm) {
        return (
          est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          est.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          est.city?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return true;
    });

  const handleEdit = (id: string) => {
    setSelectedEstablishmentId(id);
    setShowEditModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (
      window.confirm(
        `⚠️ Tem certeza que deseja desativar "${name}"?\n\nO estabelecimento e seus usuários serão desativados.\nVocê pode reativá-lo depois.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleReactivate = (id: string, name: string) => {
    if (window.confirm(`Deseja reativar "${name}"?`)) {
      reactivateMutation.mutate(id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleOnboardingSuccess = () => {
    setShowOnboardingModal(false);
    refetchEstablishments();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedEstablishmentId(null);
    refetchEstablishments();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Painel Admin
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gerenciamento de estabelecimentos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="flex items-center gap-2 dark:border-gray-600 dark:text-gray-300"
              >
                <Home className="h-4 w-4" />
                Dashboard Principal
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Estabelecimentos</p>
                <p className="text-3xl font-bold mt-2">
                  {metricsLoading ? '...' : metrics?.totalEstablishments || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Building2 className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Proprietários</p>
                <p className="text-3xl font-bold mt-2">
                  {metricsLoading ? '...' : metrics?.totalOwners || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <UserCheck className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Funcionários</p>
                <p className="text-3xl font-bold mt-2">
                  {metricsLoading ? '...' : metrics?.totalStaff || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Usuários</p>
                <p className="text-3xl font-bold mt-2">
                  {metricsLoading ? '...' : metrics?.totalUsers || 0}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Estabelecimentos */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Estabelecimentos Cadastrados
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredEstablishments?.length || 0} estabelecimento(s) encontrado(s)
                </p>
              </div>

              <Button
                onClick={() => setShowOnboardingModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </div>

            {/* Busca e Filtros */}
            <div className="space-y-4">
              {/* Filtros de Status */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setStatusFilter('all')}
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  className={
                    statusFilter === 'all'
                      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500'
                      : 'dark:border-gray-600 dark:text-gray-300'
                  }
                >
                  Todos ({establishments?.length || 0})
                </Button>
                <Button
                  onClick={() => setStatusFilter('active')}
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  className={
                    statusFilter === 'active'
                      ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500'
                      : 'dark:border-gray-600 dark:text-gray-300'
                  }
                >
                  Ativos ({establishments?.filter((e) => e.isActive).length || 0})
                </Button>
                <Button
                  onClick={() => setStatusFilter('inactive')}
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  className={
                    statusFilter === 'inactive'
                      ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500'
                      : 'dark:border-gray-600 dark:text-gray-300'
                  }
                >
                  Inativos ({establishments?.filter((e) => !e.isActive).length || 0})
                </Button>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, slug ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto">
            {establishmentsLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estabelecimentos...</p>
              </div>
            ) : filteredEstablishments && filteredEstablishments.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estabelecimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEstablishments.map((establishment) => (
                    <tr 
                      key={establishment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {establishment.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              /{establishment.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {establishment.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="h-3 w-3" />
                              {establishment.phone}
                            </div>
                          )}
                          {establishment.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3 w-3" />
                              {establishment.email}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        {establishment.city && establishment.state ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            {establishment.city}, {establishment.state}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            establishment.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {establishment.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(establishment.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleEdit(establishment.id)}
                            variant="outline"
                            className="flex items-center gap-1 text-xs px-2 py-1 h-auto dark:border-gray-600 dark:text-gray-300"
                          >
                            <Edit2 className="h-3 w-3" />
                            Editar
                          </Button>
                          
                          {establishment.isActive ? (
                            <Button
                              onClick={() => handleDelete(establishment.id, establishment.name)}
                              variant="outline"
                              className="flex items-center gap-1 text-xs px-2 py-1 h-auto text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                              Desativar
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleReactivate(establishment.id, establishment.name)}
                              variant="outline"
                              className="flex items-center gap-1 text-xs px-2 py-1 h-auto text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                              disabled={reactivateMutation.isPending}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Reativar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nenhum estabelecimento encontrado
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'Tente ajustar sua busca'
                    : 'Comece criando um novo cliente'}
                </p>
                {!searchTerm && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowOnboardingModal(true)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Modal de Onboarding */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSuccess={handleOnboardingSuccess}
      />

      {/* Modal de Edição */}
      <EditEstablishmentModal
        establishmentId={selectedEstablishmentId}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEstablishmentId(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
