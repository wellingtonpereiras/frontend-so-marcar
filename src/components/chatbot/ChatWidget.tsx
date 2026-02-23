import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Send, Loader2, MessageSquare, X, Minimize2, Maximize2, Bot } from 'lucide-react';
import { chatbotApi } from '../../api/chatbot';
import { useAuthStore } from '../../stores/authStore';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import toast from 'react-hot-toast';
import type { ChatMessage as ChatMessageType } from '../../types';

export function ChatWidget() {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // const [metadata, setMetadata] = useState<any>(null); // Armazena dados analíticos para profissionais
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation para iniciar nova conversa
  const startChatMutation = useMutation({
    mutationFn: () => chatbotApi.startChat({
      establishmentId: user.establishmentId,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      language: 'pt-BR',
      userAgent: navigator.userAgent,
      userType: user.role === 'owner' ? 'professional' : 'customer',
      professionalId: user.role === 'owner' ? user.id : undefined,
    }),
    onSuccess: (response) => {
      console.log('Chat iniciado:', response);
      
      if (response && response.id) {
        setConversationId(response.id);
        
        // Adicionar mensagem de boas-vindas
        if (response.welcomeMessage) {
          const systemMessage: ChatMessageType = {
            id: response.welcomeMessage.id,
            conversationId: response.welcomeMessage.conversationId,
            role: 'assistant',
            content: response.welcomeMessage.content,
            createdAt: response.welcomeMessage.createdAt,
          };
          setMessages([systemMessage]);
        }
        
        // A API antiga não retorna suggestions no start, só no message
        setSuggestions([]);
      }
    },
    onError: (error) => {
      console.error('Erro ao iniciar conversa:', error);
      toast.error('Erro ao iniciar conversa');
    },
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string; conversationId: string }) => {
      console.log('Enviando mensagem:', data);
      
      return chatbotApi.sendMessage(data.conversationId, data.message);
    },
    onSuccess: (response) => {
      console.log('Resposta do backend:', response);
      
      if (response && response.message) {
        // Criar mensagem do assistente
        const assistantMessage: ChatMessageType = {
          id: Date.now().toString(),
          conversationId: response.conversationId,
          role: 'assistant',
          content: response.message,
          createdAt: new Date().toISOString(),
          metadata: response.metadata,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Atualizar sugestões
        if (response.suggestions && response.suggestions.length > 0) {
          setSuggestions(response.suggestions);
        } else {
          setSuggestions([]);
        }
        
        // Armazenar metadata para possível visualização
        // if (response.metadata) {
        //   setMetadata(response.metadata);
        // }
      } else {
        console.error('Resposta inválida:', response);
        toast.error('Resposta do bot inválida');
      }
    },
    onError: (error) => {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    },
  });

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || message.trim();
    if (!messageText || !user) return;

    // Se não há conversação ativa, iniciar uma nova
    if (!conversationId) {
      try {
        const response = await startChatMutation.mutateAsync();
        
        console.log('Resposta completa do startChat:', response);
        
        if (!response || !response.id) {
          console.error('Resposta inválida:', response);
          toast.error('Não foi possível iniciar a conversa');
          return;
        }
        
        const newConvId = response.id;
        
        const userMessage: ChatMessageType = {
          id: Date.now().toString(),
          conversationId: newConvId,
          role: 'user',
          content: messageText,
          createdAt: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, userMessage]);
        setMessage('');

        sendMessageMutation.mutate({
          message: messageText,
          conversationId: newConvId,
        });
      } catch (error) {
        console.error('Erro ao iniciar conversa no handleSend:', error);
        toast.error('Não foi possível iniciar a conversa');
        return;
      }
    } else {
      const userMessage: ChatMessageType = {
        id: Date.now().toString(),
        conversationId: conversationId,
        role: 'user',
        content: messageText,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setMessage('');

      sendMessageMutation.mutate({
        message: messageText,
        conversationId: conversationId,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setSuggestions([]);
    // setMetadata(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Abrir chat com IA"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed ${
        isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96'
      } bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300`}
      style={{
        height: isMinimized ? '60px' : '600px',
        maxHeight: 'calc(100vh - 100px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-600 dark:bg-primary-700 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Assistente IA</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="hover:bg-primary-700 dark:hover:bg-primary-800 p-1 rounded transition-colors"
            title="Nova conversa"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-primary-700 dark:hover:bg-primary-800 p-1 rounded transition-colors"
            title={isMinimized ? 'Maximizar' : 'Minimizar'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary-700 dark:hover:bg-primary-800 p-1 rounded transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Olá! Como posso ajudar você hoje?</p>
                <p className="text-xs mt-2">
                  Pergunte sobre agendamentos, serviços, clientes e muito mais!
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {sendMessageMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Sugestões */}
            {suggestions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    disabled={sendMessageMutation.isPending}
                    className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-full transition-colors border border-primary-200 dark:border-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="px-3"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Powered by GPT-4 • Pressione Enter para enviar
            </p>
          </div>
        </>
      )}
    </div>
  );
}
