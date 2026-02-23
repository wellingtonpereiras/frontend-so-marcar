import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { SlugChangeConfirm } from '../../components/profile/SlugChangeConfirm';
import { 
  User, Phone, Mail, Briefcase, Building2, Hash, MapPin, 
  Save, X, Info, AlertCircle, CheckCircle2, Loader2, Shield, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === 'OWNER' || user?.role === 'owner';

  // Estados para dados pessoais
  const [personalData, setPersonalData] = useState({
    name: '',
    phone: '',
  });
  const [personalEdited, setPersonalEdited] = useState(false);

  // Estados para dados do estabelecimento
  const [establishmentData, setEstablishmentData] = useState({
    name: '',
    slug: '',
    phone: '',
    email: '',
    address: '',
    businessType: '',
    operationMode: 'services' as 'services' | 'spaces' | 'both',
  });
  const [establishmentEdited, setEstablishmentEdited] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');
  const [slugValid, setSlugValid] = useState(true);
  const [showSlugConfirm, setShowSlugConfirm] = useState(false);

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
  });

  // O establishment já vem no profile.establishment
  const establishment = profile?.establishment;

  // Inicializar dados pessoais
  useEffect(() => {
    if (profile) {
      setPersonalData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Inicializar dados do estabelecimento
  useEffect(() => {
    if (establishment) {
      const data = {
        name: establishment.name || '',
        slug: establishment.slug || '',
        phone: establishment.phone || '',
        email: establishment.email || '',
        address: establishment.address || '',
        businessType: establishment.businessType || 'salon',
        operationMode: establishment.operationMode || 'services',
      };
      setEstablishmentData(data);
      setOriginalSlug(establishment.slug || '');
    }
  }, [establishment]);

  // Validação de slug
  const validateSlug = (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  };

  const handleSlugChange = (value: string) => {
    const formattedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setEstablishmentData({ ...establishmentData, slug: formattedSlug });
    setSlugValid(validateSlug(formattedSlug));
    setEstablishmentEdited(true);
  };

  // Mutations
  const updatePersonalMutation = useMutation({
    mutationFn: (data: { name?: string; phone?: string }) => authApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      useAuthStore.getState().setUser(data);
      toast.success('Dados pessoais atualizados com sucesso!', {
        icon: '✅',
        duration: 3000,
      });
      setPersonalEdited(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar dados pessoais', {
        icon: '❌',
        duration: 4000,
      });
    },
  });

  const updateEstablishmentMutation = useMutation({
    mutationFn: (data: typeof establishmentData) => authApi.updateEstablishment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Dados da empresa atualizados com sucesso!', {
        icon: '✅',
        duration: 3000,
      });
      setEstablishmentEdited(false);
      setOriginalSlug(establishmentData.slug);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar dados da empresa', {
        icon: '❌',
        duration: 4000,
      });
    },
  });

  // Handlers
  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalMutation.mutate(personalData);
  };

  const handleEstablishmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!slugValid) {
      toast.error('O slug está em formato inválido. Use apenas letras minúsculas, números e hífens.');
      return;
    }

    // Confirmar mudança de slug
    if (establishmentData.slug !== originalSlug) {
      setShowSlugConfirm(true);
      return;
    }

    updateEstablishmentMutation.mutate(establishmentData);
  };

  const handleConfirmSlugChange = () => {
    setShowSlugConfirm(false);
    updateEstablishmentMutation.mutate(establishmentData);
  };

  const handlePersonalReset = () => {
    if (profile) {
      setPersonalData({
        name: profile.name || '',
        phone: profile.phone || '',
      });
      setPersonalEdited(false);
    }
  };

  const handleEstablishmentReset = () => {
    if (establishment) {
      setEstablishmentData({
        name: establishment.name || '',
        slug: establishment.slug || '',
        phone: establishment.phone || '',
        email: establishment.email || '',
        address: establishment.address || '',
        businessType: establishment.businessType || 'salon',
        operationMode: establishment.operationMode || 'services',
      });
      setEstablishmentEdited(false);
      setSlugValid(true);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="mt-2 text-primary-100">
              Gerencie suas informações pessoais{isOwner && ' e da empresa'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">
              {profile?.role === 'OWNER' ? 'Proprietário' : profile?.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
            </span>
          </div>
        </div>
      </div>

      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              <div>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Suas informações de conta</CardDescription>
              </div>
            </div>
            {personalEdited && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                <AlertCircle className="w-4 h-4" />
                <span>Alterações não salvas</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePersonalSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={personalData.name}
                  onChange={(e) => {
                    setPersonalData({ ...personalData, name: e.target.value });
                    setPersonalEdited(true);
                  }}
                  placeholder="Seu nome completo"
                  required
                  className="transition-all focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) => {
                    setPersonalData({ ...personalData, phone: e.target.value });
                    setPersonalEdited(true);
                  }}
                  placeholder="(11) 98888-8888"
                  className="transition-all focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                  />
                  <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Email não pode ser alterado por segurança
                </p>
              </div>

              {/* Função (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Função
                </Label>
                <Input
                  id="role"
                  type="text"
                  value={profile?.role === 'OWNER' ? 'Proprietário' : 
                         profile?.role === 'ADMIN' ? 'Administrador' : 'Funcionário'}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions */}
            {personalEdited && (
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={updatePersonalMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updatePersonalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePersonalReset}
                  disabled={updatePersonalMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Dados da Empresa (apenas para OWNER) */}
      {isOwner && establishment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" />
                <div>
                  <CardTitle>Dados da Empresa</CardTitle>
                  <CardDescription>Informações do seu estabelecimento</CardDescription>
                </div>
              </div>
              {establishmentEdited && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Alterações não salvas</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEstablishmentSubmit} className="space-y-5">
              {/* Nome da Empresa */}
              <div className="space-y-2">
                <Label htmlFor="establishmentName" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Nome da Empresa <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="establishmentName"
                  type="text"
                  value={establishmentData.name}
                  onChange={(e) => {
                    setEstablishmentData({ ...establishmentData, name: e.target.value });
                    setEstablishmentEdited(true);
                  }}
                  placeholder="Nome do seu estabelecimento"
                  required
                  className="transition-all focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  Slug (URL) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  type="text"
                  value={establishmentData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="meu-negocio"
                  required
                  className={`transition-all focus:ring-2 ${
                    !slugValid ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'
                  }`}
                />
                <div className="space-y-1">
                  {establishmentData.slug && slugValid && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-md">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>https://somarcar.com.br/{establishmentData.slug}</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </div>
                  )}
                  {establishmentData.slug && !slugValid && (
                    <p className="text-sm text-red-600 dark:text-red-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Use apenas letras minúsculas, números e hífens (ex: meu-negocio-123)
                    </p>
                  )}
                  {establishmentData.slug !== originalSlug && originalSlug && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                          <p className="font-medium">Atenção ao mudar o slug!</p>
                          <p className="mt-1">Isso alterará a URL de acesso e pode invalidar links compartilhados.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {/* Telefone da Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="establishmentPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Telefone da Empresa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="establishmentPhone"
                    type="tel"
                    value={establishmentData.phone}
                    onChange={(e) => {
                      setEstablishmentData({ ...establishmentData, phone: e.target.value });
                      setEstablishmentEdited(true);
                    }}
                    placeholder="(11) 3333-3333"
                    required
                    className="transition-all focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Email da Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="establishmentEmail" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email da Empresa
                  </Label>
                  <Input
                    id="establishmentEmail"
                    type="email"
                    value={establishmentData.email}
                    onChange={(e) => {
                      setEstablishmentData({ ...establishmentData, email: e.target.value });
                      setEstablishmentEdited(true);
                    }}
                    placeholder="contato@empresa.com"
                    className="transition-all focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Tipo de Negócio */}
                <div className="space-y-2">
                  <Label htmlFor="businessType" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    Tipo de Negócio
                  </Label>
                  <Select
                    id="businessType"
                    value={establishmentData.businessType}
                    onChange={(value) => {
                      setEstablishmentData({ ...establishmentData, businessType: value });
                      setEstablishmentEdited(true);
                    }}
                    options={[
                      { value: 'salon', label: 'Salão de Beleza' },
                      { value: 'barbershop', label: 'Barbearia' },
                      { value: 'clinic', label: 'Clínica' },
                      { value: 'petshop', label: 'Pet Shop' },
                      { value: 'gym', label: 'Academia' },
                      { value: 'spa', label: 'SPA' },
                      { value: 'coworking', label: 'Coworking' },
                      { value: 'other', label: 'Outro' },
                    ]}
                  />
                </div>

                {/* Modo de Operação */}
                <div className="space-y-2">
                  <Label htmlFor="operationMode" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    Modo de Operação
                  </Label>
                  <Select
                    id="operationMode"
                    value={establishmentData.operationMode}
                    onChange={(value: any) => {
                      setEstablishmentData({ ...establishmentData, operationMode: value });
                      setEstablishmentEdited(true);
                    }}
                    options={[
                      { value: 'services', label: 'Prestação de Serviços', subtitle: 'Agendamentos com profissionais' },
                      { value: 'spaces', label: 'Aluguel de Espaços', subtitle: 'Reserva de salas/quadras' },
                      { value: 'both', label: 'Ambos', subtitle: 'Serviços + Espaços' },
                    ]}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Endereço Completo
                </Label>
                <Input
                  id="address"
                  type="text"
                  value={establishmentData.address}
                  onChange={(e) => {
                    setEstablishmentData({ ...establishmentData, address: e.target.value });
                    setEstablishmentEdited(true);
                  }}
                  placeholder="Rua, número, bairro, cidade - Estado"
                  className="transition-all focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Actions */}
              {establishmentEdited && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="submit" 
                    disabled={updateEstablishmentMutation.isPending || !slugValid}
                    className="flex items-center gap-2"
                  >
                    {updateEstablishmentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEstablishmentReset}
                    disabled={updateEstablishmentMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* Segurança */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Segurança da Conta</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Altere sua senha regularmente para manter sua conta segura
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/change-password')}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Trocar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de mudança de slug */}
      <SlugChangeConfirm
        open={showSlugConfirm}
        onOpenChange={setShowSlugConfirm}
        onConfirm={handleConfirmSlugChange}
        oldSlug={originalSlug}
        newSlug={establishmentData.slug}
      />
    </div>
  );
}
