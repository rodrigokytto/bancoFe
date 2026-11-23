import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Lock,
  Users,
  Database,
  Download,
  CheckCircle2,
  AlertTriangle,
  Search,
  Key,
  Clock,
  Eye,
  FileText,
  RotateCcw,
  Check,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface LogAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  perfil: string;
  ipOrigem: string;
  acao: string;
  modulo: string;
  detalhes: string;
  hashSha256: string;
}

const LOGS_AUDITORIA_INICIAIS: LogAuditoria[] = [
  { id: "LOG-9921", dataHora: "21/11/2026 19:42:15", usuario: "rrodrigogon@gmail.com", perfil: "Super Admin", ipOrigem: "189.40.12.88 (Tangará MT)", acao: "Ativação de Módulos Backoffice ERP", modulo: "Governança Multiempresa", detalhes: "Novas subsuítes RH, Compras, WMS e Billing integradas", hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  { id: "LOG-9920", dataHora: "21/11/2026 19:10:04", usuario: "aline.gerente@zuma.com.br", perfil: "Gerente Geral", ipOrigem: "189.40.12.88 (Tangará MT)", acao: "Aprovação de Desconto Comercial", modulo: "PDV / Salão", detalhes: "Desconto de 10% concedido na Comanda #412 (Mesa 08)", hashSha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4" },
  { id: "LOG-9919", dataHora: "21/11/2026 17:30:22", usuario: "caixa.turno1@zuma.com.br", perfil: "Operador de Caixa", ipOrigem: "192.168.1.101 (Terminal CX-01)", acao: "Sangria de Caixa / Depósito", modulo: "Tesouraria", detalhes: "Sangria de R$ 1.250,00 para malote de segurança #4412", hashSha256: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb" },
  { id: "LOG-9918", dataHora: "21/11/2026 14:15:00", usuario: "contador.externo@sped.com.br", perfil: "Contador Fiscal", ipOrigem: "201.86.15.12 (Cuiabá MT)", acao: "Download Pacote Contábil SPED", modulo: "Fiscal SEFAZ", detalhes: "Exportação de lote de 142 XMLs de NFC-e de Outubro/2026", hashSha256: "fb8e20fc2e4c3f248c60c39bd652f3c1347298ab97b8b209ad20074495291701" },
];

export const ErpGovernancaSubsuite: React.FC = () => {
  const [subAba, setSubAba] = useState<"multiempresa" | "auditoria" | "permissoes" | "backup">("multiempresa");
  const [empresaAtiva, setEmpresaAtiva] = useState("Zuma Gastronomia & Sushibar");
  const [logs, setLogs] = useState<LogAuditoria[]>(LOGS_AUDITORIA_INICIAIS);

  const empresas = [
    { id: "EMP-01", nome: "Zuma Gastronomia & Sushibar", cnpj: "44.912.880/0001-44", ie: "13.882.901-0 MT", regime: "Simples Nacional", atividade: "Restaurante, Sushibar & Delivery", cidade: "Tangará da Serra - MT", ativa: empresaAtiva === "Zuma Gastronomia & Sushibar" },
    { id: "EMP-02", nome: "Dino Barbearia Ltda", cnpj: "50.073.355/0002-60", ie: "13.551.402-8 MT", regime: "Simples Nacional", atividade: "Barbearia, Estética & Bar", cidade: "Tangará da Serra - MT", ativa: empresaAtiva === "Dino Barbearia Ltda" },
    { id: "EMP-03", nome: "Kytto Agro & Grãos MT", cnpj: "38.102.441/0001-90", ie: "13.990.120-4 MT", regime: "Lucro Presumido", atividade: "Balança 80t, Silos & Safras", cidade: "Tangará da Serra - MT", ativa: empresaAtiva === "Kytto Agro & Grãos MT" },
    { id: "EMP-04", nome: "Serrano Concreto & Obras", cnpj: "29.400.122/0001-18", ie: "13.441.900-1 MT", regime: "Lucro Real", atividade: "Usina de Concreto FCK & Betoneiras", cidade: "Tangará da Serra - MT", ativa: empresaAtiva === "Serrano Concreto & Obras" },
  ];

  const alternarEmpresa = (nome: string) => {
    setEmpresaAtiva(nome);
    toast.success(`Contexto operacional multiempresa alterado para "${nome}"! Dados isolados por tenant.`);
  };

  const dispararBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Gerando snapshot criptografado do banco de dados corporativo...",
        success: "Snapshot GCP Cloud Storage gerado com sucesso! Backup íntegro e assinado digitalmente.",
        error: "Erro ao gerar snapshot.",
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Governança */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
              <span>Governança Multiempresa, Auditoria &amp; Compliance 360°</span>
              <span className="text-[10px] bg-slate-500/15 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                LGPD + Trilha Imutável SHA-256
              </span>
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              Isolamento Multi-Tenant · Trilha de Auditoria com Hash · Matriz de Permissões RBAC · Snapshots em Nuvem
            </p>
          </div>
        </div>

        {/* Seletor de Sub-Abas de Governança */}
        <div className="flex items-center gap-1 bg-[var(--surface2)] p-1 rounded-xl border border-[var(--line)] text-xs">
          {[
            { id: "multiempresa", label: "Multiempresa", icon: Building2 },
            { id: "auditoria", label: "Trilha de Auditoria", icon: Lock },
            { id: "permissoes", label: "Permissões RBAC", icon: Users },
            { id: "backup", label: "Backup & Snapshots", icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            const active = subAba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubAba(item.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-[var(--surface)] text-[var(--salmon)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. MULTIEMPRESA & ISOLAMENTO MULTI-TENANT */}
      {subAba === "multiempresa" && (
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-[var(--ink)]">Empresas e Filiais da Holding Cadastradas</h4>
              <p className="text-xs text-[var(--muted)]">Isolamento rigoroso de CNPJ, Inscrição Estadual, emissão fiscal e contas bancárias</p>
            </div>
            <button
              onClick={() => toast.info("Adicionar nova filial ou empresa parceira à holding")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Building2 className="w-4 h-4" />
              Adicionar Nova Empresa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empresas.map((emp) => (
              <div
                key={emp.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  emp.ativa
                    ? "bg-emerald-500/5 border-emerald-500/50 shadow-xs"
                    : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--salmon)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[var(--muted)]">{emp.id} · {emp.cidade}</span>
                    <h5 className="font-bold text-sm text-[var(--ink)]">{emp.nome}</h5>
                    <span className="text-xs text-[var(--salmon)] font-medium">{emp.atividade}</span>
                  </div>
                  {emp.ativa ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500 text-white font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Empresa Ativa
                    </span>
                  ) : (
                    <button
                      onClick={() => alternarEmpresa(emp.nome)}
                      className="text-xs px-2.5 py-1 rounded-full bg-[var(--surface2)] border border-[var(--line)] hover:bg-[var(--line)] text-[var(--ink)] font-bold transition-all"
                    >
                      Trocar para Esta
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--line)]">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">CNPJ:</span>
                    <span className="font-mono text-[var(--ink)]">{emp.cnpj}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Inscrição Estadual MT:</span>
                    <span className="font-mono text-[var(--ink)]">{emp.ie}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Regime Tributário:</span>
                    <span className="text-[var(--ink)] font-bold">{emp.regime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] block">Isolamento de Banco:</span>
                    <span className="text-emerald-600 font-bold">PostgreSQL Schema Isolado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TRILHA DE AUDITORIA IMUTÁVEL COM HASH */}
      {subAba === "auditoria" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Trilha de Auditoria Imutável (Audit Trail com SHA-256)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Log de todas as operações sensíveis no ERP com endereço IP, operador e assinatura criptográfica</p>
            </div>
            <button
              onClick={() => toast.success("Relatório de auditoria exportado com hash para comprovação fiscal e trabalhista!")}
              className="px-3.5 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Log de Auditoria
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Usuário / Perfil</th>
                  <th className="py-2.5 px-3">Módulo</th>
                  <th className="py-2.5 px-3">Ação Realizada</th>
                  <th className="py-2.5 px-3">Detalhes</th>
                  <th className="py-2.5 px-3">IP Origem</th>
                  <th className="py-2.5 px-3">Hash SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[var(--surface2)] font-mono text-[11px]">
                    <td className="py-3 px-3 font-bold text-[var(--ink)] whitespace-nowrap">{l.dataHora}</td>
                    <td className="py-3 px-3 font-sans">
                      <strong className="block text-[var(--ink)]">{l.usuario}</strong>
                      <span className="text-[10px] text-[var(--muted)]">{l.perfil}</span>
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-[var(--salmon)]">{l.modulo}</td>
                    <td className="py-3 px-3 font-sans font-bold text-[var(--ink)]">{l.acao}</td>
                    <td className="py-3 px-3 font-sans text-[var(--muted)] max-w-xs">{l.detalhes}</td>
                    <td className="py-3 px-3 text-[var(--muted)]">{l.ipOrigem}</td>
                    <td className="py-3 px-3 text-[10px] text-[var(--muted)] truncate max-w-[120px]">{l.hashSha256}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MATRIZ DE PERMISSÕES RBAC */}
      {subAba === "permissoes" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="border-b border-[var(--line)] pb-3">
            <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Matriz de Permissões por Papel (RBAC)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">Controle granular de acesso a telas financeiras, sangrias, cancelamentos de comanda e dados confidenciais</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] font-mono uppercase text-[10px]">
                  <th className="py-2 px-3">Funcionalidade / Alçada</th>
                  <th className="py-2 px-3 text-center">Super Admin</th>
                  <th className="py-2 px-3 text-center">Gerente Geral</th>
                  <th className="py-2 px-3 text-center">Caixa / PDV</th>
                  <th className="py-2 px-3 text-center">Sushiman / KDS</th>
                  <th className="py-2 px-3 text-center">Garçom</th>
                  <th className="py-2 px-3 text-center">Contador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {[
                  { feature: "Visualizar DRE & Margens de Lucro", admin: true, gerente: true, caixa: false, sushiman: false, garcom: false, contador: true },
                  { feature: "Emitir NFC-e & NFS-e Oficial", admin: true, gerente: true, caixa: true, sushiman: false, garcom: false, contador: true },
                  { feature: "Cancelar Pedido / Estorno de Comanda", admin: true, gerente: true, caixa: false, sushiman: false, garcom: false, contador: false },
                  { feature: "Conceder Desconto > 10% no Caixa", admin: true, gerente: true, caixa: false, sushiman: false, garcom: false, contador: false },
                  { feature: "Realizar Sangria e Fechamento de Caixa", admin: true, gerente: true, caixa: true, sushiman: false, garcom: false, contador: false },
                  { feature: "Acessar Folha de Pagamento & Salários RH", admin: true, gerente: false, caixa: false, sushiman: false, garcom: false, contador: true },
                  { feature: "Ajustar Estoque & Inventário Físico", admin: true, gerente: true, caixa: false, sushiman: true, garcom: false, contador: false },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--surface2)]">
                    <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{row.feature}</td>
                    <td className="py-2.5 px-3 text-center">{row.admin ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-2.5 px-3 text-center">{row.gerente ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-2.5 px-3 text-center">{row.caixa ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-2.5 px-3 text-center">{row.sushiman ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-2.5 px-3 text-center">{row.garcom ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-2.5 px-3 text-center">{row.contador ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-red-400">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. BACKUP EM NUVEM & SNAPSHOTS */}
      {subAba === "backup" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div>
              <h4 className="font-bold text-base text-[var(--ink)] flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-600" />
                <span>Snapshots &amp; Backup em Nuvem GCP (Google Cloud Storage)</span>
              </h4>
              <p className="text-xs text-[var(--muted)]">Rotina diária automatizada de backup com replicação geográfica na América do Sul (São Paulo)</p>
            </div>

            <button
              onClick={dispararBackup}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 hover:brightness-105"
            >
              <Database className="w-4 h-4" />
              Executar Snapshot Agora
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface2)] border border-[var(--line)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--ink)]">Último Snapshot Automático: Hoje às 03:00 (Madrugada)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">100% Saudável</span>
            </div>
            <p className="text-xs text-[var(--muted)] font-mono">
              Bucket: gs://zuma-backups-prd-southamerica-east1/2026-11-21-0300.pgdump.enc (Tamanho: 42.8 MB · Criptografia AES-256)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
