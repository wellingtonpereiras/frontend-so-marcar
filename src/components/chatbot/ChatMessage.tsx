import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Bot } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-100 dark:bg-primary-900/50' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        ) : (
          <Bot className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </div>

      {/* Mensagem */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'flex justify-end' : ''}`}>
        <div className={`rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}>
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isUser ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {format(new Date(message.createdAt), 'HH:mm', { locale: ptBR })}
          </p>
        </div>
      </div>
    </div>
  );
}
