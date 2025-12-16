export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'staff';
  establishmentId: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Establishment {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email?: string;
  address?: string;
  businessType: 'salon' | 'barbershop' | 'clinic' | 'petshop';
  planType: 'basic' | 'premium';
  isActive: boolean;
}

export interface Professional {
  id: string;
  establishmentId: string;
  name: string;
  specialties: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  bufferBefore?: number;  // Minutos de buffer antes
  bufferAfter?: number;   // Minutos de buffer depois
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  establishmentId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalAppointments: number;
  cancelledAppointments: number;
  createdAt: string;
}

export interface Appointment {
  id: string;
  establishmentId: string;
  customerId: string;
  professionalId?: string; // Opcional se for reserva de recurso
  serviceId?: string; // Opcional se for reserva de recurso
  resourceId?: string; // Para reservas de recursos (salas/espaços)
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  endTime?: string; // HH:mm - Obrigatório para recursos
  durationMinutes: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  reminderSentAt?: string;
  reminderConfirmed: boolean;
  bookingSource: 'manual' | 'whatsapp_bot' | 'web';
  customer?: Customer;
  professional?: Professional;
  service?: Service;
  resource?: Resource; // Adicionado para reservas de recursos
  createdAt: string;
}

export interface CreateAppointmentDto {
  establishmentId: string;
  customerId: string;
  professionalId?: string; // Opcional se resourceId estiver presente
  serviceId?: string; // Opcional se resourceId estiver presente
  resourceId?: string; // Para reservas de recursos
  scheduledDate: string;
  scheduledTime: string;
  endTime?: string; // Obrigatório quando resourceId está presente
  durationMinutes: number;
  notes?: string;
  bookingSource?: 'manual' | 'whatsapp_bot' | 'web';
}

export interface BusinessHours {
  id: string;
  establishmentId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isOpen: boolean;
  createdAt: string;
}

export interface CreateBusinessHoursDto {
  establishmentId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

// Resources (Espaços/Recursos)
export interface Resource {
  id: string;
  establishmentId: string;
  name: string;
  description?: string;
  capacity: number; // Capacidade máxima de pessoas/reservas simultâneas
  isShared: boolean; // Se permite múltiplas reservas simultâneas
  hourlyRate: number; // Valor por hora em reais
  isFree: boolean; // Se o agendamento é gratuito
  amenities?: string[]; // Comodidades disponíveis (wifi, projetor, etc)
  cancellationHours: number; // Horas mínimas de antecedência para cancelamento
  allowedDurations: number[]; // Durações permitidas em minutos [60, 120, 240, 480]
  isActive: boolean;
  createdAt?: string;
}

export interface CreateResourceDto {
  establishmentId: string;
  name: string;
  description?: string;
  capacity: number;
  isShared: boolean;
  hourlyRate: number;
  isFree: boolean;
  amenities?: string[];
  cancellationHours: number;
  allowedDurations: number[]; // [60, 120, 240, 480]
}

// Resource Bookings são tratados como Appointments com resourceId
// Não existe entidade separada no backend
