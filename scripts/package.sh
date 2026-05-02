#!/usr/bin/env bash
# Gera o ZIP final pra envio ao processoseletivo@loomi.com.br.
# Exclui node_modules, reports, .env, secrets, artefatos pesados.
set -euo pipefail

OUTPUT="loomi-qa-challenge-filipe-gabriel.zip"

echo "🧹 1. Limpando artefatos transitórios..."
rm -rf node_modules mcp-server/node_modules
rm -rf reports/ allure-results/ allure-report/ allure-history/
rm -rf playwright-report/ test-results/
rm -rf mcp-server/dist mcp-server/data
rm -rf */dist */build .nyc_output

echo "🔒 2. Verificando que credenciais NÃO vão no ZIP..."
if [ -f .env ]; then
  echo "❌ .env existe localmente. Removendo do ZIP via -x"
fi
if [ -f .env.local ]; then
  echo "ℹ️  .env.local existe localmente (gitignored). Será excluído do ZIP."
fi

echo "📊 3. Arquivos >5MB que vão entrar no ZIP (audit):"
find . -size +5M \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./allure-history/*" \
  -not -path "./mcp-server/node_modules/*" \
  2>/dev/null || echo "   (nenhum)"

echo "📦 4. Empacotando..."
rm -f "$OUTPUT"
zip -rq "$OUTPUT" . \
  -x ".git/*" \
  -x "node_modules/*" \
  -x "*/node_modules/*" \
  -x "reports/*" \
  -x "allure-results/*" \
  -x "allure-report/*" \
  -x "allure-history/*" \
  -x "playwright-report/*" \
  -x "test-results/*" \
  -x ".env" \
  -x ".env.local" \
  -x ".auth-state.json" \
  -x "*.log" \
  -x "mcp-server/dist/*" \
  -x "mcp-server/data/*" \
  -x ".DS_Store" \
  -x "*/.DS_Store"

echo "🔍 5. Sanity check do conteúdo..."
FORBIDDEN=$(unzip -l "$OUTPUT" | grep -E "(^|\s)\.env(\s|$)|\.env\.local|\.auth-state\.json|node_modules" || true)
if [ -n "$FORBIDDEN" ]; then
  echo "❌ ZIP contém arquivo proibido!"
  echo "$FORBIDDEN" | head -5
  exit 1
fi

SIZE=$(du -h "$OUTPUT" | cut -f1)
COUNT=$(unzip -l "$OUTPUT" | tail -1 | awk '{print $2}')

echo ""
echo "✅ ZIP pronto: $OUTPUT ($SIZE, $COUNT arquivos)"
echo "📍 Path absoluto: $(pwd)/$OUTPUT"
echo ""
echo "Próximo: enviar por e-mail para processoseletivo@loomi.com.br"
echo "Assunto sugerido: Desafio QA Abril 26 — Filipe Gabriel"
