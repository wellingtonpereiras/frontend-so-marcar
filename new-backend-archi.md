# 🗓️ Só Marcar - Sistema de Agendamento Inteligente

> **Sistema completo de agendamento multi-módulo com IA para pequenos negócios locais**

Sistema robusto de agendamento que suporta **dois modelos de operação**:
1. **Prestação de Serviços** (salões, clínicas, oficinas) - Agendamento com profissionais
2. **Aluguel de Espaços** (salas de reunião, quadras esportivas) - Reserva de recursos

**Diferenciais:**
- ✨ Chatbot com IA (OpenAI GPT-4) para agendamento via linguagem natural
- 📱 Integração com WhatsApp para lembretes automáticos
- 📊 Analytics e relatórios detalhados
- 🔄 Agendamentos recorrentes
- 🏢 Multi-estabelecimento
- ⚡ Performance otimizada com Redis

---

## 📑 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Especificação Completa](#-especificação-completa)
- [Instalação](#-instalação-e-execução)
- [Módulos do Sistema](#-módulos-do-sistema)
- [Checklist de Implementação](#-checklist-de-implementação)
- [API Endpoints](#-api-endpoints)
- [Banco de Dados](#-banco-de-dados)
- [Configuração](#-configuração)
- [Testes](#-testes)

---

## 🚀 Tecnologias

### Backend
- **Framework:** NestJS 10.x + TypeScript 5.x
- **Banco de Dados:** PostgreSQL 15
- **ORM:** TypeORM com migrations
- **Cache/Filas:** Redis + Bull Queue
- **Validação:** class-validator + class-transformer
- **Autenticação:** JWT + Passport
- **Documentação:** Swagger/OpenAPI

### Integrações
- **IA:** OpenAI GPT-4-turbo-preview
- **Mensageria:** WhatsApp Business API (Evolution API)
- **Agendamento:** @nestjs/schedule (cron jobs)

### DevOps
- **Containerização:** Docker + Docker Compose
- **Testes:** Jest (unit + e2e)
- **Linting:** ESLint + Prettier

---

## 🏗️ Arquitetura

### Arquitetura Multi-Módulo

```
so-marcar/
├── src/
│   ├── modules/
│   │   ├── establishments/      # Estabelecimentos
│   │   ├── customers/          # Clientes
│   │   ├── professionals/      # Profissionais
│   │   ├── services/           # Serviços oferecidos
│   │   ├── resources/          # Recursos/Espaços
│   │   ├── appointments/       # Agendamentos (serviços)
│   │   ├── resource-bookings/  # Reservas (espaços)
│   │   ├── business-hours/     # Horários de funcionamento
│   │   ├── chatbot/           # Chatbot com IA
│   │   ├── whatsapp/          # Integração WhatsApp
│   │   ├── reminders/         # Lembretes automáticos
│   │   ├── analytics/         # Relatórios e métricas
│   │   └── auth/              # Autenticação e autorização
│   ├── database/
│   │   ├── migrations/        # Migrations TypeORM
│   │   └── seeds/             # Dados iniciais
│   ├── config/                # Configurações
│   └── common/                # Utilitários compartilhados
├── test/                      # Testes e2e
└── docker-compose.yml
```

### Fluxo de Dados

```mermaid
graph TD
    A[Cliente] -->|HTTP REST| B[NestJS API]
    A -->|Chat| C[Chatbot Module]
    C -->|OpenAI API| D[GPT-4]
    B -->|CRUD| E[PostgreSQL]
    B -->|Cache| F[Redis]
    B -->|Jobs| G[Bull Queue]
    G -->|Lembretes| H[WhatsApp API]
    B -->|Analytics| I[Analytics Module]
```

---

## 📋 Especificação Completa

### Modelos de Operação

#### 1. **Prestação de Serviços**
Para negócios que oferecem serviços com profissionais:
- Salões de beleza
- Barbearias
- Clínicas (médicas, odontológicas, veterinárias)
- Oficinas mecânicas
- Consultorias

**Características:**
- Serviços cadastrados com duração e preço
- Profissionais com especialidades
- Agenda individual por profissional
- Bloqueios de horário personalizados
- Integração com WhatsApp para confirmações

#### 2. **Aluguel de Espaços**
Para negócios que alugam recursos/espaços por hora:
- Salas de reunião
- Quadras esportivas
- Estúdios de gravação/fotografia
- Espaços para eventos
- Equipamentos

**Características:**
- Recursos com capacidade e valor/hora
- Agendamentos recorrentes (diário, semanal, mensal)
- Cálculo automático de preços
- Recursos gratuitos ou pagos
- Disponibilidade em tempo real

### Funcionalidades Principais

#### 🎯 Core Features
1. **Multi-estabelecimento**
   - Cada estabelecimento é independente
   - Configurações personalizadas
   - Modo de operação: `services`, `spaces` ou ambos

2. **Agendamento Inteligente**
   - Verificação automática de disponibilidade
   - Prevenção de conflitos
   - Buffers entre agendamentos
   - Bloqueios de horário

3. **Chatbot com IA**
   - Linguagem natural em português
   - Extração automática de intenções
   - Criação de agendamentos via chat
   - Consulta de disponibilidade
   - Histórico de conversas

4. **Notificações WhatsApp**
   - Confirmação de agendamento
   - Lembrete 24h antes
   - Lembrete 1h antes
   - Confirmação de cancelamento

5. **Analytics e Relatórios**
   - Taxa de ocupação
   - Receita por período
   - Serviços/recursos mais populares
   - Taxa de cancelamento
   - Horários de pico

#### 🔐 Autenticação e Autorização
- JWT tokens
- Roles: `admin`, `professional`, `customer`
- Permissões por estabelecimento
- Senha criptografada com bcrypt

#### 📊 Business Rules

**Agendamentos:**
- Mínimo 30 minutos de antecedência
- Máximo 90 dias no futuro
- Cancelamento gratuito até 24h antes
- Status: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`

**Horários:**
- Configuração por dia da semana
- Suporte a múltiplos turnos
- Bloqueios temporários
- Feriados

**Recorrência:**
- Padrões: daily, weekly, biweekly, monthly
- Data de término ou número de ocorrências
- Geração automática de agendamentos

---

## 🔧 Instalação e Execução

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm ou yarn
- PostgreSQL 15 (via Docker)
- Redis 7 (via Docker)

### 1. Clone o repositório

```bash
git clone <repository-url>
cd so-marcar
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=so_marcar

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI (para Chatbot)
OPENAI_API_KEY=sk-your-openai-api-key-here

# WhatsApp (Evolution API)
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=your-evolution-api-key

# Application
PORT=3000
NODE_ENV=development
```

### 4. Inicie os serviços com Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- Redis (porta 6379)
- pgAdmin (porta 5050)

### 5. Execute as migrations

```bash
npm run migration:run
```

### 6. (Opcional) Popule com dados de exemplo

```bash
npm run seed
```

### 7. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 8. Acesse a aplicação

- **API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api
- **pgAdmin:** http://localhost:5050

---

## 📦 Módulos do Sistema

### 1. Establishments (Estabelecimentos)
Gerencia os estabelecimentos cadastrados.

**Entidade:** `Establishment`
- Nome, email, telefone, endereço
- Modo de operação: `services`, `spaces`, `both`
- Configurações (timezone, idioma)

**Endpoints:**
- `POST /establishments` - Criar estabelecimento
- `GET /establishments` - Listar estabelecimentos
- `GET /establishments/:id` - Buscar por ID
- `PATCH /establishments/:id` - Atualizar
- `DELETE /establishments/:id` - Deletar

---

### 2. Customers (Clientes)
Gerencia clientes dos estabelecimentos.

**Entidade:** `Customer`
- Nome, email, telefone
- Preferências de notificação
- Relacionamento com estabelecimento

**Endpoints:**
- `POST /customers` - Criar cliente
- `GET /customers` - Listar clientes
- `GET /customers/:id` - Buscar por ID
- `PATCH /customers/:id` - Atualizar
- `DELETE /customers/:id` - Deletar

---

### 3. Professionals (Profissionais)
Gerencia profissionais que prestam serviços.

**Entidade:** `Professional`
- Nome, email, especialidades
- Relacionamento com estabelecimento
- Serviços que pode realizar

**Endpoints:**
- `POST /professionals` - Criar profissional
- `GET /professionals` - Listar profissionais
- `GET /professionals/:id` - Buscar por ID
- `PATCH /professionals/:id` - Atualizar
- `DELETE /professionals/:id` - Deletar

---

### 4. Services (Serviços)
Gerencia serviços oferecidos.

**Entidade:** `Service`
- Nome, descrição
- Duração (minutos)
- Preço
- Buffer antes/depois

**Endpoints:**
- `POST /services` - Criar serviço
- `GET /services` - Listar serviços
- `GET /services/:id` - Buscar por ID
- `PATCH /services/:id` - Atualizar
- `DELETE /services/:id` - Deletar

---

### 5. Resources (Recursos/Espaços)
Gerencia espaços e recursos para aluguel.

**Entidade:** `Resource`
- Nome, descrição, tipo
- Capacidade
- Valor por hora
- Recursos gratuitos (isFree)

**Endpoints:**
- `POST /resources` - Criar recurso
- `GET /resources` - Listar recursos
- `GET /resources/:id` - Buscar por ID
- `PATCH /resources/:id` - Atualizar
- `DELETE /resources/:id` - Deletar
- `GET /resources/:id/availability` - Verificar disponibilidade

---

### 6. Appointments (Agendamentos de Serviços)
Gerencia agendamentos com profissionais.

**Entidade:** `Appointment`
- Cliente, profissional, serviço
- Data e hora
- Status, preço
- Notas

**Endpoints:**
- `POST /appointments` - Criar agendamento
- `GET /appointments` - Listar agendamentos
- `GET /appointments/:id` - Buscar por ID
- `PATCH /appointments/:id` - Atualizar
- `DELETE /appointments/:id` - Cancelar
- `POST /appointments/:id/confirm` - Confirmar
- `POST /appointments/:id/complete` - Concluir
- `GET /appointments/availability` - Verificar disponibilidade

---

### 7. Resource Bookings (Reservas de Espaços)
Gerencia reservas de recursos/espaços.

**Entidade:** `ResourceBooking`
- Cliente, recurso
- Data, hora início/fim
- Recorrência (opcional)
- Preço calculado

**Endpoints:**
- `POST /resource-bookings` - Criar reserva
- `GET /resource-bookings` - Listar reservas
- `GET /resource-bookings/:id` - Buscar por ID
- `PATCH /resource-bookings/:id` - Atualizar
- `DELETE /resource-bookings/:id` - Cancelar
- `POST /resource-bookings/recurring` - Criar reserva recorrente

---

### 8. Business Hours (Horários de Funcionamento)
Gerencia horários de funcionamento.

**Entidade:** `BusinessHours`
- Dia da semana
- Horários de abertura/fechamento
- Bloqueios temporários

**Endpoints:**
- `POST /business-hours` - Criar horário
- `GET /business-hours` - Listar horários
- `GET /business-hours/:id` - Buscar por ID
- `PATCH /business-hours/:id` - Atualizar
- `DELETE /business-hours/:id` - Deletar

---

### 9. Chatbot (Assistente Virtual com IA) ⭐ NEW
Chatbot inteligente com OpenAI GPT-4.

**Entidades:**
- `ChatConversation` - Conversas
- `ChatMessage` - Mensagens

**Recursos:**
- Linguagem natural em português
- Extração de intenções e entidades
- Function calling (verificar disponibilidade, criar agendamento)
- Histórico de conversas
- Suporte a usuários anônimos

**Endpoints:**
- `POST /chatbot/start` - Iniciar conversa
- `POST /chatbot/message` - Enviar mensagem
- `GET /chatbot/conversation/:id/history` - Ver histórico
- `POST /chatbot/conversation/:id/end` - Encerrar conversa

**Documentação:** Ver `FASE_4_CHATBOT.md`

---

### 10. WhatsApp (Notificações)
Integração com WhatsApp Business API.

**Funcionalidades:**
- Envio de lembretes automáticos
- Confirmação de agendamentos
- Notificações de cancelamento

**Endpoints:**
- `POST /whatsapp/send` - Enviar mensagem

---

### 11. Reminders (Lembretes Automáticos)
Sistema de lembretes com filas.

**Funcionalidades:**
- Lembrete 24h antes
- Lembrete 1h antes
- Processamento em background (Bull Queue)

---

### 12. Analytics (Relatórios)
Análises e métricas do negócio.

**Endpoints:**
- `GET /analytics/overview` - Visão geral
- `GET /analytics/occupancy` - Taxa de ocupação
- `GET /analytics/revenue` - Receita
- `GET /analytics/popular-services` - Serviços populares
- `GET /analytics/peak-hours` - Horários de pico

---

### 13. Auth (Autenticação)
Sistema de autenticação JWT.

**Endpoints:**
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Perfil do usuário

---

## ✅ Checklist de Implementação

### 🟢 FASE 1: Estrutura Base (COMPLETO)
- [x] Configuração inicial do projeto NestJS
- [x] Configuração TypeORM + PostgreSQL
- [x] Configuração Redis + Bull
- [x] Docker Compose (Postgres, Redis, pgAdmin)
- [x] Módulo de Estabelecimentos
- [x] Módulo de Clientes
- [x] Módulo de Profissionais
- [x] Módulo de Serviços
- [x] Módulo de Horários de Funcionamento
- [x] Autenticação JWT
- [x] Documentação Swagger

### 🟢 FASE 2: Agendamentos (COMPLETO)
- [x] Módulo de Appointments (serviços)
- [x] Verificação de disponibilidade
- [x] Prevenção de conflitos
- [x] Status de agendamentos
- [x] Relacionamentos entre entidades
- [x] Validações de regras de negócio
- [x] Testes unitários básicos

### 🟢 FASE 3: Multi-Módulo Resources (COMPLETO)
- [x] Módulo de Resources (espaços/recursos)
- [x] Módulo de Resource Bookings (reservas)
- [x] Agendamentos recorrentes
- [x] Cálculo de preços por hora
- [x] Recursos gratuitos
- [x] Verificação de disponibilidade de recursos
- [x] Seeds de exemplo (resources + bookings)
- [x] Testes E2E
- [x] Migrations completas

### 🟢 FASE 4: Chatbot com IA (COMPLETO)
- [x] Integração OpenAI GPT-4
- [x] Entidade ChatConversation
- [x] Entidade ChatMessage
- [x] Function calling (check_availability, create_appointment)
- [x] System prompt dinâmico
- [x] Extração de intenções e entidades
- [x] Histórico de conversas
- [x] Suporte a usuários anônimos
- [x] API REST completa
- [x] Migration para tabelas de chat
- [x] Documentação completa

### 🟡 FASE 5: Integrações e Automações (EM DESENVOLVIMENTO)
- [x] Módulo WhatsApp base
- [x] Módulo Reminders base
- [ ] Integração completa com Evolution API
- [ ] Filas Bull para lembretes
- [ ] Lembrete 24h antes (job)
- [ ] Lembrete 1h antes (job)
- [ ] Templates de mensagens WhatsApp
- [ ] Confirmação via WhatsApp
- [ ] Testes de integração WhatsApp

### 🟡 FASE 6: Analytics e Relatórios (PARCIAL)
- [x] Módulo Analytics base
- [x] Endpoint de overview
- [ ] Taxa de ocupação detalhada
- [ ] Relatório de receita por período
- [ ] Serviços/recursos mais populares
- [ ] Taxa de cancelamento
- [ ] Horários de pico
- [ ] Gráficos e visualizações
- [ ] Export para PDF/Excel

### 🔴 FASE 7: Melhorias Frontend (NÃO INICIADO)
- [ ] Widget de chat para embed
- [ ] Interface de agendamento cliente
- [ ] Painel admin estabelecimento
- [ ] Calendário visual
- [ ] Dashboard analytics
- [ ] Configurações do chatbot
- [ ] Gestão de notificações

### 🔴 FASE 8: Funcionalidades Avançadas (NÃO INICIADO)
- [ ] Pagamentos online (Stripe/Mercado Pago)
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade
- [ ] Multi-idioma (i18n)
- [ ] Tema dark/light
- [ ] Notificações push
- [ ] Export de dados (LGPD)
- [ ] Logs de auditoria

### 🔴 FASE 9: Testes e Qualidade (PARCIAL)
- [x] Testes E2E básicos
- [ ] Cobertura de testes >80%
- [ ] Testes de integração completos
- [ ] Testes de carga (k6)
- [ ] CI/CD pipeline
- [ ] Monitoramento (Sentry)
- [ ] Performance profiling

### 🔴 FASE 10: Deploy e Produção (NÃO INICIADO)
- [ ] Dockerfile otimizado
- [ ] Kubernetes manifests
- [ ] Deploy AWS/GCP
- [ ] Backup automático
- [ ] Disaster recovery
- [ ] Scaling horizontal
- [ ] CDN para assets
- [ ] Domínio e SSL

---

## 🌐 API Endpoints

### Resumo por Módulo

| Módulo | Base URL | Endpoints | Status |
|--------|----------|-----------|--------|
| Auth | `/auth` | 4 | ✅ |
| Establishments | `/establishments` | 5 | ✅ |
| Customers | `/customers` | 5 | ✅ |
| Professionals | `/professionals` | 5 | ✅ |
| Services | `/services` | 5 | ✅ |
| Resources | `/resources` | 6 | ✅ |
| Appointments | `/appointments` | 8 | ✅ |
| Resource Bookings | `/resource-bookings` | 6 | ✅ |
| Business Hours | `/business-hours` | 5 | ✅ |
| Chatbot | `/chatbot` | 4 | ✅ |
| WhatsApp | `/whatsapp` | 1 | ⚠️ |
| Reminders | `/reminders` | 0 | ⚠️ |
| Analytics | `/analytics` | 5 | ⚠️ |

**Total:** ~59 endpoints

---

## 🗄️ Banco de Dados

### Schema PostgreSQL

```sql
-- Estabelecimentos
establishments
├── id (PK)
├── name, email, phone, address
├── operation_mode (enum)
└── settings (jsonb)

-- Clientes
customers
├── id (PK)
├── establishment_id (FK)
├── name, email, phone
└── preferences (jsonb)

-- Profissionais
professionals
├── id (PK)
├── establishment_id (FK)
├── user_id (FK)
├── name, email
└── specialties (text[])

-- Serviços
services
├── id (PK)
├── establishment_id (FK)
├── name, description
├── duration_minutes
├── price
└── buffer_before, buffer_after

-- Recursos/Espaços
resources
├── id (PK)
├── establishment_id (FK)
├── name, description, type
├── capacity
├── hourly_rate (nullable)
├── is_free
└── is_active

-- Agendamentos (Serviços)
appointments
├── id (PK)
├── establishment_id (FK)
├── customer_id (FK)
├── professional_id (FK)
├── service_id (FK)
├── appointment_date, start_time
├── status (enum)
├── price
└── notes

-- Reservas (Espaços)
resource_bookings
├── id (PK)
├── resource_id (FK)
├── customer_id (FK)
├── booking_date
├── start_time, end_time
├── status (enum)
├── total_price
├── recurrence_pattern (optional)
└── parent_booking_id (FK, optional)

-- Horários de Funcionamento
business_hours
├── id (PK)
├── establishment_id (FK)
├── day_of_week (0-6)
├── open_time, close_time
└── is_closed

-- Conversas do Chatbot
chat_conversations
├── id (PK)
├── customer_id (FK, nullable)
├── establishment_id (FK)
├── session_id (para anônimos)
├── customer_name, phone, email
├── status (enum)
└── metadata (jsonb)

-- Mensagens do Chatbot
chat_messages
├── id (PK)
├── conversation_id (FK)
├── role (enum: user/assistant/system)
├── content (text)
└── metadata (jsonb)

-- Usuários (Auth)
users
├── id (PK)
├── email, password_hash
├── role (enum: admin/professional/customer)
└── is_active
```

### Migrations Aplicadas

1. ✅ `InitialSchema` - Estrutura base
2. ✅ `AddResourcesAndBookings` - Multi-módulo resources
3. ✅ `AddRecurrenceToBookings` - Agendamentos recorrentes
4. ✅ `AddIsActiveToResources` - Flag ativo/inativo
5. ✅ `MakeHourlyRateNullable` - Suporte recursos gratuitos
6. ✅ `CreateChatbotTables` - Tabelas do chatbot

**Total:** 6 migrations aplicadas

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=so_marcar

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Redis Cache/Queue
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI (Chatbot)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview

# WhatsApp (Evolution API)
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=your-evolution-api-key
WHATSAPP_INSTANCE_NAME=main

# Application
PORT=3000
NODE_ENV=development
TZ=America/Sao_Paulo

# Logging
LOG_LEVEL=debug
```

### Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    
  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
```

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov

# Watch mode
npm run test:watch
```

### Testes Implementados

**E2E:**
- ✅ Resources CRUD
- ✅ Appointments multi-module
- ✅ Resource bookings recurrence
- ⚠️ Auth (1/8 passing - problemas conhecidos)

**Unit:**
- ⚠️ Cobertura parcial (~30%)

---

## 📚 Documentação Adicional

- **API Swagger:** http://localhost:3000/api
- **Fase 4 Chatbot:** [FASE_4_CHATBOT.md](./FASE_4_CHATBOT.md)
- **TypeORM Migrations:** [src/database/migrations/](./src/database/migrations/)
- **Seeds:** [src/database/seeds/](./src/database/seeds/)

---

## 🚀 Roadmap

### Q1 2026
- ✅ Sistema base multi-módulo
- ✅ Chatbot com IA
- [ ] Integração WhatsApp completa
- [ ] Analytics avançados

### Q2 2026
- [ ] Frontend completo (React/Next.js)
- [ ] Pagamentos online
- [ ] Sistema de avaliações
- [ ] Multi-idioma

### Q3 2026
- [ ] App mobile (React Native)
- [ ] Programa de fidelidade
- [ ] Marketplace de serviços
- [ ] White-label

### Q4 2026
- [ ] IA para otimização de agenda
- [ ] Previsão de demanda
- [ ] Recomendação inteligente
- [ ] Expansão internacional

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Ver arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

- **Equipe Só Marcar** - *Desenvolvimento inicial*

---

## 📞 Suporte

- **Email:** suporte@somarcar.com.br
- **Documentação:** https://docs.somarcar.com.br
- **Issues:** https://github.com/somarcar/api/issues

---

## 🎯 Status do Projeto

**Versão:** 1.0.0-beta  
**Status:** 🟢 Em desenvolvimento ativo  
**Última atualização:** 13 de dezembro de 2025

### Progresso Geral

```
███████████████████░░░░░░░ 75% Completo

✅ Backend API: 85%
✅ Banco de Dados: 90%
✅ Chatbot IA: 100%
⚠️ Integrações: 40%
⚠️ Testes: 35%
❌ Frontend: 0%
```

---

## 🌟 Recursos Destacados

### 1. Chatbot Inteligente
Agendamento via linguagem natural usando GPT-4:
```
"Quero agendar um corte de cabelo para amanhã às 10h"
→ Bot entende, verifica disponibilidade e confirma automaticamente
```

### 2. Multi-Módulo Flexível
Suporta tanto serviços quanto aluguel de espaços no mesmo sistema:
```typescript
operation_mode: 'services' | 'spaces' | 'both'
```

### 3. Agendamentos Recorrentes
Reservas automáticas com padrões personalizáveis:
```typescript
recurrence: {
  pattern: 'weekly',
  interval: 1,
  endDate: '2026-12-31'
}
```

### 4. Analytics em Tempo Real
Métricas e relatórios detalhados para gestão do negócio.

---

**Desenvolvido com ❤️ usando NestJS + TypeScript**

## 📚 Estrutura do Projeto
***

## 🏗️ Arquitetura de Software
Stack Tecnológica
```
Backend:
├── NestJS (Framework principal)
├── TypeScript (Tipagem forte)
├── TypeORM (ORM para PostgreSQL)
├── Jest (Testes unitários e E2E)
├── Class Validator (Validação de DTOs)
└── Bull (Filas para jobs assíncronos)

Frontend (Dashboard do Estabelecimento):
├── React 18 + TypeScript
├── Vite (Build tool)
├── TanStack Query (React Query v5)
├── Zustand (State management leve)
├── TailwindCSS + Shadcn/ui (UI components)
└── Recharts (Gráficos de relatórios)

Frontend (Cliente Final):
├── React PWA (Progressive Web App)
├── Interface mobile-first simplificada
└── Sem necessidade de app store

Banco de Dados:
├── PostgreSQL (Dados relacionais)
└── Redis (Cache + Filas Bull)

Integrações:
├── WhatsApp Business API (Evolution API - self-hosted)
├── OpenAI API (GPT-4o-mini para chatbot)
├── Twilio (SMS de backup - opcional)
└── Mercado Pago / PagSeguro (Pagamentos antecipados)
```
***

## 🗄️ Modelagem de Dados (Principais Entidades)
Schema SQL Simplificado
```
-- Estabelecimento (Tenant)
CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- ex: barbearia-do-ze
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  logo_url VARCHAR(500),
  business_type VARCHAR(50), -- salon, barbershop, clinic, petshop
  plan_type VARCHAR(20) DEFAULT 'basic', -- basic, premium
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profissionais/Funcionários
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialties TEXT[], -- ['corte', 'barba', 'luzes']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Serviços Oferecidos
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Corte Masculino"
  description TEXT,
  duration_minutes INTEGER NOT NULL, -- 30, 45, 60
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL, -- Principal identificador
  email VARCHAR(255),
  notes TEXT, -- Observações (ex: alérgico a X)
  total_appointments INTEGER DEFAULT 0,
  cancelled_appointments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(establishment_id, phone)
);

-- Agendamentos (Core do sistema)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  
  scheduledDate DATE NOT NULL,
  scheduledTime TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  status VARCHAR(20) DEFAULT 'confirmed', 
    -- confirmed, cancelled, completed, no_show
  
  notes TEXT,
  
  -- Lembretes automáticos
  reminder_sent_at TIMESTAMP,
  reminder_confirmed BOOLEAN DEFAULT false,
  
  -- IA e Automação
  booking_source VARCHAR(20) DEFAULT 'manual', 
    -- manual, whatsapp_bot, web
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT no_overlap_check UNIQUE (
    professional_id, scheduledDate, scheduledTime
  )
);

-- Horários de Funcionamento
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Dom, 1=Seg, ..., 6=Sab
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Configurações de IA e Automação
CREATE TABLE ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
  
  -- Chatbot
  chatbot_enabled BOOLEAN DEFAULT true,
  chatbot_greeting TEXT DEFAULT 'Olá! Como posso ajudar você a agendar?',
  
  -- Lembretes
  reminder_hours_before INTEGER DEFAULT 24, -- 24h antes
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_message_template TEXT,
  
  -- Análises
  predict_no_show BOOLEAN DEFAULT false, -- Premium feature
  
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX idx_appointments_date ON appointments(scheduledDate);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_establishment ON appointments(establishment_id);
CREATE INDEX idx_customers_phone ON customers(phone);
```
***

## 🎯 Funcionalidades Principais
1. Dashboard Web (Dono do Estabelecimento)
Tela Principal:

Calendário semanal/diário com todos agendamentos
Drag & drop para reagendar
Filtros por profissional, serviço, status
Indicadores: taxa de ocupação, cancelamentos, receita do dia
Gestão de Agendamentos:

CRUD completo de agendamentos
Visualização de conflitos em tempo real
Bloqueio de horários (folga, almoço)
Histórico do cliente ao clicar
Clientes:

Lista com busca por nome/telefone
Histórico completo de agendamentos
Taxa de comparecimento individual
Notas e observações
Relatórios (IA):

Horários mais procurados (heatmap)
Taxa de no-show por dia/hora
Serviços mais vendidos
Previsão de faturamento semanal
Configurações:

Horários de funcionamento
Serviços e preços
Profissionais
Mensagens automáticas customizadas

2. Sistema de Agendamento via WhatsApp (IA)
Fluxo Conversacional com GPT-4:
```
// Exemplo de conversa real:
Cliente: "Oi, queria marcar um corte"
Bot: "Oi João! 😊 Que dia você prefere? Temos disponibilidade amanhã (07/12) ou sábado (09/12)"

Cliente: "Sábado de manhã"
Bot: "Perfeito! Tenho esses horários livres no sábado:
• 09:00
• 10:30
• 11:00
Qual prefere?"

Cliente: "9h"
Bot: "✅ Agendado!
📅 Sábado, 09/12 às 09:00
✂️ Corte Masculino (30min)
👨 Com Zé (barbeiro)
💰 R$ 35,00

Te mando um lembrete 1 dia antes! 👍"
```

  Implementação Técnica:
```
@Injectable()
export class WhatsAppChatbotService {
  constructor(
    private openAIService: OpenAIService,
    private appointmentService: AppointmentService,
    private availabilityService: AvailabilityService,
  ) {}

  async processMessage(
    message: string,
    customerPhone: string,
    establishmentId: string,
  ): Promise<string> {
    
    // 1. Buscar contexto do cliente e estabelecimento
    const context = await this.buildContext(customerPhone, establishmentId);
    
    // 2. Chamar GPT-4 com function calling
    const response = await this.openAIService.chat({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(context),
        },
        {
          role: 'user',
          content: message,
        },
      ],
      functions: [
        {
          name: 'check_availability',
          description: 'Verifica horários disponíveis em uma data',
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string', format: 'date' },
              serviceId: { type: 'string' },
            },
          },
        },
        {
          name: 'create_appointment',
          description: 'Cria um novo agendamento',
          parameters: {
            type: 'object',
            properties: {
              date: { type: 'string' },
              time: { type: 'string' },
              serviceId: { type: 'string' },
            },
            required: ['date', 'time', 'serviceId'],
          },
        },
      ],
    });

    // 3. Executar function call se necessário
    if (response.function_call) {
      return await this.handleFunctionCall(response.function_call, context);
    }

    return response.content;
  }

  private buildSystemPrompt(context: any): string {
    return `
Você é o assistente de agendamento da ${context.establishment.name}.
Você é amigável, eficiente e usa emojis moderadamente.

Informações do estabelecimento:
- Serviços: ${context.services.map(s => `${s.name} (${s.duration}min - R$${s.price})`).join(', ')}
- Horário: ${context.businessHours}
- Profissionais: ${context.professionals.map(p => p.name).join(', ')}

Cliente atual: ${context.customer?.name || 'Cliente novo'}
Histórico: ${context.customer?.totalAppointments || 0} agendamentos anteriores

Sua missão:
1. Entender o que o cliente quer (novo agendamento, remarcar, cancelar)
2. Sugerir datas e horários disponíveis
3. Confirmar o agendamento com todos os detalhes
4. Ser educado se não houver disponibilidade

Use as funções disponíveis para verificar disponibilidade e criar agendamentos.
    `;
  }
}
```
***

3. Sistema de Lembretes Automáticos
Implementação com Bull Queue:
```
// src/modules/appointments/jobs/reminder.processor.ts

@Processor('appointment-reminders')
export class ReminderProcessor {
  
  @Process('send-reminder')
  async handleReminder(job: Job<{ appointmentId: string }>) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: job.data.appointmentId },
      relations: ['customer', 'service', 'establishment'],
    });

    if (!appointment || appointment.status !== 'confirmed') {
      return; // Não enviar se cancelado
    }

    // Gerar mensagem personalizada com IA
    const message = await this.generateReminderMessage(appointment);

    // Enviar via WhatsApp
    await this.whatsappService.sendMessage(
      appointment.customer.phone,
      message,
    );

    // Atualizar registro
    await this.appointmentRepository.update(appointment.id, {
      reminderSentAt: new Date(),
    });
  }

  private async generateReminderMessage(appointment: Appointment): Promise<string> {
    const prompt = `
Gere um lembrete amigável e profissional para um cliente com os seguintes detalhes:
- Cliente: ${appointment.customer.name}
- Serviço: ${appointment.service.name}
- Data: ${format(appointment.scheduledDate, 'dd/MM/yyyy', { locale: ptBR })}
- Horário: ${appointment.scheduledTime}
- Estabelecimento: ${appointment.establishment.name}

A mensagem deve:
- Ser curta (máximo 3 linhas)
- Usar 1-2 emojis relevantes
- Pedir confirmação no final
- Tom amigável mas profissional
    `;

    const response = await this.openAIService.chat({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return response.content + '\n\nResponda "SIM" para confirmar ou "REMARCAR" se precisar mudar.';
  }
}

// Agendar lembretes ao criar appointment
@Injectable()
export class AppointmentService {
  
  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentRepository.save(createDto);
    
    // Agendar lembrete para 24h antes
    const reminderDate = subHours(
      new Date(`${appointment.scheduledDate} ${appointment.scheduledTime}`),
      24,
    );

    await this.reminderQueue.add(
      'send-reminder',
      { appointmentId: appointment.id },
      { delay: reminderDate.getTime() - Date.now() },
    );

    return appointment;
  }
}
```

4. Funcionalidades de IA Premium
A. Previsão de No-Show (Clientes que não comparecem):
```
// Análise simples baseada em padrões
interface NoShowPrediction {
  appointmentId: string;
  riskScore: number; // 0-100
  reasons: string[];
}

async predictNoShow(appointmentId: string): Promise<NoShowPrediction> {
  const appointment = await this.getAppointmentWithHistory(appointmentId);
  
  let riskScore = 0;
  const reasons: string[] = [];

  // Cliente novo (sem histórico)
  if (appointment.customer.totalAppointments === 0) {
    riskScore += 30;
    reasons.push('Cliente novo');
  }

  // Taxa de cancelamento alta
  const cancelRate = appointment.customer.cancelledAppointments / 
                     appointment.customer.totalAppointments;
  if (cancelRate > 0.3) {
    riskScore += 40;
    reasons.push(`${(cancelRate * 100).toFixed(0)}% de cancelamentos`);
  }

  // Agendamento feito com muita antecedência
  const daysUntil = differenceInDays(appointment.scheduledDate, new Date());
  if (daysUntil > 14) {
    riskScore += 15;
    reasons.push('Agendado com muita antecedência');
  }

  // Horário historicamente problemático
  const hour = parseInt(appointment.scheduledTime.split(':')[0]);
  if (hour < 9 || hour > 18) {
    riskScore += 10;
    reasons.push('Horário com maior taxa de falta');
  }

  return { appointmentId, riskScore, reasons };
}
```

B. Sugestões de Horários Ótimos:
```
// Analisar histórico e sugerir melhores horários
async suggestOptimalSlots(
  establishmentId: string,
  date: Date,
): Promise<TimeSlot[]> {
  
  // Buscar dados históricos
  const historicalData = await this.appointmentRepository
    .createQueryBuilder('a')
    .select('EXTRACT(HOUR FROM a.scheduledTime) as hour')
    .addSelect('COUNT(*) as total')
    .addSelect('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed')
    .where('a.establishment_id = :establishmentId', { establishmentId })
    .andWhere('a.scheduledDate >= :from', { from: subMonths(new Date(), 3) })
    .groupBy('hour')
    .getRawMany();

  // Calcular score para cada horário
  const slots = await this.availabilityService.getAvailableSlots(establishmentId, date);
  
  return slots.map(slot => ({
    ...slot,
    score: this.calculateSlotScore(slot, historicalData),
    recommendation: this.getRecommendationLabel(score),
  })).sort((a, b) => b.score - a.score);
}

```
***

## 🚀 Deploy e Infraestrutura
Opção 1: Railway (Recomendado para início)
```
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run start:prod"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "api"
source = "."

[[services]]
name = "postgres"
source = "postgres:15"

[[services]]
name = "redis"
source = "redis:7"
```
Custo estimado: $5-10/mês (início) → $20-30/mês (20-30 clientes)


Opção 2: VPS (Contabo/Hetzner) - Escala
```
# Docker Compose para produção
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/agendafacil
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=agendafacil
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=secure_password

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
  redis_data:
```
Custo: €4-8/mês VPS (suporta 50-100 estabelecimentos)
***

### 💰 Estrutura de Custos e Precificação
Custos Operacionais (por estabelecimento/mês):
```
WhatsApp (Evolution API self-hosted): R$ 0
  └─ Alternativa: Twilio ~R$ 0,20/msg (média 60 msgs/mês = R$ 12)

OpenAI API (GPT-4o-mini):
  └─ Agendamentos: ~200 conversas/mês × R$ 0,15 = R$ 30
  └─ Lembretes: ~150 msgs/mês × R$ 0,05 = R$ 7,50
  └─ TOTAL: R$ 37,50/mês/estabelecimento

Hospedagem (Railway/VPS rateado):
  └─ 10 clientes: R$ 3/mês cada
  └─ 30 clientes: R$ 1/mês cada

SMS (opcional backup): R$ 5-10/mês

TOTAL por cliente: R$ 40-50/mês
```

Precificação Sugerida:
```
Plano Básico: R$ 79/mês
├─ Até 200 agendamentos/mês
├─ Agendamento via WhatsApp (IA)
├─ Lembretes automáticos
├─ Dashboard web
├─ 1 profissional
└─ Margem: ~45% (R$ 35/mês)

Plano Premium: R$ 129/mês
├─ Agendamentos ilimitados
├─ Até 3 profissionais
├─ Relatórios com IA
├─ Previsão de no-show
├─ API para integrações
└─ Margem: ~60% (R$ 79/mês)

Setup Inicial: R$ 249
├─ Configuração completa
├─ Cadastro de serviços
├─ Treinamento (1h remoto)
├─ Importação de clientes
└─ Margem: 100% (4-6h trabalho)
```

Meta Realista:

Mês 3: 5 clientes = R395 + R 1.245 (setup) = R$ 1.640
Mês 6: 15 clientes = R$ 1.185/mês recorrente
Mês 12: 30 clientes = R2.370/mes − R 1.500 custos = R$ 2.000+ líquido

***

### 📊 MVP - Roadmap de Desenvolvimento
Semana 1-2: Core Backend
 Setup NestJS + TypeORM + PostgreSQL
 Entities e migrations (establishments, appointments, customers)
 CRUD APIs de agendamentos
 Sistema de autenticação (JWT)
 Validação de conflitos de horário
Semana 3: Frontend Dashboard
 Setup React + Vite + TailwindCSS
 Tela de login
 Calendário de agendamentos (FullCalendar)
 CRUD manual de agendamentos
 Lista de clientes
Semana 4: Integração WhatsApp + IA
 Integração Evolution API (ou Baileys)
 OpenAI Service (GPT-4 function calling)
 Chatbot conversacional básico
 Testes de fluxo completo
Semana 5: Automações
 Bull Queue setup
 Sistema de lembretes (24h antes)
 Confirmação de presença via WhatsApp
 Logs e monitoramento
Semana 6: Polish + Deploy
 Frontend responsivo
 Testes E2E (Playwright)
 Deploy Railway + domínio
 Documentação para cliente
Total: 6 semanas part-time (~15h/semana) = 90h

***

### 🎯 Diferenciais Competitivos
Preço acessível para pequenos negócios (concorrentes cobram R$ 150-300/mês)
IA nativa (não é add-on, está no core do produto)
WhatsApp first (onde o cliente já está, sem app para baixar)
Setup simples (você faz remotamente em 1h)
Suporte local/personalizado (você conhece a realidade do bairro)
***

### 📈 Estratégia de Vendas
Fase 1: Validação (Mês 1-2)
Desenvolver MVP funcional
Oferecer GRÁTIS por 3 meses para 3 estabelecimentos diferentes:
1 barbearia
1 salão de beleza
1 clínica de estética
Coletar feedback e ajustar
Fase 2: Early Adopters (Mês 3-4)
Documentar resultados dos 3 pilotos (ex: "Reduziu faltas em 40%")
Oferecer 50% OFF vitalício para próximos 10 clientes
Vender porta a porta no seu bairro
Fase 3: Crescimento (Mês 5+)
Preço cheio (R$ 79-129/mês)
Sistema de indicação (cliente indica, ganha 1 mês grátis)
Parcerias com associações comerciais locais
***

### 🛠️ Código Inicial - Estrutura do Projeto
Quer que eu gere a estrutura inicial do projeto com:

Setup NestJS completo
Entities TypeORM
Módulos principais
Docker Compose para desenvolvimento
Scripts de migration
É só confirmar que eu crio tudo no workspace!
***

### Faltam implementar (próximas sessões):

✅ Migrations - Scripts de criação das tabelas
✅ Integração WhatsApp - Evolution API + Chatbot GPT-4
✅ Sistema de Lembretes - Bull Queue + OpenAI
⏭️ Frontend Dashboard - React + TypeScript
⏭️ PWA Cliente - Interface para clientes agendarem
⏭️ Analytics e Relatórios - Previsão de no-show, horários ótimos
*** 

### 💰 Modelo de Negócio (Recap)
Plano Básico: R$ 79/mês
Plano Premium: R$ 129/mês
Setup: R$ 249 (uma vez)
Meta 6 meses: 15 clientes = R$ 1.185/mês recorrente
***

### Quer que eu continue implementando alguma parte específica agora? Sugestões:
Criar as migrations do TypeORM
Implementar autenticação JWT
Adicionar seeds com dados de exemplo
Iniciar integração WhatsApp/IA
***

### PostgreSQL Database: so_marcar_db
```
├── establishments (estabelecimentos)
│   ├── id (uuid)
│   ├── name, slug, phone, email
│   ├── businessType (salon/barbershop/clinic/petshop)
│   └── planType (basic/premium)
│
├── professionals (profissionais)
│   ├── id (uuid)
│   ├── establishmentId (FK)
│   ├── name
│   └── specialties (array)
│
├── services (serviços)
│   ├── id (uuid)
│   ├── establishmentId (FK)
│   ├── name, description
│   ├── durationMinutes
│   └── price (decimal)
│
├── customers (clientes)
│   ├── id (uuid)
│   ├── establishmentId (FK)
│   ├── name, phone, email
│   ├── totalAppointments
│   └── cancelledAppointments
│
└── appointments (agendamentos)
    ├── id (uuid)
    ├── establishmentId, customerId, professionalId, serviceId (FKs)
    ├── scheduledDate, scheduledTime
    ├── status (confirmed/cancelled/completed/no_show)
    ├── bookingSource (manual/whatsapp_bot/web)
    └── reminderSentAt, reminderConfirmed
```
***
### ✅ Fase 1 - MVP Backend: 100% COMPLETO
 Estrutura NestJS
 Entities TypeORM
 Migrations
 Seeds
 CRUD completo
 Validações
 Documentação Swagger
 Docker setup
 Autenticação JWT
 Integração WhatsApp + ChatBot GPT-4
 Sistema de Lembretes Automáticos
 Frontend React + Dashboard
 ✅ Analytics e Previsão de No-Show

### ⏭️ Próximas Fases:
⏭️ PWA para Clientes
⏭️ Sistema de Pagamentos
 ***
 ### Credenciais de teste:
Email: jose@barbearia.com
Senha: senha123
Role: OWNER (Dono da Barbearia do Zé)