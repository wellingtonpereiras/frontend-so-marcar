import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import adminApi, { type OnboardingRequest } from '../../api/admin';
import toast from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OnboardingModal({ isOpen, onClose, onSuccess }: OnboardingModalProps) {
  const [formData, setFormData] = useState<OnboardingRequest>({
    establishment: {
      name: '',
      slug: '',
      phone: '',
      email: '',
      address: '',
    },
    owner: {
      name: '',
      email: '',
      phone: '',
    },
    sendEmail: true,
  });

  const [result, setResult] = useState<any>(null);
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null);

  const onboardingMutation = useMutation({
    mutationFn: adminApi.onboarding,
    onSuccess: (data) => {
      setResult(data);
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar cliente';
      toast.error(message);
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData({
      ...formData,
      establishment: {
        ...formData.establishment,
        name,
        slug,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onboardingMutation.mutate(formData);
  };

  const handleClose = () => {
    if (result) {
      onSuccess();
    }
    setFormData({
      establishment: {
        name: '',
        slug: '',
        phone: '',
        email: '',
        address: '',
      },
      owner: {
        name: '',
        email: '',
        phone: '',
      },
      sendEmail: true,
    });
    setResult(null);
    onClose();
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPassword(id);
      toast.success('Senha copiada!');
      setTimeout(() => setCopiedPassword(null), 2000);
    } catch (err) {
      toast.error('Erro ao copiar senha');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {result ? 'Cliente Criado com Sucesso!' : 'Novo Cliente'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result ? 'Credenciais de acesso geradas' : 'Criar estabelecimento e usuário proprietário'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {result ? (
            // Resultado do Onboarding
            <div className="space-y-6">
              {/* Estabelecimento Criado */}
              <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                      Estabelecimento Criado
                    </h3>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      <p><strong>Nome:</strong> {result.establishment.name}</p>
                      <p><strong>Slug:</strong> /{result.establishment.slug}</p>
                      <p><strong>ID:</strong> {result.establishment.id}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Credenciais do Owner */}
              <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Credenciais do Proprietário
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Nome:</strong> {result.owner.name}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Email:</strong> {result.owner.email}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Senha Temporária:
                          </span>
                          <Button
                            onClick={() => copyToClipboard(result.owner.temporaryPassword, 'owner')}
                            variant="outline"
                            className="flex items-center gap-2 text-sm px-3 py-1"
                          >
                            {copiedPassword === 'owner' ? (
                              <>
                                <Check className="h-3 w-3" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                        <code className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {result.owner.temporaryPassword}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Status do Email */}
              <Card className={`p-6 ${
                result.emailSent 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    result.emailSent
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    {result.emailSent ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${
                      result.emailSent
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-yellow-900 dark:text-yellow-100'
                    }`}>
                      {result.emailSent ? 'Email Enviado!' : 'Email Não Enviado'}
                    </h3>
                    <p className={`text-sm ${
                      result.emailSent
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {result.emailSent
                        ? 'As credenciais foram enviadas para o email do proprietário.'
                        : 'Envie as credenciais manualmente para o proprietário.'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Botão Fechar */}
              <div className="flex justify-end">
                <Button
                  onClick={handleClose}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            // Formulário de Onboarding
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados do Estabelecimento */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dados do Estabelecimento
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="est-name">Nome do Estabelecimento *</Label>
                    <Input
                      id="est-name"
                      value={formData.establishment.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Barbearia do Zé"
                      required
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="est-slug">Slug (URL) *</Label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                      <Input
                        id="est-slug"
                        value={formData.establishment.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishment: { ...formData.establishment, slug: e.target.value },
                          })
                        }
                        placeholder="barbearia-do-ze"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      URL: /{formData.establishment.slug || 'slug-aqui'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="est-phone">Telefone *</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input
                        id="est-phone"
                        type="tel"
                        value={formData.establishment.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishment: { ...formData.establishment, phone: e.target.value },
                          })
                        }
                        placeholder="11999887766"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="est-email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input
                        id="est-email"
                        type="email"
                        value={formData.establishment.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            establishment: { ...formData.establishment, email: e.target.value },
                          })
                        }
                        placeholder="contato@estabelecimento.com"
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="est-address">Endereço</Label>
                    <Input
                      id="est-address"
                      value={formData.establishment.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          establishment: { ...formData.establishment, address: e.target.value },
                        })
                      }
                      placeholder="Rua das Flores, 123"
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </section>

              {/* Dados do Proprietário */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Dados do Proprietário
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="owner-name">Nome Completo *</Label>
                    <Input
                      id="owner-name"
                      value={formData.owner.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          owner: { ...formData.owner, name: e.target.value },
                        })
                      }
                      placeholder="José da Silva"
                      required
                      className="dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="owner-email">Email *</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-email"
                        type="email"
                        value={formData.owner.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            owner: { ...formData.owner, email: e.target.value },
                          })
                        }
                        placeholder="jose@gmail.com"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Será usado para login no sistema
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="owner-phone">Telefone *</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-phone"
                        type="tel"
                        value={formData.owner.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            owner: { ...formData.owner, phone: e.target.value },
                          })
                        }
                        placeholder="11988776655"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Configurações */}
              <section>
                <Card className="p-4 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sendEmail: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Enviar email de boas-vindas
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        As credenciais serão enviadas automaticamente para o proprietário
                      </p>
                    </div>
                  </label>
                </Card>
              </section>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={onboardingMutation.isPending}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={onboardingMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  {onboardingMutation.isPending ? 'Criando...' : 'Criar Cliente'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
