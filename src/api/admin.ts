import { api } from './client';

// Tipos para onboarding (conforme DTO do backend)
export interface OnboardingEstablishment {
  name: string;
  slug: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface OnboardingOwner {
  name: string;
  email: string;
  phone: string;
}

export interface OnboardingStaff {
  name: string;
  email: string;
  phone?: string;
}

export interface OnboardingRequest {
  establishment: OnboardingEstablishment;
  owner: OnboardingOwner;
  staff?: OnboardingStaff[];
  sendEmail?: boolean;
}

export interface OnboardingResponse {
  establishment: {
    id: string;
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    temporaryPassword: string;
  };
  staff?: Array<{
    id: string;
    name: string;
    email: string;
    temporaryPassword: string;
  }>;
  emailSent: boolean;
}

export interface AdminMetrics {
  totalEstablishments: number;
  totalOwners: number;
  totalStaff: number;
  totalUsers: number;
}

export interface EstablishmentListItem {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
  businessType?: string;
  operationMode: 'services' | 'spaces' | 'both';
  planType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEstablishmentDto {
  name?: string;
  slug?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoUrl?: string;
  businessType?: string;
  operationMode?: 'services' | 'spaces' | 'both';
  planType?: string;
  isActive?: boolean;
}

export interface ResetPasswordResponse {
  temporaryPassword: string;
  message: string;
}

const adminApi = {
  /**
   * Cria um novo estabelecimento com owner e staff (onboarding completo)
   */
  onboarding: async (data: OnboardingRequest): Promise<OnboardingResponse> => {
    const response = await api.post('/admin/onboarding', data);
    return response.data;
  },

  /**
   * Reseta a senha de um usuário
   */
  resetUserPassword: async (userId: string): Promise<ResetPasswordResponse> => {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  /**
   * Lista todos os estabelecimentos
   */
  getEstablishments: async (): Promise<EstablishmentListItem[]> => {
    const response = await api.get('/admin/establishments');
    return response.data;
  },

  /**
   * Busca estabelecimento por ID
   */
  getEstablishmentById: async (id: string): Promise<EstablishmentListItem> => {
    const response = await api.get(`/admin/establishments/${id}`);
    return response.data;
  },

  /**
   * Atualiza estabelecimento
   */
  updateEstablishment: async (id: string, data: UpdateEstablishmentDto): Promise<EstablishmentListItem> => {
    const response = await api.put(`/admin/establishments/${id}`, data);
    return response.data;
  },

  /**
   * Desativa estabelecimento (soft delete)
   */
  deleteEstablishment: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await api.delete(`/admin/establishments/${id}`);
    return response.data;
  },

  /**
   * Deleta estabelecimento permanentemente (hard delete)
   */
  hardDeleteEstablishment: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await api.delete(`/admin/establishments/${id}/hard`);
    return response.data;
  },

  /**
   * Reativa estabelecimento
   */
  reactivateEstablishment: async (id: string): Promise<EstablishmentListItem> => {
    const response = await api.patch(`/admin/establishments/${id}/reactivate`);
    return response.data;
  },

  /**
   * Obtém métricas gerais do sistema
   */
  getMetrics: async (): Promise<AdminMetrics> => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },
};

export default adminApi;
