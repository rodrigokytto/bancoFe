#!/usr/bin/env bash
# ==============================================================================
# Deploy Automatizado do Zuma Pilot no Google Cloud Platform (Cloud Run)
# Conta: rodrigo.goncalves@kytto.com.br
# Projeto GCP: zuma (ID: zuma-kytto ou zuma)
# Região: southamerica-east1 (São Paulo / Baixa latência Brasil)
# Domínio Alvo: zuma.kytto.com.br
# ==============================================================================
set -euo pipefail

ACCOUNT="${GCP_ACCOUNT:-rodrigo.goncalves@kytto.com.br}"
PROJECT_ID="${GCP_PROJECT_ID:-zuma-kytto}"
PROJECT_NAME="bancofe"
REGION="${GCP_REGION:-southamerica-east1}"
SERVICE_NAME="${GCP_SERVICE_NAME:-erp-bancofe}"
CUSTOM_DOMAIN="bancofe.kytto.com.br"
AR_REPO="zuma-repo"

echo "=========================================================="
echo "   Iniciando Deploy do Zuma Pilot no Google Cloud (GCP)   "
echo "   Conta: ${ACCOUNT} | Projeto: ${PROJECT_ID}             "
echo "   Região: ${REGION} | Serviço: ${SERVICE_NAME}           "
echo "=========================================================="

# 1. Verificar autenticação gcloud
CURRENT_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null || true)
if [ -z "$CURRENT_ACCOUNT" ]; then
    if [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ] && [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo "🔑 Autenticando com Service Account Key..."
        gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"
    else
        echo "⚠️ Nenhuma conta ativa no gcloud. Iniciando login para $ACCOUNT..."
        gcloud auth login "$ACCOUNT" --brief || gcloud auth login --no-browser
    fi
else
    echo "✅ Conta ativa identificada: $CURRENT_ACCOUNT"
fi

# 2. Criar ou selecionar o Projeto no GCP
echo "📁 Verificando projeto '$PROJECT_ID' no GCP..."
if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
    echo "Tentando criar ou verificar projeto '$PROJECT_NAME' (ID: $PROJECT_ID)..."
    gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME" --set-as-default 2>/dev/null || {
        echo "Usando projeto ativo ou configurando ID..."
        gcloud config set project "$PROJECT_ID" || true
    }
else
    echo "Projeto '$PROJECT_ID' verificado. Definindo como ativo..."
    gcloud config set project "$PROJECT_ID"
fi

# 3. Habilitar APIs necessárias do Google Cloud
echo "⚙️ Habilitando APIs essenciais (Cloud Run, Artifact Registry, Cloud Build, Secret Manager)..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    domains.googleapis.com 2>/dev/null || true

# 4. Criar repositório no Artifact Registry (caso não exista)
echo "📦 Verificando repositório de containers no Artifact Registry..."
if ! gcloud artifacts repositories describe "$AR_REPO" --location="$REGION" >/dev/null 2>&1; then
    echo "Criando repositório Docker '$AR_REPO' em $REGION..."
    gcloud artifacts repositories create "$AR_REPO" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Repositório de imagens Zuma Pilot" 2>/dev/null || true
fi

IMAGE_AR="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}:latest"
IMAGE_GCR="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

# 5. Construir e enviar imagem Docker
echo "🐳 Construindo imagem do Zuma Pilot via Google Cloud Build..."
if gcloud builds submit --tag "$IMAGE_AR" . 2>/dev/null; then
    DEPLOY_IMAGE="$IMAGE_AR"
else
    echo "Fallback para Google Container Registry (GCR)..."
    gcloud builds submit --tag "$IMAGE_GCR" .
    DEPLOY_IMAGE="$IMAGE_GCR"
fi

# 6. Fazer o Deploy no Google Cloud Run com Zero-Downtime e Probes
echo "🚀 Fazendo deploy no Cloud Run (${REGION})..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$DEPLOY_IMAGE" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --startup-probe-path=/healthz \
    --liveness-probe-path=/healthz \
    --set-env-vars NODE_ENV=production,PORT=3000

# 7. Mapeamento do Domínio Personalizado
echo "🌐 Configurando mapeamento de domínio para $CUSTOM_DOMAIN..."
gcloud beta run domain-mappings create \
    --service "$SERVICE_NAME" \
    --domain "$CUSTOM_DOMAIN" \
    --region "$REGION" 2>/dev/null || echo "ℹ️ Mapeamento de domínio já registrado ou aguardando propagação de DNS no Google Cloud Domains."

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format="value(status.url)" 2>/dev/null || echo "Verifique no Console GCP")

echo "=========================================================="
echo "✅ Deploy concluído com sucesso!"
echo "URL Direta Cloud Run: ${SERVICE_URL}"
echo "Domínio de Produção:  https://${CUSTOM_DOMAIN}"
echo "=========================================================="
