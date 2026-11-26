# ==============================================================================
# Dockerfile Multi-Stage de Produção - BancoFe Banking Engine & Integration Hub
# ==============================================================================

# Estágio 1: Build & Compilação
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@10.18.0

# Copia manifestos de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY patches ./patches

# Instala todas as dependências (incluindo dev para compilar TypeScript e Vite)
RUN CI=1 pnpm install --frozen-lockfile

# Copia código-fonte e configurações
COPY . .

# Compilação de produção (Vite e backend esbuild)
RUN pnpm build

# ==============================================================================
# Estágio 2: Imagem Final de Execução (Minimal & Hardened)
# ==============================================================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Instala curl e tzdata para healthchecks e timezone
RUN apt-get update && apt-get install -y --no-install-recommends curl tzdata && rm -rf /var/lib/apt/lists/*

# Configura timezone para Cuiabá/Brasília
ENV TZ=America/Cuiaba
ENV NODE_ENV=production
ENV PORT=3000
ENV OPENFINANCE_CLIENT_ID=bancofe-fapi-client-52889341
ENV OPENFINANCE_CERT=ICP_BRASIL_BANCOFE_PROD_MTLS_V4
ENV JUCEMAT_TOKEN=JUCEMAT_REDESIM_PROD_API_KEY_51
ENV CAGED_TOKEN=MTE_CAGED_EMPREGOS_API_V2
ENV DATAPREV_TOKEN=DATAPREV_INSS_CONSIGNADO_AUTH_V3

# Criação de usuário não-privilegiado para conformidade de segurança bancária
RUN groupadd -r bancofe && useradd -r -g bancofe bancofe

# Copia dependências de produção e artefatos compilados
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/data ./data

RUN mkdir -p /app/data && chown -R bancofe:bancofe /app/data

USER bancofe

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/healthz || exit 1

CMD ["node", "dist/index.js"]
