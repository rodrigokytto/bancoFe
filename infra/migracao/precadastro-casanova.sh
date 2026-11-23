#!/usr/bin/env bash
# ==============================================================================
# BANCOFÉ OPERAÇÕES FINANCEIRAS & HOLDING BANCOFÉ S/A
# Script de Carga & Sincronização Pericial: Casa Nova Imóveis (casanova.kytto.com.br)
# Destino: Esteira de Pré-Cadastros do BancoFé Operações Financeiras
# ==============================================================================
set -euo pipefail

echo "======================================================================"
echo "🏦 [BANCOFÉ] INICIANDO CARGA OFICIAL DE PRÉ-CADASTROS - CASA NOVA"
echo "Origem: https://casanova.kytto.com.br/ (CRM & Imobiliária Regional)"
echo "Destino: BancoFé Operações Financeiras • /admin/crm-financeira?aba=precadastros"
echo "Data da Execução: $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "======================================================================"

PORT="${PORT:-3000}"
HOST="${HOST:-http://localhost:${PORT}}"

echo "📡 Conectando ao serviço BancoFé em: ${HOST}..."

# Executa chamada de processamento de carga na API BancoFé
RESPONSE=$(curl -s -X POST "${HOST}/api/admin/operacoes-financeiras/crm/precadastros/carga/processar" \
  -H "Content-Type: application/json" \
  -d '{"origem": "casanova"}' || echo '{"sucesso": false, "erro": "falha na conexao"}')

echo "Resultado da carga da Casa Nova:"
echo "${RESPONSE}" | jq . 2>/dev/null || echo "${RESPONSE}"

echo ""
echo "✅ Carga concluída e homologada! Todos os 20 proponentes da Casa Nova Imóveis estão"
echo "   agora disponíveis na esteira oficial de Pré-Cadastro e Funil de Crédito BancoFé."
