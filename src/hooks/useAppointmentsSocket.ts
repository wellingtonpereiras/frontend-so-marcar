import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Tipos dos eventos
interface AppointmentEventData {
  type: string;
  data: any; // Appointment completo
  timestamp: string;
}

interface UseAppointmentsSocketOptions {
  establishmentId: string;
  enabled?: boolean;
  onNewBooking?: (appointment: any) => void;
  onBookingApproved?: (appointment: any) => void;
  onBookingRejected?: (appointment: any) => void;
  onBookingCancelled?: (appointment: any) => void;
  onBookingUpdated?: (appointment: any) => void;
}

export function useAppointmentsSocket({
  establishmentId,
  enabled = true,
  onNewBooking,
  onBookingApproved,
  onBookingRejected,
  onBookingCancelled,
  onBookingUpdated,
}: UseAppointmentsSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  
  // Usar refs para callbacks para evitar reconexões desnecessárias
  const callbacksRef = useRef({
    onNewBooking,
    onBookingApproved,
    onBookingRejected,
    onBookingCancelled,
    onBookingUpdated,
  });
  
  // Atualizar refs quando callbacks mudarem (sem causar reconexão)
  useEffect(() => {
    callbacksRef.current = {
      onNewBooking,
      onBookingApproved,
      onBookingRejected,
      onBookingCancelled,
      onBookingUpdated,
    };
  }, [onNewBooking, onBookingApproved, onBookingRejected, onBookingCancelled, onBookingUpdated]);

  useEffect(() => {
    if (!enabled || !establishmentId) return;

    // URL do WebSocket (sem /api/v1)
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3300';

    // Conectar ao WebSocket
    const socket = io(`${wsUrl}/appointments`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Eventos de conexão
    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id);
      setIsConnected(true);

      // Inscrever-se automaticamente no estabelecimento
      socket.emit('subscribe', { establishmentId }, (response: any) => {
        console.log('📡 Inscrito no estabelecimento:', response);
        setIsSubscribed(true);
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
      setIsSubscribed(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
    });

    // Eventos de agendamentos (usar refs para evitar stale closures)
    socket.on('new-booking', (eventData: AppointmentEventData) => {
      console.log('🆕 Nova solicitação recebida:', eventData);
      callbacksRef.current.onNewBooking?.(eventData.data);
    });

    socket.on('booking-approved', (eventData: AppointmentEventData) => {
      console.log('✅ Agendamento aprovado:', eventData);
      callbacksRef.current.onBookingApproved?.(eventData.data);
    });

    socket.on('booking-rejected', (eventData: AppointmentEventData) => {
      console.log('❌ Agendamento rejeitado:', eventData);
      callbacksRef.current.onBookingRejected?.(eventData.data);
    });

    socket.on('booking-cancelled', (eventData: AppointmentEventData) => {
      console.log('🚫 Agendamento cancelado:', eventData);
      callbacksRef.current.onBookingCancelled?.(eventData.data);
    });

    socket.on('booking-updated', (eventData: AppointmentEventData) => {
      console.log('🔄 Agendamento atualizado:', eventData);
      callbacksRef.current.onBookingUpdated?.(eventData.data);
    });

    // Cleanup ao desmontar
    return () => {
      if (socket) {
        socket.emit('unsubscribe', { establishmentId });
        socket.disconnect();
      }
    };
  }, [establishmentId, enabled]); // ✅ Remover callbacks das dependências

  // Método para reconectar manualmente
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    isSubscribed,
    reconnect,
    socket: socketRef.current,
  };
}
