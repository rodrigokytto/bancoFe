#!/usr/bin/env bash
# ==============================================================================
# SCRIPT INSTITUCIONAL DE DEPLOY EM PRODUÇÃO (PRD) — GOOGLE CLOUD PLATFORM (GCP)
# Plataforma Oficial BancoFé (rodrigokytto/bancoFe)
# Conta Autorizada: rodrigo.goncalves@kytto.com.br
# Projeto Alvo: bancofe-plataforma-kytto (Organização kytto.com.br)
# Região: southamerica-east1 (São Paulo / Baixa Latência Brasil)
# Serviço Cloud Run: erp-bancofe
# Domínios: bancofe.kytto.com.br / bancofe.com.br
# ==============================================================================

set -euo pipefail

ACCOUNT="${GCP_ACCOUNT:-rodrigo.goncalves@kytto.com.br}"
PROJECT_ID="${1:-${GCP_PROJECT_ID:-bancofe-plataforma-kytto}}"
REGION="${GCP_REGION:-southamerica-east1}"
SERVICE_NAME="${GCP_SERVICE_NAME:-erp-bancofe}"
AR_REPO="${GCP_AR_REPO:-bancofe-repo}"
CUSTOM_DOMAIN="bancofe.kytto.com.br"

echo "========================================================================"
echo "🏦 [BANCOFÉ PRD] Iniciando Deploy no Google Cloud Platform (Cloud Run)"
echo "👤 Conta GCP:     ${ACCOUNT}"
echo "📁 Projeto Alvo:  ${PROJECT_ID}"
echo "🌎 Região:        ${REGION} (São Paulo, Brasil)"
echo "🚀 Serviço:       ${SERVICE_NAME}"
echo "========================================================================"

# 1. Verificar instalação do gcloud CLI
if ! command -v gcloud >/dev/null 2>&1; then
  echo "⚠️ Google Cloud SDK (gcloud) não encontrado no PATH."
  echo "👉 Instalando Google Cloud CLI..."
  curl -sSL https://sdk.cloud.google.com | bash --disable-prompts --install-dir=/home/ubuntu
  export PATH="/home/ubuntu/google-cloud-sdk/bin:$PATH"
fi

# 2. Autenticação na conta oficial
echo "▶ [1/6] Verificando autenticação no Google Cloud..."
CURRENT_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || true)

if [ -z "$CURRENT_ACCOUNT" ] || [ "$CURRENT_ACCOUNT" != "$ACCOUNT" ]; then
  if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "🔑 Autenticando via Service Account Key ($GOOGLE_APPLICATION_CREDENTIALS)..."
    gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
  elif [ -n "${GCP_SA_KEY:-}" ]; then
    echo "🔑 Autenticando via variável de ambiente GCP_SA_KEY..."
    echo "$GCP_SA_KEY" > /tmp/gcp_sa_key.json
    gcloud auth activate-service-account --key-file=/tmp/gcp_sa_key.json
    rm -f /tmp/gcp_sa_key.json
  else
    echo "👉 Iniciando login para a conta institucional [${ACCOUNT}]..."
    gcloud auth login "${ACCOUNT}" --brief || gcloud auth login --no-browser
  fi
fi

gcloud config set account "${ACCOUNT}" 2>/dev/null || true

# 3. Validar ou Selecionar o Projeto GCP
echo "▶ [2/6] Configurando projeto GCP [${PROJECT_ID}]..."
gcloud config set project "${PROJECT_ID}"
echo "✅ Projeto ativo: ${PROJECT_ID}"

# 4. Habilitar APIs necessárias do Google Cloud
echo "▶ [3/6] Habilitando APIs essenciais no projeto..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  domains.googleapis.com 2>/dev/null || true

# 5. Criar repositório no Artifact Registry se não existir
echo "▶ [4/6] Configurando repositório no Artifact Registry (${REGION})..."
gcloud artifacts repositories create "${AR_REPO}" \
  --repository-format=docker \
  --location="${REGION}" \
  --description="Repositório Docker BancoFé Produção" 2>/dev/null || true

IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}:latest"

# 6. Compilar e Enviar Imagem Docker via Cloud Build
echo "▶ [5/6] Construindo e enviando container via Google Cloud Build..."
gcloud builds submit --tag "${IMAGE_TAG}" .

# 7. Executar o Deploy no Cloud Run com Probes e Zero-Downtime
echo "▶ [6/6] Realizando deploy no Cloud Run (${REGION})..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_TAG}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --concurrency 80 \
  --timeout 300 \
  --startup-probe-path=/healthz \
  --liveness-probe-path=/healthz \
  --set-env-vars NODE_ENV=production,PORT=3000,TZ=America/Sao_Paulo

# 8. Mapeamento de Domínio e Status Final
echo "🌐 Configurando mapeamento de domínio para ${CUSTOM_DOMAIN}..."
gcloud beta run domain-mappings create \
  --service "${SERVICE_NAME}" \
  --domain "${CUSTOM_DOMAIN}" \
  --region "${REGION}" 2>/dev/null || echo "ℹ️ Mapeamento já existente ou gerenciado no Google Cloud Domains."

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format="value(status.url)" 2>/dev/null || echo "https://erp-bancofe-5xsi5uyoda-rj.a.run.app")

echo "========================================================================"
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO EM PRODUÇÃO (GCP)!"
echo "👤 Conta:            ${ACCOUNT}"
echo "📁 Projeto:          ${PROJECT_ID}"
echo "🌐 URL Cloud Run:    ${SERVICE_URL}"
echo "🔗 Domínio Oficial:  https://${CUSTOM_DOMAIN}"
echo "📊 Cockpit / Admin:  ${SERVICE_URL}/admin"
echo "🔍 Consulta 360:     ${SERVICE_URL}/plataforma/consulta-cpf"
echo "📋 Pré-Cadastro:     ${SERVICE_URL}/plataforma/precadastro"
echo "🎯 Radar Preditivo:  ${SERVICE_URL}/plataforma/clientes-potenciais"
echo "🔐 Credenciais:      Admin / #080581Verdao"
echo "========================================================================"
