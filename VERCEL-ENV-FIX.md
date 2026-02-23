# 🚨 Fix: Configurar Variáveis de Ambiente na Vercel

## Problema
O frontend em produção está tentando conectar em `localhost:3300` em vez do backend de produção.

## Causa
As variáveis de ambiente `VITE_API_URL` e `VITE_WS_URL` não foram configuradas na Vercel.

---

## ✅ Solução: Configurar na Vercel

### Método 1: Via Dashboard (Recomendado)

1. **Acesse seu projeto na Vercel:**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione o projeto `so-marcar-frontend`

2. **Abra as configurações:**
   - Clique em **Settings** (no topo)
   - No menu lateral, clique em **Environment Variables**

3. **Adicione as variáveis:**

   **Variável 1:**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://so-marcar-api.onrender.com/api/v1`
   - **Environments:** Marque todas (Production, Preview, Development)
   - Clique em **Save**

   **Variável 2:**
   - **Name:** `VITE_WS_URL`
   - **Value:** `https://so-marcar-api.onrender.com`
   - **Environments:** Marque todas (Production, Preview, Development)
   - Clique em **Save**

4. **Faça redeploy:**
   - Vá para **Deployments**
   - No último deployment, clique nos **3 pontinhos (...)** → **Redeploy**
   - Marque a opção **"Use existing Build Cache"** como **OFF** (importante!)
   - Clique em **Redeploy**

---

### Método 2: Via CLI (Alternativo)

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Adicionar variáveis
vercel env add VITE_API_URL production
# Quando pedir, cole: https://so-marcar-api.onrender.com/api/v1

vercel env add VITE_WS_URL production
# Quando pedir, cole: https://so-marcar-api.onrender.com

# Fazer redeploy
vercel --prod --force
```

---

## 🔍 Verificar se Funcionou

Após o redeploy completar:

1. **Abra o frontend em produção**
2. **Abra DevTools (F12)** → **Console**
3. **Tente fazer login**
4. **Verifique a requisição:**
   - Deve ir para `https://so-marcar-api.onrender.com/api/v1/auth/login`
   - NÃO deve mais ir para `localhost:3300`

---

## 🐛 Troubleshooting

### Problema: Ainda usa localhost após redeploy

**Solução:**
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Faça hard refresh (Ctrl+F5)
- Acesse em aba anônima/privada

### Problema: Variáveis não aparecem no build log

**Verifique:**
```bash
# No log do build da Vercel, deve aparecer:
Build Command: npm run build
Environment Variables:
  VITE_API_URL=https://so-marcar-api.onrender.com/api/v1
  VITE_WS_URL=https://so-marcar-api.onrender.com
```

### Problema: CORS error após correção

**Verifique no backend (Render.com):**
```typescript
// O backend precisa permitir o domínio da Vercel
app.enableCors({
  origin: [
    'https://so-marcar.vercel.app',
    'https://somarcar.vercel.app',
    // Adicionar seu domínio custom se tiver
  ],
  credentials: true,
});
```

---

## 📝 Variáveis Necessárias

| Variável | Valor Produção | Descrição |
|----------|---------------|-----------|
| `VITE_API_URL` | `https://so-marcar-api.onrender.com/api/v1` | URL da API REST |
| `VITE_WS_URL` | `https://so-marcar-api.onrender.com` | URL do WebSocket |

---

## ⚡ Quick Fix (Copy-Paste)

**Para adicionar rapidamente via Vercel CLI:**

```bash
vercel env add VITE_API_URL production <<< 'https://so-marcar-api.onrender.com/api/v1'
vercel env add VITE_WS_URL production <<< 'https://so-marcar-api.onrender.com'
vercel env add VITE_API_URL preview <<< 'https://so-marcar-api.onrender.com/api/v1'
vercel env add VITE_WS_URL preview <<< 'https://so-marcar-api.onrender.com'
vercel --prod --force
```

---

## 🎯 Resultado Esperado

Após configurar corretamente:

✅ Login funciona em produção
✅ Todas as requisições vão para `https://so-marcar-api.onrender.com`
✅ WebSocket conecta em `wss://so-marcar-api.onrender.com`
✅ Console não mostra erros `ERR_BLOCKED_BY_CLIENT`

---

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do deployment na Vercel
2. Verifique se o backend na Render está rodando
3. Teste a API diretamente: `curl https://so-marcar-api.onrender.com/api/v1/health`
