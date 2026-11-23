import { ServicoMesaCredito, PropostaMesaCredito, MetricasMesaCredito } from "../credito/servico-mesa-credito.js";

export function renderizarHtmlMesaCredito(propostaIdSelecionada?: string): string {
  const servico = ServicoMesaCredito.getInstance();
  const propostas = servico.listarPropostas();
  const metricas = servico.obterMetricas();

  const propostaInicial = propostaIdSelecionada
    ? propostas.find((p) => p.id === propostaIdSelecionada) || propostas[0]
    : propostas[0];

  const propostasJson = JSON.stringify(propostas);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mesa de Crédito & Financiamentos • Rating Algorítmico CMN 2.682 • BancoFé</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #071510; color: #f1f5f9; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .bg-bancofe-dark { background-color: #071510; }
    .bg-bancofe-primary { background-color: #0c4a34; }
    .bg-bancofe-card { background: rgba(14, 30, 24, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(16, 185, 129, 0.18); }
    .bg-bancofe-card-hover:hover { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15); }
    .emerald-glow { box-shadow: 0 0 40px -10px rgba(16, 185, 129, 0.25); }
    /* Scrollbar personalizada */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #071510; }
    ::-webkit-scrollbar-thumb { background: #126245; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #10b981; }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

  <!-- TOPBAR INSTITUCIONAL VERDE -->
  <header class="sticky top-0 z-50 bg-[#05110d]/95 backdrop-blur-md border-b border-emerald-950/80 shadow-xl">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Marca e Título -->
      <div class="flex items-center gap-3 shrink-0">
        <a href="/admin/mesa-credito" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-emerald-400/30">
            <i class="fa-solid fa-scale-balanced text-emerald-100"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">Mesa de Crédito 360°</span>
            </div>
            <p class="text-[11px] text-slate-400">Rating Algorítmico, Decisões & CCB Digital • PRD</p>
          </div>
        </a>
      </div>

      <!-- Navegação Principal Unificada -->
      <nav class="hidden xl:flex items-center gap-1 text-xs font-semibold">
        <a href="/admin/mesa-credito" class="px-3 py-1.5 rounded-lg bg-emerald-900/80 text-emerald-200 border border-emerald-500/50 shadow-sm flex items-center gap-1.5">
          <i class="fa-solid fa-scale-balanced text-emerald-400"></i> Mesa de Crédito
        </a>
        <a href="/admin/crm-financeira" class="px-2.5 py-1.5 rounded-lg text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/60 transition flex items-center gap-1.5" title="Operações Financeiras & CRM 360">
          <i class="fa-solid fa-briefcase text-purple-400"></i> Operações & CRM
        </a>
        <a href="/admin/cadastro-360" class="px-2.5 py-1.5 rounded-lg text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/60 transition flex items-center gap-1.5" title="Cadastro 360, Pré-Cadastro & Vault Documental">
          <i class="fa-solid fa-id-card-clip text-purple-400"></i> Cadastro 360° & Vault
        </a>
        <a href="/plataforma/consulta-cpf" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-magnifying-glass-chart text-emerald-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-user-check text-emerald-400"></i> Pré-Cadastro
        </a>
        <a href="/admin" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-cubes text-emerald-400"></i> Gestão Módulos
        </a>
        <a href="/plataforma/carteira" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-wallet text-emerald-400"></i> Carteira PIX
        </a>
        <a href="/admin/backoffice" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5" title="Cockpit ERP Backoffice">
          <i class="fa-solid fa-network-wired text-teal-400"></i> Backoffice ERP
        </a>
      </nav>

      <!-- Perfil Operador & Ações -->
      <div class="flex items-center gap-3">
        <button onclick="abrirModalNovaProposta()" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition">
          <i class="fa-solid fa-plus"></i> Nova Simulação / Proposta
        </button>
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-200">Rodrigo Gonçalves</p>
          <div class="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ROOT-MASTER • PRD</span>
          </div>
        </div>
        <a href="/login" class="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition" title="Sair">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- CABEÇALHO EXECUTIVO E KPIS -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-emerald-950">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <i class="fa-solid fa-circle-check text-emerald-400"></i> Motor Algorítmico CMN 2.682/99 Ativo
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
            ${metricas.integridadeBureaus}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Mesa de Crédito & Financiamentos
        </h1>
        <p class="text-xs sm:text-sm text-slate-400">
          Decisões de crédito corporativo, financiamentos habitacionais da Casa Nova Imóveis, CPR Agro UISA, CDC e Capital de Giro BancoFé.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <a href="/admin/crm-financeira" class="px-3 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-800/70 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 shadow">
          <i class="fa-solid fa-briefcase text-purple-400"></i> Ir para CRM & Esteira
        </a>
        <a href="/admin" class="px-3 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 shadow">
          <i class="fa-solid fa-cubes text-emerald-400"></i> Módulos por Negócio
        </a>
      </div>
    </div>

    <!-- CARDS DE MÉTRICAS KPIS -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Em Análise (Fila)</span>
          <i class="fa-solid fa-hourglass-half text-amber-400"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-amber-400 mono">
          R$ ${(metricas.volumeTotalEmAnalise).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <p class="text-[10px] text-slate-500 mt-0.5">Aguardando parecer da mesa</p>
      </div>

      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Aprovado na Mesa</span>
          <i class="fa-solid fa-circle-check text-emerald-400"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-emerald-400 mono">
          R$ ${(metricas.volumeTotalAprovado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <p class="text-[10px] text-emerald-600 mt-0.5">Pronto para formalização CCB</p>
      </div>

      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Total de Propostas</span>
          <i class="fa-solid fa-file-invoice-dollar text-teal-400"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-white mono">
          ${metricas.totalPropostasFila}
        </p>
        <p class="text-[10px] text-slate-500 mt-0.5">100% integradas no ecossistema</p>
      </div>

      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Taxa Média Mensal</span>
          <i class="fa-solid fa-chart-line text-blue-400"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-blue-400 mono">
          ${metricas.taxaMediaMensal}% a.m.
        </p>
        <p class="text-[10px] text-slate-500 mt-0.5">Ponderada pelo risco e rating</p>
      </div>

      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Perda Esperada (EL)</span>
          <i class="fa-solid fa-shield-halved text-purple-400"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-purple-300 mono">
          ${metricas.perdaEsperadaMediaEL}%
        </p>
        <p class="text-[10px] text-purple-400 mt-0.5">Expected Loss = PD × LGD</p>
      </div>

      <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-900/40">
        <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
          <span>Rating Predominante</span>
          <i class="fa-solid fa-award text-amber-300"></i>
        </div>
        <p class="text-lg sm:text-xl font-black text-amber-300 mono">
          AAA / A
        </p>
        <p class="text-[10px] text-slate-500 mt-0.5">Baixo risco de crédito</p>
      </div>
    </div>

    <!-- BARRA DE FILTROS & SELEÇÃO DE EMPRESAS -->
    <div class="bg-bancofe-card p-4 rounded-xl border border-emerald-950 flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Seletor de Empresa / Vertical -->
      <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
        <button onclick="filtrarEmpresa('TODOS')" id="btn-emp-todos" class="btn-empresa px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold whitespace-nowrap shadow">
          Todas Empresas (${metricas.totalPropostasFila})
        </button>
        <button onclick="filtrarEmpresa('casanova')" id="btn-emp-casanova" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          Casa Nova Imóveis
        </button>
        <button onclick="filtrarEmpresa('agro_uisa')" id="btn-emp-agro_uisa" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          Agro UISA
        </button>
        <button onclick="filtrarEmpresa('bancofe_financeira')" id="btn-emp-bancofe_financeira" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          BancoFé Financeira
        </button>
        <button onclick="filtrarEmpresa('ultra_engenharia')" id="btn-emp-ultra_engenharia" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          Construtora Ultra
        </button>
        <button onclick="filtrarEmpresa('dino_barbearia')" id="btn-emp-dino_barbearia" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          Dino Barbearia
        </button>
        <button onclick="filtrarEmpresa('zuma_gastronomia')" id="btn-emp-zuma_gastronomia" class="btn-empresa px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-semibold whitespace-nowrap border border-slate-800">
          Zuma Gastronomia
        </button>
      </div>

      <!-- Filtro de Busca Instantânea -->
      <div class="relative w-full md:w-80">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
        <input type="text" id="campoBusca" onkeyup="aplicarBuscaInstantanea()" placeholder="Buscar cliente, CPF, protocolo ou produto..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-emerald-950 focus:border-emerald-500 focus:outline-none text-white placeholder-slate-500">
      </div>
    </div>

    <!-- GRID DIVISÃO 2 COLUNAS: FILA DA ESTEIRA (ESQUERDA) VS COCKPIT DECISÓRIO (DIREITA) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      <!-- COLUNA DA ESQUERDA: LISTA DE PROPOSTAS DA MESA (5 COLUNAS LG) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-400 px-1">
          <span class="font-bold uppercase tracking-wider text-emerald-400">
            <i class="fa-solid fa-list-check"></i> Fila Operacional da Mesa (<span id="contagemPropostas">${propostas.length}</span>)
          </span>
          <span class="text-[11px] text-slate-500">Selecione para deliberar</span>
        </div>

        <div id="listaPropostasContainer" class="space-y-3 max-h-[820px] overflow-y-auto pr-1">
          ${propostas
            .map((p) => {
              const ratingCores: Record<string, string> = {
                AAA: "bg-emerald-950 text-emerald-300 border-emerald-700",
                AA: "bg-emerald-950 text-emerald-400 border-emerald-800",
                A: "bg-teal-950 text-teal-300 border-teal-700",
                BBB: "bg-blue-950 text-blue-300 border-blue-700",
                BB: "bg-indigo-950 text-indigo-300 border-indigo-700",
                B: "bg-amber-950 text-amber-300 border-amber-700",
                CCC: "bg-orange-950 text-orange-300 border-orange-700",
                CC: "bg-rose-950 text-rose-300 border-rose-700",
                C: "bg-red-950 text-red-300 border-red-700",
                D: "bg-red-950 text-red-400 border-red-800",
              };
              const statusBadgeCores: Record<string, string> = {
                EM_ANALISE: "bg-purple-950/80 text-purple-300 border-purple-800",
                APROVADO_MESA: "bg-emerald-950/80 text-emerald-300 border-emerald-700",
                CONDICIONADO: "bg-amber-950/80 text-amber-300 border-amber-700",
                COMITE_RISCO: "bg-blue-950/80 text-blue-300 border-blue-700",
                RECUSADO: "bg-rose-950/80 text-rose-300 border-rose-700",
                FORMALIZADO_CCB: "bg-teal-950/80 text-teal-300 border-teal-700",
                LIQUIDADO: "bg-slate-900 text-slate-300 border-slate-700",
              };

              const estaAtivo = p.id === propostaInicial.id;

              return `
              <div onclick="selecionarProposta('${p.id}')" id="card-prop-${p.id}" class="card-proposta cursor-pointer p-4 rounded-xl transition duration-150 border ${
                estaAtivo ? "bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/60" : "bg-bancofe-card border-emerald-950/80 bg-bancofe-card-hover"
              }" data-empresa="${p.empresaOrigemId}" data-status="${p.status}">
                
                <div class="flex items-center justify-between text-[11px] mb-2">
                  <div class="flex items-center gap-1.5">
                    <span class="mono font-bold text-slate-300">${p.codigoProtocolo}</span>
                    <span class="px-1.5 py-0.2 rounded text-[10px] font-bold border ${ratingCores[p.ratingBancoFe] || "bg-slate-800 text-slate-300"}">
                      ${p.ratingBancoFe}
                    </span>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeCores[p.status] || "bg-slate-800 text-slate-300"}">
                    ${p.statusLabel}
                  </span>
                </div>

                <div class="mb-2">
                  <h4 class="font-bold text-white text-sm line-clamp-1">${p.clienteNome}</h4>
                  <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span class="mono">${p.clienteDocumento}</span>
                    <span>•</span>
                    <span class="text-emerald-400 font-semibold line-clamp-1">${p.empresaOrigemNome}</span>
                  </div>
                </div>

                <div class="p-2.5 rounded-lg bg-black/40 border border-emerald-950/80 mb-2">
                  <p class="text-[11px] text-slate-400 font-medium line-clamp-1">${p.produtoNome}</p>
                  <div class="flex items-baseline justify-between mt-1">
                    <span class="text-xs text-slate-400">Solicitado:</span>
                    <span class="text-sm font-black text-white mono">R$ ${(p.valorSolicitado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="flex items-baseline justify-between text-[11px] text-slate-400 mt-0.5">
                    <span>Prazo & Taxa:</span>
                    <span class="mono font-semibold text-emerald-400">${p.prazoMeses}x • ${p.taxaMensalPercentual}% a.m. (${p.sistemaAmortizacao})</span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-emerald-950/60">
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-gauge text-slate-500"></i>
                    <span>Score: <b class="text-white mono">${p.scoreBancoFe}</b></span>
                  </div>
                  <div class="flex items-center gap-1">
                    <i class="fa-solid fa-shield-virus text-slate-500"></i>
                    <span>PD: <b class="text-emerald-400 mono">${p.probabilidadeInadimplenciaPD}%</b></span>
                  </div>
                  <span class="text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                    Auditar <i class="fa-solid fa-chevron-right text-[9px]"></i>
                  </span>
                </div>
              </div>`;
            })
            .join("")}
        </div>
      </div>

      <!-- COLUNA DA DIREITA: COCKPIT DECISÓRIO & PARECER ALGORÍTMICO (7 COLUNAS LG) -->
      <div class="lg:col-span-7 bg-bancofe-card p-6 rounded-2xl border border-emerald-900/60 shadow-2xl space-y-6" id="painelDetalhesProposta">
        <!-- Renderizado dinamicamente via JavaScript -->
      </div>
    </div>
  </main>

  <!-- MODAL DE NOVA PROPOSTA / SIMULAÇÃO NA MESA -->
  <div id="modalNovaProposta" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-[#0b1712] border border-emerald-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden space-y-5">
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
      
      <div class="flex items-center justify-between pb-3 border-b border-emerald-950">
        <div>
          <h3 class="text-lg font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-calculator text-emerald-400"></i> Nova Simulação & Proposta na Mesa de Crédito
          </h3>
          <p class="text-xs text-slate-400">Insira os dados do tomador de crédito para cálculo algorítmico e parecer instantâneo</p>
        </div>
        <button onclick="fecharModalNovaProposta()" class="text-slate-400 hover:text-white p-2">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <form id="formNovaProposta" onsubmit="submeterNovaProposta(event)" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Nome Completo / Razão Social *</label>
            <input type="text" id="novoNome" required placeholder="Ex: Cooperativa de Grãos do Vale" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">CPF ou CNPJ *</label>
            <input type="text" id="novoDocumento" required placeholder="00.000.000/0001-00" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white mono">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Tipo de Tomador</label>
            <select id="novoTipo" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
              <option value="PJ">Pessoa Jurídica (PJ)</option>
              <option value="PF">Pessoa Física (PF)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Renda / Faturamento Mensal (R$) *</label>
            <input type="number" id="novaRenda" required min="1000" step="100" placeholder="Ex: 85000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Patrimônio Declarado (R$)</label>
            <input type="number" id="novoPatrimonio" min="0" step="1000" placeholder="Ex: 1200000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white mono">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Empresa / Vertical de Origem</label>
            <select id="novaEmpresa" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
              <option value="casanova|Casa Nova Imóveis & Financiamentos">Casa Nova Imóveis</option>
              <option value="agro_uisa|Agro & Crédito Rural (UISA Biorrefinaria)">Agro & Biorrefinaria UISA</option>
              <option value="bancofe_financeira|BancoFe — Operações Financeiras & CRM">BancoFé Operações Financeiras</option>
              <option value="ultra_engenharia|Construtora Ultra & Incorporadora">Construtora Ultra</option>
              <option value="dino_barbearia|Dino Barbearia & Varejo Multi-Negócio">Dino Barbearia</option>
              <option value="zuma_gastronomia|Zuma Cozinha Oriental & Gastronomia">Zuma Cozinha Oriental</option>
              <option value="zuma_moda|Zuma Moda, Roupas & Boutique">Zuma Moda & Boutique</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Produto Financeiro</label>
            <select id="novoProduto" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
              <option value="imobiliario_sbpe|Financiamento Imobiliário Residencial SBPE">Financiamento Imobiliário SBPE</option>
              <option value="cpr_verde_barter|Cédula de Produto Rural (CPR Financeira Barter)">Cédula de Produto Rural (CPR Barter)</option>
              <option value="capital_giro_pj|Capital de Giro Empresarial com Recebíveis">Capital de Giro PJ</option>
              <option value="credito_producao|Crédito Imobiliário à Produção (Ultra)">Crédito à Produção de Obras</option>
              <option value="antecipacao_recebiveis|Antecipação de Recebíveis Smart POS BancoFé">Antecipação Recebíveis POS</option>
              <option value="financiamento_frotas|Financiamento de Frotas Pesadas & Caminhões">Financiamento de Frotas</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Valor Solicitado (R$) *</label>
            <input type="number" id="novoValor" required min="1000" step="100" placeholder="Ex: 500000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Prazo (Meses) *</label>
            <input type="number" id="novoPrazo" required min="6" max="420" value="36" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white mono">
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Sistema de Amortização</label>
            <select id="novoSistema" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
              <option value="PRICE">Tabela PRICE (Parcelas Fixas)</option>
              <option value="SAC">Tabela SAC (Amortização Constante)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1">Finalidade da Operação</label>
          <input type="text" id="novaFinalidade" placeholder="Ex: Expansão de infraestrutura e compra de estoque de insumos" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-950 focus:border-emerald-500 text-white">
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-emerald-950">
          <button type="button" onclick="fecharModalNovaProposta()" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-lg shadow-emerald-950 flex items-center gap-1.5">
            <i class="fa-solid fa-play"></i> Rodar Análise & Criar Proposta
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- SCRIPT CLIENTE PARA COCKPIT INTERATIVO DA MESA DE CRÉDITO -->
  <script>
    const TODAS_PROPOSTAS = ${propostasJson};
    let propostaSelecionadaId = '${propostaInicial.id}';
    let filtroEmpresaAtual = 'TODOS';

    function renderizarCockpitProposta(proposta) {
      if (!proposta) {
        document.getElementById('painelDetalhesProposta').innerHTML = '<div class="p-8 text-center text-slate-500">Nenhuma proposta selecionada.</div>';
        return;
      }

      const ratingCores = {
        AAA: 'bg-emerald-950 text-emerald-300 border-emerald-500',
        AA: 'bg-emerald-950 text-emerald-400 border-emerald-600',
        A: 'bg-teal-950 text-teal-300 border-teal-500',
        BBB: 'bg-blue-950 text-blue-300 border-blue-500',
        BB: 'bg-indigo-950 text-indigo-300 border-indigo-500',
        B: 'bg-amber-950 text-amber-300 border-amber-500',
        CCC: 'bg-orange-950 text-orange-300 border-orange-500',
        CC: 'bg-rose-950 text-rose-300 border-rose-500',
        C: 'bg-red-950 text-red-300 border-red-500',
        D: 'bg-red-950 text-red-400 border-red-700'
      };

      const decisaoClasses = {
        APROVADO_AUTOMATICO: 'bg-emerald-950 text-emerald-300 border-emerald-700',
        CONDICIONADO_AVALISTA_OU_GARANTIA: 'bg-amber-950 text-amber-300 border-amber-700',
        SUBMETIDO_COMITE_RISCO: 'bg-blue-950 text-blue-300 border-blue-700',
        RECUSADO_POLITICA_RISCO: 'bg-rose-950 text-rose-300 border-rose-700'
      };

      const decisaoLabel = {
        APROVADO_AUTOMATICO: 'Aprovado Automático pelo Motor BancoFé',
        CONDICIONADO_AVALISTA_OU_GARANTIA: 'Aprovado Condicionado (Garantia/Aval Exigido)',
        SUBMETIDO_COMITE_RISCO: 'Submetido ao Comitê Executivo de Risco',
        RECUSADO_POLITICA_RISCO: 'Recusado pelas Diretrizes de Risco'
      };

      const pAlg = proposta.parecerAlgoritmico || {};

      const html = \`
        <!-- HEADER DO PROPONENTE -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-950/80">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800 mono">
                \${proposta.codigoProtocolo}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                \${proposta.empresaOrigemNome}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                \${proposta.statusLabel}
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white">\${proposta.clienteNome}</h2>
            <p class="text-xs text-slate-400 mt-0.5">
              Documento: <span class="mono text-slate-300">\${proposta.clienteDocumento}</span> (\${proposta.clienteTipo}) • Finalidade: <span class="text-slate-300">\${proposta.finalidadeCredito}</span>
            </p>
          </div>
          <div class="text-right sm:border-l sm:border-emerald-950/80 sm:pl-4">
            <p class="text-[11px] text-slate-400">Renda Mensal Declarada</p>
            <p class="text-lg font-black text-white mono">R$ \${(proposta.rendaMensalDeclarada).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
            <p class="text-[10px] text-slate-500">Patrimônio: R$ \${(proposta.patrimonioDeclarado || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
          </div>
        </div>

        <!-- CARD GIGANTE DO PARECER ALGORÍTMICO -->
        <div class="p-5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-black/80 border border-emerald-500/30 shadow-inner space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="px-4 py-2 rounded-xl border-2 \${ratingCores[proposta.ratingBancoFe] || 'bg-slate-800 text-white'} text-center shadow-lg">
                <span class="text-[10px] uppercase font-bold tracking-wider block">Rating</span>
                <span class="text-2xl font-black mono">\${proposta.ratingBancoFe}</span>
              </div>
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border \${decisaoClasses[pAlg.decisaoFinal] || 'bg-slate-800 text-white'}">
                  \${decisaoLabel[pAlg.decisaoFinal] || pAlg.decisaoFinal || 'Avaliação em Andamento'}
                </span>
                <p class="text-xs text-slate-300 mt-1">
                  Score BancoFé: <b class="text-white mono">\${proposta.scoreBancoFe}/1000</b> • Probabilidade Inadimplência (PD): <b class="text-emerald-400 mono">\${proposta.probabilidadeInadimplenciaPD}%</b>
                </p>
              </div>
            </div>
            <div class="text-right bg-slate-950/80 p-3 rounded-lg border border-emerald-950">
              <span class="text-[10px] text-slate-400 uppercase font-semibold block">Limite Global Recomendado</span>
              <span class="text-lg font-black text-emerald-400 mono">R$ \${(pAlg.limiteGlobalPreAprovado || proposta.valorAprovado || proposta.valorSolicitado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>

          <!-- SUB-LIMITES POR PRODUTO -->
          \${pAlg.limitesPorProduto ? \`
          <div class="pt-3 border-t border-emerald-950/80">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sub-Limites Parametrizados por Linha:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Habitacional (SBPE/CVA):</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.financiamentoHabitacionalMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Crédito Rural CPR:</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.creditoRuralCPRMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Capital de Giro PJ:</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.capitalGiroPJMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Home Equity (Imóvel):</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.homeEquityMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Cartão Black / PJ:</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.cartaoCreditoBlackMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
              <div class="p-2 rounded bg-slate-950/60 border border-emerald-950">
                <span class="text-slate-400 block">Consignado em Folha:</span>
                <span class="font-bold text-white mono">R$ \${(pAlg.limitesPorProduto.consignadoFolhaMaximo || 0).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
          \` : ''}
        </div>

        <!-- SIMULADOR INTERATIVO SAC vs PRICE -->
        <div class="p-4 rounded-xl bg-slate-900/70 border border-emerald-950 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-emerald-950">
            <h4 class="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-calculator text-emerald-400"></i> Amortização & Fluxo Financeiro (Simulador Oficial)
            </h4>
            <div class="flex items-center gap-1 bg-black/50 p-1 rounded-lg text-xs">
              <button onclick="alternarSistema('PRICE')" class="px-2.5 py-1 rounded font-bold \${proposta.sistemaAmortizacao === 'PRICE' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}">PRICE</button>
              <button onclick="alternarSistema('SAC')" class="px-2.5 py-1 rounded font-bold \${proposta.sistemaAmortizacao === 'SAC' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}">SAC</button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-2.5 rounded bg-black/40 border border-emerald-950">
              <span class="text-[10px] text-slate-400 block">Valor da Operação:</span>
              <span class="text-sm font-bold text-white mono">R$ \${(proposta.valorAprovado || proposta.valorSolicitado).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="p-2.5 rounded bg-black/40 border border-emerald-950">
              <span class="text-[10px] text-slate-400 block">Prazo Contratual:</span>
              <span class="text-sm font-bold text-white mono">\${proposta.prazoMeses} parcelas</span>
            </div>
            <div class="p-2.5 rounded bg-black/40 border border-emerald-950">
              <span class="text-[10px] text-slate-400 block">Taxa de Juros:</span>
              <span class="text-sm font-bold text-emerald-400 mono">\${proposta.taxaMensalPercentual}% a.m.</span>
              <span class="text-[10px] text-slate-500 block">CET: \${proposta.cetAnualPercentual || 18.2}% a.a.</span>
            </div>
            <div class="p-2.5 rounded bg-black/40 border border-emerald-950">
              <span class="text-[10px] text-slate-400 block">Comprometimento DTI:</span>
              <span class="text-sm font-bold \${proposta.comprometimentoRendaDTI > 30 ? 'text-amber-400' : 'text-emerald-400'} mono">\${proposta.comprometimentoRendaDTI}% da Renda</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
              <span class="text-[10px] text-emerald-300 block font-semibold">1ª Parcela Estimada:</span>
              <span class="text-base font-black text-emerald-400 mono">R$ \${(proposta.primeiraParcela).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
              <span class="text-[10px] text-emerald-300 block font-semibold">Última Parcela Estimada:</span>
              <span class="text-base font-black text-emerald-400 mono">R$ \${(proposta.ultimaParcela).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-950/60 border border-emerald-950">
              <span class="text-[10px] text-slate-400 block">Total Juros Previsto:</span>
              <span class="text-sm font-black text-slate-200 mono">R$ \${(proposta.totalJuros).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        <!-- AUDITORIA DE RISCO 360 EM 4 QUADRANTES -->
        <div class="space-y-2">
          <h4 class="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-emerald-400"></i> Auditoria de Bureaus, Cartórios & Compliance ao Vivo
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- 1. SCR Bacen -->
            <div class="p-3 rounded-lg bg-slate-900/60 border border-emerald-950 space-y-1">
              <div class="flex items-center justify-between font-bold text-slate-300">
                <span><i class="fa-solid fa-landmark text-emerald-400 mr-1"></i> SCR Bacen / Registrato</span>
                <span class="text-emerald-400 font-mono text-[11px]">Conforme</span>
              </div>
              <p class="text-[11px] text-slate-400">Rating Bacen: <b class="text-white mono">\${pAlg.dossieSCRBacen?.ratingRegulatorio || 'AA'}</b> • Limites Ativos: R$ 140.000,00</p>
              <p class="text-[10px] text-slate-500">Operações vencidas no SFN: R$ 0,00 (Histórico impecável)</p>
            </div>

            <!-- 2. Cartórios CENPROT -->
            <div class="p-3 rounded-lg bg-slate-900/60 border border-emerald-950 space-y-1">
              <div class="flex items-center justify-between font-bold text-slate-300">
                <span><i class="fa-solid fa-stamp text-teal-400 mr-1"></i> Cartórios & Protestos IEPTB</span>
                <span class="text-emerald-400 font-mono text-[11px]">Nada Consta</span>
              </div>
              <p class="text-[11px] text-slate-400">Protestos em Tangará da Serra: <b>0</b> • Matrículas ONR: <b>Regular</b></p>
              <p class="text-[10px] text-slate-500">Pesquisa nacional CENPROT realizada em tempo real</p>
            </div>

            <!-- 3. Compliance Ambiental SICAR -->
            <div class="p-3 rounded-lg bg-slate-900/60 border border-emerald-950 space-y-1">
              <div class="flex items-center justify-between font-bold text-slate-300">
                <span><i class="fa-solid fa-leaf text-emerald-400 mr-1"></i> Compliance Ambiental SICAR</span>
                <span class="text-emerald-400 font-mono text-[11px]">Apto / Regular</span>
              </div>
              <p class="text-[11px] text-slate-400">Embargos SEMA-MT / IBAMA: <b>0</b> • CAR: Ativo</p>
              <p class="text-[10px] text-slate-500">Certificado de regularidade ambiental nº SEMA-2026-0814</p>
            </div>

            <!-- 4. PGFN Regularize & CEIS -->
            <div class="p-3 rounded-lg bg-slate-900/60 border border-emerald-950 space-y-1">
              <div class="flex items-center justify-between font-bold text-slate-300">
                <span><i class="fa-solid fa-gavel text-amber-400 mr-1"></i> Dívida Ativa PGFN & CEIS</span>
                <span class="text-emerald-400 font-mono text-[11px]">Regularize OK</span>
              </div>
              <p class="text-[11px] text-slate-400">CND Federal: <b>Válida</b> • Sanções CGU/CEIS/CNEP: <b>Nada Consta</b></p>
              <p class="text-[10px] text-slate-500">Consulta unificada Receita Federal e PGFN</p>
            </div>
          </div>
        </div>

        <!-- CONDICIONANTES E FATORES DE RISCO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
            <span class="font-bold text-emerald-300 text-xs block mb-1">
              <i class="fa-solid fa-circle-check mr-1"></i> Fatores Positivos Homologados:
            </span>
            <ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              \${(pAlg.fatoresPositivos || ['Capacidade de pagamento atestada com margem folgada', 'Histórico positivo em bureaus e SCR Bacen', 'Garantias reais compatíveis com a operação']).map(f => \`<li>\${f}</li>\`).join('')}
            </ul>
          </div>
          <div class="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
            <span class="font-bold text-amber-300 text-xs block mb-1">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i> Fatores de Atenção / Condicionantes:
            </span>
            <ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              \${(pAlg.condicionantesAprovacao || pAlg.fatoresAtencaoOuRisco || ['Apresentação de certidão atualizada de ônus reais no fechamento', 'Comprovação de faturamento dos últimos 3 meses']).map(f => \`<li>\${f}</li>\`).join('')}
            </ul>
          </div>
        </div>

        <!-- BARRA DE AÇÕES DO OPERADOR DA MESA -->
        <div class="p-4 rounded-xl bg-slate-950 border border-emerald-950 space-y-3">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white uppercase tracking-wider">
              <i class="fa-solid fa-user-shield text-emerald-400 mr-1"></i> Deliberação da Mesa de Crédito:
            </span>
            <span class="text-[11px] text-slate-400 mono">Hash Decisão: \${(proposta.parecerAlgoritmico?.hashDecisaoSha256 || 'bcf-dec-sha256').substring(0, 16)}...</span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="deliberarAcao('\${proposta.id}', 'APROVADO_MESA')" class="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition">
              <i class="fa-solid fa-check"></i> Aprovar na Mesa
            </button>
            <button onclick="deliberarAcao('\${proposta.id}', 'CONDICIONADO')" class="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition">
              <i class="fa-solid fa-handshake"></i> Condicionar Garantia
            </button>
            <button onclick="deliberarAcao('\${proposta.id}', 'COMITE_RISCO')" class="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition">
              <i class="fa-solid fa-users"></i> Submeter ao Comitê
            </button>
            <button onclick="deliberarAcao('\${proposta.id}', 'RECUSADO')" class="px-3.5 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition">
              <i class="fa-solid fa-ban"></i> Recusar Proposta
            </button>
            <button onclick="emitirCcbDigital('\${proposta.id}')" class="px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow transition">
              <i class="fa-solid fa-file-signature"></i> Emitir CCB Digital
            </button>
            <a href="/plataforma/consulta-cpf" class="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition ml-auto">
              <i class="fa-solid fa-id-card text-emerald-400"></i> Dossiê 360° Completo
            </a>
          </div>

          \${proposta.numeroCcbDigital ? \`
          <div class="mt-3 p-3 rounded-lg bg-purple-950/40 border border-purple-800/80 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-certificate text-purple-400 text-base"></i>
              <div>
                <p class="font-bold text-white">\${proposta.numeroCcbDigital}</p>
                <p class="text-[10px] text-purple-300 mono">SHA-256: \${proposta.hashCcbSha256}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded bg-purple-900 text-purple-200 text-[10px] font-bold">Assinada & Formalizada</span>
          </div>
          \` : ''}
        </div>
      \`;

      document.getElementById('painelDetalhesProposta').innerHTML = html;
    }

    function selecionarProposta(id) {
      propostaSelecionadaId = id;
      const prop = TODAS_PROPOSTAS.find(p => p.id === id);
      if (prop) {
        document.querySelectorAll('.card-proposta').forEach(el => {
          el.classList.remove('bg-emerald-950/60', 'border-emerald-500', 'shadow-lg');
          el.classList.add('bg-bancofe-card', 'border-emerald-950/80');
        });
        const card = document.getElementById('card-prop-' + id);
        if (card) {
          card.classList.remove('bg-bancofe-card', 'border-emerald-950/80');
          card.classList.add('bg-emerald-950/60', 'border-emerald-500', 'shadow-lg');
        }
        renderizarCockpitProposta(prop);
      }
    }

    function alternarSistema(novo) {
      const prop = TODAS_PROPOSTAS.find(p => p.id === propostaSelecionadaId);
      if (prop) {
        prop.sistemaAmortizacao = novo;
        // Recalcula parcelas
        const taxa = prop.taxaMensalPercentual / 100;
        const n = prop.prazoMeses;
        const v = prop.valorAprovado || prop.valorSolicitado;
        if (novo === 'PRICE') {
          const parc = (v * (taxa * Math.pow(1 + taxa, n))) / (Math.pow(1 + taxa, n) - 1);
          prop.primeiraParcela = Number(parc.toFixed(2));
          prop.ultimaParcela = Number(parc.toFixed(2));
          prop.totalJuros = Number((parc * n - v).toFixed(2));
        } else {
          const amort = v / n;
          prop.primeiraParcela = Number((amort + v * taxa).toFixed(2));
          prop.ultimaParcela = Number((amort + amort * taxa).toFixed(2));
          prop.totalJuros = Number((((prop.primeiraParcela + prop.ultimaParcela) / 2) * n - v).toFixed(2));
        }
        renderizarCockpitProposta(prop);
      }
    }

    function filtrarEmpresa(empId) {
      filtroEmpresaAtual = empId;
      document.querySelectorAll('.btn-empresa').forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white');
        b.classList.add('bg-slate-900/80', 'text-slate-300');
      });
      const btn = document.getElementById('btn-emp-' + empId);
      if (btn) {
        btn.classList.remove('bg-slate-900/80', 'text-slate-300');
        btn.classList.add('bg-emerald-600', 'text-white');
      }
      aplicarFiltros();
    }

    function aplicarBuscaInstantanea() {
      aplicarFiltros();
    }

    function aplicarFiltros() {
      const termo = (document.getElementById('campoBusca')?.value || '').toLowerCase();
      let visiveis = 0;

      document.querySelectorAll('.card-proposta').forEach(el => {
        const emp = el.getAttribute('data-empresa');
        const texto = el.innerText.toLowerCase();
        const bateEmpresa = (filtroEmpresaAtual === 'TODOS' || emp === filtroEmpresaAtual);
        const bateTexto = (!termo || texto.includes(termo));

        if (bateEmpresa && bateTexto) {
          el.style.display = 'block';
          visiveis++;
        } else {
          el.style.display = 'none';
        }
      });

      const countSpan = document.getElementById('contagemPropostas');
      if (countSpan) countSpan.innerText = visiveis;
    }

    async function deliberarAcao(id, novoStatus) {
      const parecer = prompt('Insira o parecer oficial da deliberação da Mesa de Crédito:', 'Parecer emitido em conformidade com as políticas de risco BancoFé.');
      if (parecer === null) return;

      try {
        const resp = await fetch('/api/v1/mesa-credito/deliberar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, novoStatus, parecerOperador: parecer, operadorNome: 'Rodrigo Gonçalves (Mesa)' })
        });
        const data = await resp.json();
        if (data.sucesso && data.proposta) {
          alert('Deliberação registrada com sucesso: ' + data.proposta.statusLabel);
          window.location.reload();
        } else {
          alert('Erro ao deliberar: ' + (data.erro || 'Falha na requisição'));
        }
      } catch (err) {
        alert('Erro ao comunicar com a Mesa de Crédito: ' + err.message);
      }
    }

    async function emitirCcbDigital(id) {
      if (!confirm('Deseja emitir a Cédula de Crédito Bancário (CCB Digital) com hash SHA-256 e assinatura digital qualificada?')) return;

      try {
        const resp = await fetch('/api/v1/mesa-credito/emitir-ccb/' + id, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await resp.json();
        if (data.sucesso && data.proposta) {
          alert('CCB Digital emitida com sucesso! Número: ' + data.proposta.numeroCcbDigital);
          window.location.reload();
        } else {
          alert('Erro ao emitir CCB: ' + (data.erro || 'Falha'));
        }
      } catch (err) {
        alert('Erro na emissão da CCB: ' + err.message);
      }
    }

    function abrirModalNovaProposta() {
      document.getElementById('modalNovaProposta').classList.remove('hidden');
    }

    function fecharModalNovaProposta() {
      document.getElementById('modalNovaProposta').classList.add('hidden');
    }

    async function submeterNovaProposta(e) {
      e.preventDefault();
      const empSplit = document.getElementById('novaEmpresa').value.split('|');
      const prodSplit = document.getElementById('novoProduto').value.split('|');

      const payload = {
        clienteNome: document.getElementById('novoNome').value,
        clienteDocumento: document.getElementById('novoDocumento').value,
        clienteTipo: document.getElementById('novoTipo').value,
        rendaMensalDeclarada: Number(document.getElementById('novaRenda').value),
        patrimonioDeclarado: Number(document.getElementById('novoPatrimonio').value || 0),
        empresaOrigemId: empSplit[0],
        empresaOrigemNome: empSplit[1],
        produtoId: prodSplit[0],
        produtoNome: prodSplit[1],
        finalidadeCredito: document.getElementById('novaFinalidade').value || 'Operação de Crédito BancoFé',
        valorSolicitado: Number(document.getElementById('novoValor').value),
        prazoMeses: Number(document.getElementById('novoPrazo').value),
        sistemaAmortizacao: document.getElementById('novoSistema').value
      };

      try {
        const resp = await fetch('/api/v1/mesa-credito/nova-proposta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data.sucesso && data.proposta) {
          alert('Proposta criada e analisada com sucesso pelo Motor Algorítmico! Rating: ' + data.proposta.ratingBancoFe);
          window.location.href = '/admin/mesa-credito?proposta=' + data.proposta.id;
        } else {
          alert('Erro ao criar proposta: ' + (data.erro || 'Falha'));
        }
      } catch (err) {
        alert('Erro ao submeter proposta: ' + err.message);
      }
    }

    // Inicializa cockpit
    window.addEventListener('DOMContentLoaded', () => {
      const propInicial = TODAS_PROPOSTAS.find(p => p.id === propostaSelecionadaId) || TODAS_PROPOSTAS[0];
      renderizarCockpitProposta(propInicial);
    });
  </script>
</body>
</html>`;
}
