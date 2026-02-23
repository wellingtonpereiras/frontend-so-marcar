import { api } from './client';
import type { LoginRequest, LoginResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  updateProfile: async (updates: { name?: string; phone?: string }) => {
    const { data } = await api.patch('/auth/profile', updates);
    return data;
  },

  // Atualizar dados do estabelecimento (apenas para OWNER)
  updateEstablishment: async (updates: {
    name?: string;
    slug?: string;
    phone?: string;
    email?: string;
    address?: string;
    businessType?: string;
    operationMode?: 'services' | 'spaces' | 'both';
  }) => {
    const { data } = await api.patch('/establishments/my', updates);
    return data;
  },

  changePassword: async (passwords: { oldPassword: string; newPassword: string }) => {
    const { data } = await api.post('/auth/change-password', passwords);
    return data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },
};

