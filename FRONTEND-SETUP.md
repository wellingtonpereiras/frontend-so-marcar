# Frontend Só Marcar - Instalação Completa

Este guia detalha como foi criado o projeto frontend e próximos passos.

## ✅ O que já foi feito:

### 1. Projeto Base
- ✅ Vite + React + TypeScript criado
- ✅ TailwindCSS configurado
- ✅ Dependências instaladas:
  - `@tanstack/react-query` - Gerenciamento de estado servidor
  - `axios` - Cliente HTTP
  - `zustand` - State management global
  - `react-router-dom` - Roteamento
  - `date-fns` - Manipulação de datas
  - `lucide-react` - Ícones
  - `recharts` - Gráficos

### 2. Estrutura de Pastas
```
src/
├── api/                     # Serviços de API
│   ├── client.ts           ✅ Cliente Axios configurado
│   ├── auth.ts             ✅ API de autenticação
│   ├── appointments.ts     ✅ API de agendamentos
│   ├── professionals.ts    ✅ API de profissionais
│   ├── services.ts         ✅ API de serviços
│   └── customers.ts        ✅ API de clientes
├── components/
│   ├── auth/               # Componentes de login
│   ├── common/             # Componentes compartilhados
│   ├── dashboard/          # Componentes do dashboard
│   ├── appointments/       # Componentes de agendamentos
│   ├── customers/          # Componentes de clientes
│   ├── professionals/      # Componentes de profissionais
│   └── services/           # Componentes de serviços
├── hooks/                  # Custom hooks
├── pages/
│   ├── auth/               # Páginas de autenticação
│   └── dashboard/          # Páginas do dashboard
├── stores/
│   └── authStore.ts        ✅ Zustand store de autenticação
├── types/
│   └── index.ts            ✅ TypeScript types
└── utils/                  # Funções utilitárias
```

### 3. Arquivos Criados

**Configuração:**
- ✅ `tailwind.config.js` - Configuração Tailwind com tema personalizado
- ✅ `postcss.config.js` - PostCSS configurado
- ✅ `src/index.css` - Estilos globais com Tailwind

**API Layer:**
- ✅ `src/api/client.ts` - Cliente Axios com interceptors JWT
- ✅ `src/api/auth.ts` - Login, profile, change password
- ✅ `src/api/appointments.ts` - CRUD de agendamentos
- ✅ `src/api/professionals.ts` - CRUD de profissionais
- ✅ `src/api/services.ts` - CRUD de serviços
- ✅ `src/api/customers.ts` - CRUD de clientes

**Types:**
- ✅ `src/types/index.ts` - Todas as interfaces TypeScript

**State Management:**
- ✅ `src/stores/authStore.ts` - Store de autenticação com Zustand + persist

**App Principal:**
- ✅ `src/App.tsx` - Rotas e QueryClient configurados

## 📝 Próximos Passos - Componentes a Criar:

### 1. Página de Login
Arquivo: `src/pages/auth/LoginPage.tsx`
```tsx
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('jose@barbearia.com');
  const [password, setPassword] = useState('senha123');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Só Marcar</h1>
          <p className="text-gray-600 mt-2">Sistema de Agendamentos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="btn-primary w-full"
          >
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>

          {loginMutation.isError && (
            <p className="text-red-600 text-sm text-center">
              Email ou senha incorretos
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
```

### 2. Layout do Dashboard
Arquivo: `src/components/common/DashboardLayout.tsx`
```tsx
import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCircle,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/appointments', icon: Calendar },
    { name: 'Clientes', href: '/customers', icon: Users },
    { name: 'Profissionais', href: '/professionals', icon: UserCircle },
    { name: 'Serviços', href: '/services', icon: Scissors },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">Só Marcar</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

### 3. Dashboard Principal
Arquivo: `src/pages/dashboard/DashboardPage.tsx`
```tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '../../api/appointments';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', user?.establishmentId, today],
    queryFn: () => appointmentsApi.getAll(user!.establishmentId, today),
    enabled: !!user?.establishmentId,
  });

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: appointments.length,
      icon: Calendar,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      label: 'Confirmados',
      value: appointments.filter((a) => a.status === 'confirmed').length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Receita Estimada',
      value: `R$ ${appointments.reduce((sum, a) => sum + (a.service?.price || 0), 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Clientes Únicos',
      value: new Set(appointments.map((a) => a.customerId)).size,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Agendamentos de Hoje</h2>
        
        {appointments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Nenhum agendamento para hoje
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-600">
                      {appointment.scheduledTime.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.customer?.name}</p>
                    <p className="text-sm text-gray-600">
                      {appointment.service?.name} • {appointment.professional?.name}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {appointment.status === 'confirmed' && 'Confirmado'}
                    {appointment.status === 'completed' && 'Concluído'}
                    {appointment.status === 'cancelled' && 'Cancelado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🚀 Como Continuar:

### Opção 1: Executar o servidor de desenvolvimento
```bash
cd so-marcar-frontend
npm run dev
```
Acesse: `http://localhost:5173`

### Opção 2: Criar os componentes restantes

Você precisa criar mais 4 páginas principais:

1. **AppointmentsPage.tsx** - Lista e cria agendamentos
2. **ProfessionalsPage.tsx** - CRUD de profissionais
3. **ServicesPage.tsx** - CRUD de serviços
4. **CustomersPage.tsx** - CRUD de clientes

### Estrutura de cada página CRUD:
- Listagem com tabela
- Botão "Adicionar Novo"
- Modal de criação/edição
- Ações de editar/deletar
- Pesquisa e filtros

## 📦 Variáveis de Ambiente

Crie o arquivo `.env`:
```
VITE_API_URL=http://localhost:3300/api/v1
```

## 🎨 Componentes Reutilizáveis Necessários:

1. **Modal.tsx** - Modal genérico
2. **Table.tsx** - Tabela com paginação
3. **Button.tsx** - Botões estilizados
4. **Input.tsx** - Inputs com validação
5. **Select.tsx** - Dropdown customizado

## ✅ Status Atual:

- ✅ Projeto criado e configurado
- ✅ API Layer completa
- ✅ Autenticação implementada
- ✅ Roteamento configurado
- ✅ Store Zustand pronto
- ⏳ Páginas principais (25% concluído)
- ⏳ Componentes reutilizáveis (0%)
- ⏳ Responsividade mobile (0%)

## 🔄 Integração com Backend:

O frontend está configurado para se conectar ao backend em:
- **Dev**: `http://localhost:3300/api/v1`
- **Produção**: Configurar via `VITE_API_URL`

**Credenciais de teste:**
- Email: `jose@barbearia.com`
- Senha: `senha123`

## 📚 Próximos Passos Recomendados:

1. Criar os componentes reutilizáveis (Modal, Table, etc.)
2. Implementar as 4 páginas CRUD restantes
3. Adicionar validação de formulários (react-hook-form)
4. Implementar loading states e error boundaries
5. Adicionar toasts de feedback (react-hot-toast)
6. Implementar responsividade mobile
7. Adicionar dark mode (opcional)
8. Criar página de relatórios com gráficos (Recharts)

---

**Frontend pronto para desenvolvimento! 🚀**
