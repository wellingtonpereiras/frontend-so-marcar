import { api } from './client';
import type { ChatMessage } from '../types';

interface StartChatDto {
  establishmentId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  sessionId?: string;
  userAgent?: string;
  language?: string;
  userType?: 'customer' | 'professional';
  professionalId?: string;
}

interface StartChatResponse {
  id: string;
  establishmentId: string;
  sessionId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  status: 'active' | 'ended';
  metadata: {
    userAgent?: string;
    language?: string;
    userType?: 'customer' | 'professional';
    professionalId?: string;
  };
  welcomeMessage: {
    id: string;
    conversationId: string;
    role: 'system';
    content: string;
    metadata: any;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SendMessageResponse {
  conversationId: string;
  message: string;
  suggestions?: string[];
  metadata?: {
    intent?: string;
    entities?: any;
    appointmentsCount?: number;
    appointments?: any[];
    occupancyRate?: string;
    totalRevenue?: string;
    totalAppointments?: number;
    services?: Array<{
      name: string;
      count: number;
      revenue: number;
    }>;
    peakHours?: Array<[string, number]>;
    cancellationRate?: string;
    [key: string]: any;
  };
}

interface ChatHistoryResponse {
  conversationId: string;
  establishmentId: string;
  customerName: string;
  status: 'active' | 'ended';
  userType: 'customer' | 'professional';
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  totalMessages: number;
}

export const chatbotApi = {
  // Iniciar nova conversa com o chatbot
  startChat: async (data: StartChatDto): Promise<StartChatResponse> => {
    const response = await api.post('/chatbot/start', data);
    return response.data;
  },

  // Enviar mensagem e receber resposta do GPT-4
  sendMessage: async (conversationId: string, message: string): Promise<SendMessageResponse> => {
    const response = await api.post('/chatbot/message', {
      conversationId,
      message,
    });
    return response.data;
  },

  // Buscar histórico de conversa
  getHistory: async (conversationId: string, limit: number = 100, offset: number = 0): Promise<ChatHistoryResponse> => {
    const response = await api.get(`/chatbot/conversation/${conversationId}/history`, {
      params: { limit, offset },
    });
    return response.data;
  },

  // Finalizar conversa
  endConversation: async (conversationId: string): Promise<void> => {
    await api.post(`/chatbot/conversation/${conversationId}/end`);
  },
};
