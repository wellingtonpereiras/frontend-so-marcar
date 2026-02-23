# 🗓️ só marcar - Frontend

Sistema de agendamentos e gestão para estabelecimentos. Frontend moderno construído com React, Vite e TypeScript.

[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/typescript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19.2-61dafb)](https://reactjs.org/)

## ✨ Features

- 📅 **Agendamentos**: Gerenciar appointments e reservas de recursos
- 👥 **Multi-tenant**: Suporte a múltiplos estabelecimentos
- ⚡ **Tempo Real**: WebSocket para atualizações instantâneas
- 📊 **Dashboard**: Métricas e analytics visuais
- 👨‍💼 **Admin Panel**: Gestão completa de estabelecimentos
- 🌙 **Dark Mode**: Tema escuro suportado
- 📱 **PWA Ready**: Progressive Web App
- 🔒 **Seguro**: Autenticação JWT, headers de segurança

## 🚀 Quick Start

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/so-marcar-frontend.git
cd so-marcar-frontend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar dev server
npm run dev

# Abrir http://localhost:5173
```

## 📋 Tech Stack

### Core
- **React 19** - UI library
- **Vite 7** - Build tool & dev server
- **TypeScript 5.9** - Type safety
- **TailwindCSS 4** - Styling

### State Management
- **TanStack Query v5** - Server state
- **Zustand** - Client state (auth)

### UI Components
- **Shadcn/UI** - Component library
- **Lucide React** - Icons
- **Recharts** - Charts & graphs
- **react-hot-toast** - Notifications

### Real-time
- **Socket.IO Client** - WebSocket connections

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia dev server (porta 5173)

# Build
npm run build            # Build para produção
npm run build:analyze    # Build com bundle analyzer

# Quality
npm run lint             # ESLint

# Preview
npm run preview          # Preview do build local

# Deploy
npm run pre-deploy       # Checks pré-deploy
npm run check-size       # Verifica bundle size
```

## 🌐 Variáveis de Ambiente

```env
# API Backend
VITE_API_URL=https://so-marcar-api.onrender.com/api/v1

# WebSocket
VITE_WS_URL=https://so-marcar-api.onrender.com
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel --prod
```

Ver [DEPLOY.md](DEPLOY.md) para guia completo.

## 📚 Documentação

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Arquitetura & Infraestrutura
- [DEPLOY.md](DEPLOY.md) - Guia de deploy
- [MONITORING.md](docs/MONITORING.md) - Observabilidade
- [PERFORMANCE.md](docs/PERFORMANCE.md) - Otimizações
- [SECURITY.md](docs/SECURITY.md) - Segurança

## 📊 Performance

- **LCP**: < 2.5s ✅
- **FID**: < 100ms ✅
- **CLS**: < 0.1 ✅
- **Bundle Size**: < 500KB ✅

## 📄 License

MIT License

---

Made with ❤️ by só marcar team


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

