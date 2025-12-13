Autenticação & Sessão

Token/expiração: fluxo robusto de expiração/refresh; preservar sessão no reload; interceptores 401 já existem, mas adicionar guarda/loader de rota para evitar flicker.
Perfis/roles: suportar owner/admin/staff no UI (menus/ações condicionais).
Perfil do usuário: página “Minha Conta” (ver/editar nome/telefone, alterar senha) usando /auth/profile e /auth/change-password.
Agendamentos (Core)

CRUD completo: criar/editar/cancelar com validação contra regras de conflito do backend; faltam formulários e APIs de create/update/delete.
Filtros: por profissional, serviço, status, intervalo de datas; adicionar controles no UI e query params na API.
Calendário: visão semanal/diária com drag & drop para remarcar; integrar FullCalendar e acionar PATCH com validação de conflito.
Status: ações rápidas (confirmar, concluir, cancelar, no_show) com feedback imediato e atualizações otimistas.
Bloqueios: UI para bloquear horários (folga, almoço) por profissional; refletem nos slots (endpoints conforme backend).
Clientes

Lista + busca: por nome/telefone, paginação.
Detalhe: histórico de agendamentos, taxa de comparecimento, notas; permitir edição de notas.
CRUD: criar/editar cliente com validações.
Serviços

Gestão: listar/criar/editar (nome, descrição, duração, preço); normalizar price como número.
Integração: usar serviço na criação de agendamento com duração influenciando geração de slots.
Profissionais

Gestão: listar/criar/editar (nome, especialidades, ativo).
Filtros: integrar com filtros do dashboard e recursos do calendário.
Horários de Funcionamento

Configuração: grade semanal (abrir/fechar, ativo) por dia.
Validação: respeitar horários nos formulários de agendamento; desabilitar slots fora do horário.
Analytics & Relatórios

KPIs: taxa de ocupação, cancelamentos, receita do dia/semana; já há receita do dia — adicionar ocupação/cancelamentos.
Gráficos: heatmap de horários, serviços mais vendidos, tendência de no-show (Recharts).
Predição: exibir badge/tooltip com “risco de no-show” por agendamento (placeholder para endpoint).
WhatsApp/IA

Lembretes: mostrar status (sentAt, confirmed) por agendamento.
Chatbot: página “Automação” para habilitar/desabilitar, saudação e templates (mapeando ai_settings).
Confirmações: refletir confirmação de lembrete no UI quando backend atualiza flag.
Tenant/Estabelecimento

Contexto: garantir escopo por establishmentId em todas as páginas; seleção de estabelecimento para multi-tenant (role owner).
Configurações: dados do estabelecimento, logo, plano; persistir via endpoints.
PWA (Cliente Final)

Não obrigatório para o dashboard agora; planejar PWA simples para agendar — app/rota separada.
Base Técnica

CORS: Vite em 5173 com strictPort; backend deve permitir origem 5173.
Tailwind v4: usar @plugin para plugins e evitar @apply conflitantes; garantir tokens de tema (ex.: text-muted-foreground) com variáveis CSS mínimas.
Biblioteca UI: componentes shadcn locais; expandir com DropdownMenu, Avatar, Badge, Dialog, Tabs, Select.
Camada API: completar endpoints para appointments/services/customers/professionals/business-hours/ai-settings; tipos TS alinhados ao Swagger.
Próximos Passos Concretos

Diálogo de Criar/Editar Agendamento: Dialog + Select (serviço/profissional), date/time picker, duração automática; ligar em POST/PATCH.
Calendário: FullCalendar com recursos (profissionais) e drag & drop acionando PATCH.
Páginas de Clientes/Serviços/Profissionais: lista + diálogos de formulário; paginação e busca.
Horários de Funcionamento: editor semanal integrado ao backend.
Automação (AI Settings): alternar chatbot, horas do lembrete, template de mensagem.
Analytics: 3 gráficos e 4 KPIs com queries dedicadas.