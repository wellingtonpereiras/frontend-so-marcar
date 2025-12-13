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
  professionalId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  notes?: string;
  reminderSentAt?: string;
  reminderConfirmed: boolean;
  bookingSource: 'manual' | 'whatsapp_bot' | 'web';
  customer?: Customer;
  professional?: Professional;
  service?: Service;
  createdAt: string;
}

export interface CreateAppointmentDto {
  establishmentId: string;
  customerId: string;
  professionalId: string;
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  notes?: string;
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
  type: string; // 'meeting_room', 'sports_court', 'studio', etc
  capacity: number;
  hourlyRate?: number; // null se for gratuito
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateResourceDto {
  establishmentId: string;
  name: string;
  description?: string;
  type: string;
  capacity: number;
  hourlyRate?: number;
  isFree: boolean;
  isActive?: boolean;
}

// Resource Bookings (Reservas de Espaços)
export interface ResourceBooking {
  id: string;
  resourceId: string;
  customerId: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  notes?: string;
  // Recorrência
  recurrencePattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  parentBookingId?: string;
  // Relações
  resource?: Resource;
  customer?: Customer;
  createdAt: string;
}

export interface CreateResourceBookingDto {
  resourceId: string;
  customerId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  recurrencePattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}
