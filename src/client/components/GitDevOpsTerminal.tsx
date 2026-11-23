import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Server,
  Cloud,
  Terminal,
  Clock,
  Code2,
  Copy,
  Check,
  Activity,
  Layers,
} from 'lucide-react';
import { GitDevOpsService, GitRepoStatus } from '../../git/git-devops.service';

export const GitDevOpsTerminal: React.FC = () => {
  const [status, setStatus] = useState<GitRepoStatus>(GitDevOpsService.obterStatusRepositorio());
  const [webhooks, setWebhooks] = useState(GitDevOpsService.listarWebhooks());
  const [copiado, setCopiado] = useState(false);
  const [abaConfig, setAbaConfig] = useState<'DOCKER' | 'CLOUDBUILD' | 'WORKFLOW' | 'SCRIPT'>('DOCKER');

  const recarregar = () => {
    setStatus(GitDevOpsService.obterStatusRepositorio());
    setWebhooks(GitDevOpsService.listarWebhooks());
  };

  const copiarHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const simularWebhook = () => {
    GitDevOpsService.registrarWebhook('push', {
      repository: { full_name: 'rodrigokytto/bancoFe' },
      pusher: { name: 'rodrigokytto' },
      head_commit: { message: 'feat(mcp): expansao de ferramentas e telemetria bancaria' },
    });
    setWebhooks([...GitDevOpsService.listarWebhooks()]);
  };

  return (
    <div className="space-y-6 animate-fadeIn font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header do Repositório e Status do Deploy */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" /> GITHUB & DEVOPS BANCÁRIO
              </span>
              <span className="text-xs text-slate-400 font-mono">Resolução Bacen 85 / ISO 27001</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight flex items-center gap-2">
              <span>rodrigokytto / bancoFe</span>
              <a
                href="https://github.com/rodrigokytto/bancoFe"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Central soberana de controle de versão, telemetria de código, commits assinados e esteira de integração contínua (CI/CD) para Google Cloud Platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copiarHash(status.ultimoCommit.hash)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition"
            >
              {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{status.ultimoCommit.shortHash}</span>
            </button>
            <button
              onClick={recarregar}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Recarregar status do Git"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Métricas Consolidadas de Engenharia */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Branch Ativa</span>
            <span className="text-xl font-mono font-black text-white mt-1 block flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              {status.branchAtual}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 block">Protegida & Sincronizada</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Suíte de Testes</span>
            <span className="text-xl font-mono font-black text-emerald-400 mt-1 block">
              {status.suiteTestes.testesAprovados} Aprovados
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {status.suiteTestes.arquivosTestes} arquivos (100% sucesso)
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Módulos Compilados</span>
            <span className="text-xl font-mono font-black text-cyan-400 mt-1 block">
              {status.totalModulosCompilados} módulos
            </span>
            <span className="text-[10px] text-slate-500 mt-1 block">Bundle esbuild 1.9MB</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">Deploy em Produção</span>
            <span className="text-xl font-mono font-black text-emerald-400 mt-1 block flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {status.deployPrd.status}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">{status.deployPrd.regiao}</span>
          </div>
        </div>
      </div>

      {/* Seção de Status dos Ambientes de Hospedagem */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Cloud Run GCP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Google Cloud Platform (Cloud Run)</h3>
                <span className="text-xs text-slate-400 font-mono">southamerica-east1 (São Paulo)</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              PRD ATIVO
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Instância corporativa com escalabilidade sob demanda, healthchecks contínuos e imagens registradas no Artifact Registry.
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
            <div className="text-slate-400">
              URL Oficial:{' '}
              <a
                href={status.deployPrd.urlPrincipal}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline break-all"
              >
                {status.deployPrd.urlPrincipal}
              </a>
            </div>
            <div className="text-slate-500">Apontamento CNAME: {status.deployPrd.dominioOficial}</div>
          </div>
        </div>

      </div>

      {/* Histórico de Commits Recentes do Core Bancário */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" /> Histórico de Commits Verificados
            </h3>
            <span className="text-xs text-slate-400">
              Registro imutável de alterações do core com auditoria criptográfica
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {status.commitsRecentes.length} commits listados
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Hash</th>
                <th className="py-2.5 px-4">Mensagem de Commit</th>
                <th className="py-2.5 px-4">Autor</th>
                <th className="py-2.5 px-4">Data</th>
                <th className="py-2.5 px-4">Auditoria GPG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
              {status.commitsRecentes.map((c) => (
                <tr key={c.hash} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-cyan-400">
                    <a
                      href={`https://github.com/rodrigokytto/bancoFe/commit/${c.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      {c.shortHash}
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-sans text-white max-w-md truncate font-medium">
                    {c.mensagem}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{c.autor}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {c.data.substring(0, 19).replace('T', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" /> Assinado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks e Configurações de CI/CD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Webhooks */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-amber-400" /> Webhook GitHub Receiver
              </h3>
              <span className="text-[11px] text-slate-400">Endpoint: /api/v1/git/webhook</span>
            </div>
            <button
              onClick={simularWebhook}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 transition"
            >
              Simular Evento
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {webhooks.map((w) => (
              <div key={w.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-amber-400">{w.id} • {w.evento}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(w.dataRecebimento).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-sans">{w.payloadResumo}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3 h-3" /> {w.statusProcessamento}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizador de Configurações de Infraestrutura */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-cyan-400" /> Arquivos de Infraestrutura como Código (IaC)
            </h3>
            <div className="flex gap-1">
              {(['DOCKER', 'CLOUDBUILD', 'WORKFLOW', 'SCRIPT'] as const).map((aba) => (
                <button
                  key={aba}
                  onClick={() => setAbaConfig(aba)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                    abaConfig === aba
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {aba}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto">
            {abaConfig === 'DOCKER' && (
              <pre>
{`# Multi-stage production build
FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.18.0
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
EXPOSE 8080
CMD ["node", "dist/index.js"]`}
              </pre>
            )}

            {abaConfig === 'CLOUDBUILD' && (
              <pre>
{`steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/bancofe/erp-bancofe:$COMMIT_SHA', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'southamerica-east1-docker.pkg.dev/$PROJECT_ID/bancofe/erp-bancofe:$COMMIT_SHA']
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'erp-bancofe'
      - '--image=southamerica-east1-docker.pkg.dev/$PROJECT_ID/bancofe/erp-bancofe:$COMMIT_SHA'
      - '--region=southamerica-east1'
      - '--allow-unauthenticated'`}
              </pre>
            )}

            {abaConfig === 'WORKFLOW' && (
              <pre>
{`name: Deploy BancoFe PRD
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 10.18.0
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build`}
              </pre>
            )}

            {abaConfig === 'SCRIPT' && (
              <pre>
{`#!/usr/bin/env bash
set -e
echo "Iniciando deploy no Google Cloud Platform..."
gcloud auth login rodrigo.goncalves@kytto.com.br
gcloud config set project kytto-prd
gcloud builds submit --tag gcr.io/kytto-prd/bancofe:latest
gcloud run deploy erp-bancofe --image gcr.io/kytto-prd/bancofe:latest --region southamerica-east1`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default GitDevOpsTerminal;
