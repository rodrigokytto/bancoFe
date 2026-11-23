# ==============================================================================
# Dockerfile Multi-Stage de Produção - BancoFe Banking Engine & Integration Hub
# ==============================================================================

# Estágio 1: Build & Compilação
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.0 --activate

# Copia manifestos de dependências
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
COPY patches ./patches

# Instala todas as dependências (incluindo dev para compilar TypeScript e Vite)
RUN CI=1 pnpm install --frozen-lockfile

# Copia código-fonte e configurações
COPY . .

# Executa testes e compilação de produção
RUN pnpm test
RUN pnpm build

# Limpa dependências de desenvolvimento para reduzir a imagem final
RUN pnpm prune --prod

# ==============================================================================
# Estágio 2: Imagem Final de Execução (Minimal & Hardened)
# ==============================================================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Instala curl e tzdata para healthchecks e timezone
RUN apt-get update && apt-get install -y --no-install-recommends curl tzdata && rm -rf /var/lib/apt/lists/*

# Configura timezone para Brasília (GMT-3)
ENV TZ=America/Sao_Paulo
ENV NODE_ENV=production
ENV PORT=3000

# Criação de usuário não-privilegiado para conformidade de segurança bancária
RUN groupadd -r bancofe && useradd -r -g bancofe bancofe

# Copia dependências de produção e artefatos compilados
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

USER bancofe

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/index.js"]
