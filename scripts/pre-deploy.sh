#!/bin/bash

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# 1. Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci

# 3. Type check
echo "🔍 Type checking..."
npm run build -- --mode development || {
  echo "❌ TypeScript errors found"
  exit 1
}

# 4. Lint
echo "🧹 Linting..."
npm run lint || {
  echo "⚠️ Linting errors found (continuing...)"
}

# 5. Build
echo "🏗️ Building..."
npm run build || {
  echo "❌ Build failed"
  exit 1
}

# 6. Check bundle size
echo "📊 Checking bundle size..."
BUNDLE_SIZE=$(du -sm dist | cut -f1)
if [ "$BUNDLE_SIZE" -gt 5 ]; then
  echo "⚠️ Bundle size is ${BUNDLE_SIZE}MB (target: < 5MB)"
fi

# 7. Test production build locally
echo "🧪 Testing production build..."
npm run preview &
PREVIEW_PID=$!
sleep 3

# Simple health check
curl -f http://localhost:4173 > /dev/null 2>&1 || {
  echo "❌ Preview server failed"
  kill $PREVIEW_PID 2>/dev/null
  exit 1
}

kill $PREVIEW_PID 2>/dev/null

echo "✅ All checks passed! Ready to deploy."
