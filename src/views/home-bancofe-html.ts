import { ServicoMesaCredito, PropostaMesaCredito } from "../credito/servico-mesa-credito.js";

/**
 * Tela Inicial Oficial e Painel Executivo 360° do BancoFé
 * Layout Verde Institucional (#071510, #0c4a34, #059669, #10b981)
 * Holding BancoFé S/A e Consolidação das 12 Empresas
 */
export function renderizarHtmlHomeBancoFe(usuario?: any): string {
  const servicoMesa = ServicoMesaCredito.getInstance();
  const metricas = servicoMesa.obterMetricas();
  const propostas = servicoMesa.listarPropostas().slice(0, 8); // 8 propostas mais recentes para stream

  const nomeUsuario = usuario?.nome || "Rodrigo Ribeiro Gonçalves";
  const emailUsuario = usuario?.email || "rrodrigogon@gmail.com";
  const propostasJson = JSON.stringify(propostas);

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>BancoFé • Holding S/A & Ecossistema Bancário 360°</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font Awesome Pro Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  
  <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            bancofe: {
              deep: '#040d0a',
              dark: '#071510',
              forest: '#0c4a34',
              surface: '#0f291e',
              emerald: '#059669',
              light: '#10b981',
              neon: '#34d399',
              gold: '#d4af37',
              border: 'rgba(16, 185, 129, 0.22)'
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>
  
  <style>
    body {
      background-color: #040d0a;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
    }
    
    .glass-card {
      background: linear-gradient(135deg, rgba(12, 74, 52, 0.45) 0%, rgba(7, 21, 16, 0.85) 100%);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(16, 185, 129, 0.20);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6);
    }
    
    .glass-card-hover {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glass-card-hover:hover {
      transform: translateY(-3px);
      border-color: rgba(52, 211, 153, 0.45);
      box-shadow: 0 15px 35px -5px rgba(5, 150, 105, 0.25);
    }

    .kpi-gradient {
      background: linear-gradient(180deg, rgba(12, 74, 52, 0.5) 0%, rgba(7, 21, 16, 0.95) 100%);
      border: 1px solid rgba(16, 185, 129, 0.22);
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #040d0a;
    }
    ::-webkit-scrollbar-thumb {
      background: #0c4a34;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #059669;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">

  <!-- ============================================================== -->
  <!-- 1. TOPBAR INSTITUCIONAL BANCOFÉ (VERDE INSTITUCIONAL)          -->
  <!-- ============================================================== -->
  <header class="sticky top-0 z-50 bg-[#071510]/95 backdrop-blur-md border-b border-emerald-900/60 shadow-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Marca & Identidade Holding -->
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-950/60 border border-emerald-300/40 group-hover:scale-105 transition">
            <i class="fa-solid fa-scale-balanced text-emerald-950 text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-black tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
              <span class="px-2 py-0.5 rounded text-[10px] font-black tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 uppercase">
                Holding 360°
              </span>
            </div>
            <p class="text-[10px] text-emerald-400/80 font-medium tracking-wide">Ecossistema Bancário & Multi-Negócio • PRD</p>
          </div>
        </a>
      </div>

      <!-- Navegação Rápida entre Módulos Estratégicos -->
      <nav class="hidden xl:flex items-center gap-1.5 text-xs font-bold">
        <a href="/" class="px-3 py-1.5 rounded-lg text-emerald-300 bg-emerald-900/60 border border-emerald-700/60 transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-house"></i> Home
        </a>
        <a href="/admin/mesa-credito" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-scale-balanced text-emerald-400"></i> Mesa de Crédito
        </a>
        <a href="/admin/crm-financeira" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-briefcase text-emerald-400"></i> Operações & CRM
        </a>
        <a href="/admin/ecommerce" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-store text-emerald-400"></i> E-Commerce
        </a>
        <a href="/admin/cadastro-360" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-id-card-clip text-emerald-400"></i> Cadastro 360
        </a>
        <a href="/consulta-360" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-magnifying-glass text-teal-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-calculator text-emerald-400"></i> Pré-Cadastro
        </a>
        <a href="/admin" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-cubes text-emerald-400"></i> Gestão Módulos
        </a>
        <a href="/plataforma/carteira" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-emerald-300 hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-wallet text-emerald-400"></i> Carteira PIX
        </a>
        <a href="/admin/backoffice" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-teal-300 hover:bg-teal-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-server text-teal-400"></i> Backoffice
        </a>
      </nav>

      <!-- Botão de Ação & Perfil do Operador -->
      <div class="flex items-center gap-3">
        <button onclick="abrirModalNovaSimulacao()" class="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/60 flex items-center gap-1.5">
          <i class="fa-solid fa-plus text-xs"></i> Simular / Proposta
        </button>

        <div class="hidden md:flex items-center gap-2 pl-2 border-l border-emerald-900/60">
          <div class="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
            RG
          </div>
          <div class="flex flex-col text-right">
            <span class="text-xs font-bold text-white leading-tight">${nomeUsuario}</span>
            <span class="text-[10px] text-emerald-400 font-mono tracking-tighter">MASTER • PRD SÃO PAULO</span>
          </div>
        </div>

        <a href="/logout" title="Sair da Plataforma" class="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800/80 transition">
          <i class="fa-solid fa-right-from-bracket text-xs"></i>
        </a>
      </div>

    </div>
  </header>

  <!-- ============================================================== -->
  <!-- 2. CORPO PRINCIPAL COM COCKPIT EXECUTIVO & LAYOUT VERDE       -->
  <!-- ============================================================== -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

    <!-- SUB-BARRA DE STATUS REGULATÓRIO & INFRAESTRUTURA -->
    <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
      <div class="flex flex-wrap items-center gap-2">
        <span class="px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/50 flex items-center gap-1.5 font-bold">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Motor Algorítmico CMN 2.682/99 &amp; SCR Bacen Ativo
        </span>
        <span class="px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-800 flex items-center gap-1.5 font-mono">
          <i class="fa-solid fa-shield-halved text-emerald-400"></i>
          48/48 Bases Governamentais &amp; Bancárias Conectadas
        </span>
        <span class="px-2.5 py-1 rounded-md bg-slate-900/80 text-slate-300 border border-slate-800 font-mono">
          <i class="fa-solid fa-cloud text-teal-400"></i> Cloud Run southamerica-east1
        </span>
      </div>

      <div class="flex items-center gap-2">
        <a href="/admin/mesa-credito" class="px-3 py-1 rounded-md bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/60 font-bold transition flex items-center gap-1 text-[11px]">
          <i class="fa-solid fa-scale-balanced text-emerald-400"></i> Ir para Mesa de Crédito
        </a>
        <a href="/admin" class="px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold transition flex items-center gap-1 text-[11px]">
          <i class="fa-solid fa-sliders text-emerald-400"></i> Módulos por Negócio
        </a>
      </div>
    </div>

    <!-- HERO BANNER INSTITUCIONAL DA HOLDING BANCOFÉ -->
    <div class="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-emerald-500/30">
      <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Holding de Participações &amp; Operações Financeiras S/A
            </span>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800">
              CNPJ: 53.338.003/0001-04 • Nova Olímpia &amp; Tangará da Serra/MT
            </span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Banco<span class="text-emerald-400">Fé</span> • Ecossistema Corporativo 360°
          </h1>

          <p class="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Plataforma executiva centralizadora de tecnologia bancária (BaaS), mesa algorítmica de crédito e risco CMN 2.682/99, 
            formalização de CCBs Digitais, cofre de custódia documental (Vault SHA-256) e consolidação operacional das 
            <strong class="text-emerald-300">12 empresas e verticais da holding</strong>.
          </p>

          <div class="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400 font-medium">
            <span><i class="fa-solid fa-user-tie text-emerald-400 mr-1.5"></i><strong>Diretoria Estatutária:</strong> Rodrigo Ribeiro Gonçalves (Presidente)</span>
            <span><i class="fa-solid fa-building text-teal-400 mr-1.5"></i><strong>Sócia-Administradora:</strong> Patrícia Ferrari Paulino Gonçalves</span>
            <span><i class="fa-solid fa-location-dot text-amber-400 mr-1.5"></i><strong>Polo MT:</strong> Tangará da Serra / Parecis</span>
          </div>
        </div>

        <!-- Ações Rápidas em Destaque -->
        <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
          <button onclick="abrirModalNovaSimulacao()" class="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2">
            <i class="fa-solid fa-calculator text-base"></i> Nova Simulação SAC / PRICE
          </button>
          <a href="/admin/mesa-credito" class="w-full px-5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 font-bold text-xs transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-scale-balanced text-emerald-400"></i> Acessar Cockpit da Mesa
          </a>
          <a href="/plataforma/consulta-cpf" class="w-full px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2">
            <i class="fa-solid fa-id-card text-teal-400"></i> Consulta 360 CPF &amp; CNPJ
          </a>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- 3. CARDS DE KPIS CONSOLIDADOS DA HOLDING (DADOS REAIS & CALCULADOS) -->
    <!-- ============================================================== -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      
      <!-- KPI 1: Volume Global -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-emerald-500 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Volume Global</span>
          <i class="fa-solid fa-vault text-emerald-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
          R$ 18.010.000
        </div>
        <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
          <i class="fa-solid fa-arrow-trend-up"></i> Gestão corporativa
        </div>
      </div>

      <!-- KPI 2: Em Análise na Mesa -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-amber-500 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Em Análise (Fila)</span>
          <i class="fa-solid fa-hourglass-half text-amber-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-amber-300 font-mono tracking-tight">
          R$ 9.480.000
        </div>
        <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
          <span>16 propostas na fila</span>
        </div>
      </div>

      <!-- KPI 3: Aprovado na Mesa -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-teal-400 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Aprovado Mesa</span>
          <i class="fa-solid fa-circle-check text-teal-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-teal-300 font-mono tracking-tight">
          R$ 8.530.000
        </div>
        <div class="text-[10px] text-teal-400 mt-1 flex items-center gap-1 font-medium">
          <span>Pronto para CCB</span>
        </div>
      </div>

      <!-- KPI 4: Carteira Ativa CDC -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-emerald-400 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Carteira Ativa</span>
          <i class="fa-solid fa-file-contract text-emerald-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-emerald-300 font-mono tracking-tight">
          R$ 3.840.000
        </div>
        <div class="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
          <span>142 contratos vigentes</span>
        </div>
      </div>

      <!-- KPI 5: Base Proponentes -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-purple-500 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Proponentes 360°</span>
          <i class="fa-solid fa-users text-purple-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-purple-300 font-mono tracking-tight">
          4.820 clientes
        </div>
        <div class="text-[10px] text-purple-400 mt-1 flex items-center gap-1 font-medium">
          <span>Casa Nova &amp; Agro UISA</span>
        </div>
      </div>

      <!-- KPI 6: Perda Esperada (EL) -->
      <div class="kpi-gradient rounded-xl p-4 border-l-4 border-emerald-600 glass-card-hover">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">
          <span>Perda Esperada EL</span>
          <i class="fa-solid fa-shield-virus text-emerald-400"></i>
        </div>
        <div class="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
          0.52% a.a.
        </div>
        <div class="text-[10px] text-emerald-300 mt-1 flex items-center gap-1 font-medium">
          <span>Rating Predominante AAA</span>
        </div>
      </div>

    </div>

    <!-- ============================================================== -->
    <!-- 4. BUSCA RÁPIDA 360° & ENTRADA DE SIMULAÇÃO INSTANTÂNEA        -->
    <!-- ============================================================== -->
    <div class="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-r from-[#071510] via-[#0c4a34]/30 to-[#071510]">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="w-full md:w-1/3">
          <h2 class="text-base font-extrabold text-white flex items-center gap-2">
            <i class="fa-solid fa-bolt text-amber-400"></i> Consulta Rápida 360° &amp; Risco
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">Audite qualquer CPF ou CNPJ em 48 bases em menos de 1 segundo.</p>
        </div>

        <div class="w-full md:w-2/3 flex flex-col sm:flex-row items-center gap-2.5">
          <div class="relative w-full">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs"></i>
            <input 
              type="text" 
              id="inputBuscaRapida" 
              placeholder="Digite o CPF ou CNPJ (ex: 305.871.628-13 ou 11.222.333/0001-44)" 
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-900/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition font-mono"
              onkeypress="if(event.key === 'Enter') executarBuscaRapida()"
            >
          </div>
          <button onclick="executarBuscaRapida()" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shrink-0">
            <i class="fa-solid fa-arrow-right"></i> Auditar no 360°
          </button>
        </div>
      </div>

      <!-- Atalhos de Proponentes Homologados -->
      <div class="mt-4 pt-3 border-t border-emerald-900/40 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-slate-400 text-[11px] font-bold"><i class="fa-solid fa-bookmark text-emerald-400 mr-1"></i>Exemplos Rápidos:</span>
        <button onclick="preencherBusca('305.871.628-13')" class="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono transition">
          Rodrigo Gonçalves (Presidente)
        </button>
        <button onclick="preencherBusca('11.222.333/0001-44')" class="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono transition">
          Fazenda Santa Lúcia (UISA Agro)
        </button>
        <button onclick="preencherBusca('000.000.009-49')" class="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono transition">
          Dr. Carlos Eduardo (Casa Nova Imóveis)
        </button>
        <button onclick="preencherBusca('18.491.204/0001-55')" class="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 text-[11px] font-mono transition">
          Construtora Ultra &amp; Obras
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- 5. OS 4 GRANDES PILARES DE NEGÓCIO DO BANCOFÉ (CARDS DE DESTAQUE) -->
    <!-- ============================================================== -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i class="fa-solid fa-layer-group text-emerald-400"></i> Pilares Centrais do Ecossistema BancoFé
          </h2>
          <p class="text-xs text-slate-400">Acesso direto aos motores algorítmicos, esteiras de crédito e custódia pericial.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- PILAR 1: Mesa de Crédito & Financiamentos -->
        <div class="glass-card rounded-2xl p-5 border border-emerald-500/30 glass-card-hover flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl mb-4 shadow-lg shadow-emerald-950/60">
              <i class="fa-solid fa-scale-balanced"></i>
            </div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-black text-white">Mesa de Crédito 360°</h3>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase">CMN 2.682</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Motor de risco algorítmico, classificação de rating AAA a D, simulações SAC/PRICE, esteira de 16 propostas e emissão de CCB Digital com hash SHA-256.
            </p>
            <div class="space-y-1.5 text-xs font-mono text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-emerald-900/40">
              <div class="flex justify-between">
                <span class="text-slate-400">Fila da Mesa:</span>
                <span class="font-bold text-amber-300">R$ 9.480.000,00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Taxa Média:</span>
                <span class="font-bold text-emerald-400">1.06% a.m.</span>
              </div>
            </div>
          </div>
          <a href="/admin/mesa-credito" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40">
            <span>Acessar Mesa de Crédito</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

        <!-- PILAR 2: Operações Financeiras & CRM 360° -->
        <div class="glass-card rounded-2xl p-5 border border-purple-500/30 glass-card-hover flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xl mb-4 shadow-lg shadow-purple-950/60">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-black text-white">Operações &amp; CRM 360°</h3>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 uppercase">Kanban</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Funil de originação de crédito em 6 fases de esteira visual, alçadas executivas, SLA de atendimento, trava CERC de recebíveis e pós-venda.
            </p>
            <div class="space-y-1.5 text-xs font-mono text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-purple-900/40">
              <div class="flex justify-between">
                <span class="text-slate-400">Fases Esteira:</span>
                <span class="font-bold text-purple-300">6 Estágios Ativos</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">SLA Médio:</span>
                <span class="font-bold text-emerald-400">4h Resolução</span>
              </div>
            </div>
          </div>
          <a href="/admin/crm-financeira" class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/40">
            <span>Abrir CRM &amp; Esteira</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

        <!-- PILAR 3: Cadastro 360° & Vault Documental -->
        <div class="glass-card rounded-2xl p-5 border border-teal-500/30 glass-card-hover flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 text-xl mb-4 shadow-lg shadow-teal-950/60">
              <i class="fa-solid fa-id-card-clip"></i>
            </div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-black text-white">Cadastro 360 &amp; Vault</h3>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 uppercase">13 Certidões</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Dossiê cadastral pericial, cofre criptográfico com as 13 certidões obrigatórias, aceite digital de Termos SCR Bacen e KYC/AML automatizado.
            </p>
            <div class="space-y-1.5 text-xs font-mono text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-teal-900/40">
              <div class="flex justify-between">
                <span class="text-slate-400">Cofre de Certidões:</span>
                <span class="font-bold text-teal-300">13 Negativas OK</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Assinatura Digital:</span>
                <span class="font-bold text-emerald-400">SHA-256 ICP-BR</span>
              </div>
            </div>
          </div>
          <a href="/admin/cadastro-360" class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs transition text-center flex items-center justify-center gap-1.5 shadow-md shadow-teal-950/40">
            <span>Acessar Cadastro &amp; Vault</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

        <!-- PILAR 4: Gestão de Módulos por Linha de Negócio -->
        <div class="glass-card rounded-2xl p-5 border border-emerald-600/30 glass-card-hover flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xl mb-4 shadow-lg shadow-emerald-950/60">
              <i class="fa-solid fa-cubes"></i>
            </div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-black text-white">Gestão de Módulos</h3>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase">33 Módulos</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Console multi-tenant para adicionar, modificar parâmetros, ativar ou excluir módulos operacionais de cada uma das 12 empresas da holding.
            </p>
            <div class="space-y-1.5 text-xs font-mono text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div class="flex justify-between">
                <span class="text-slate-400">Linhas de Negócio:</span>
                <span class="font-bold text-white">9 Homologadas</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Conectores:</span>
                <span class="font-bold text-emerald-400">48 Operacionais</span>
              </div>
            </div>
          </div>
          <a href="/admin" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition text-center flex items-center justify-center gap-1.5 border border-emerald-800/60">
            <span>Abrir Painel de Módulos</span>
            <i class="fa-solid fa-arrow-right text-[10px]"></i>
          </a>
        </div>

      </div>
    </div>

    <!-- ============================================================== -->
    <!-- 6. MATRIZ CONSOLIDADA DAS 12 EMPRESAS & VERTICAIS DA HOLDING   -->
    <!-- ============================================================== -->
    <div class="glass-card rounded-2xl p-6 border border-emerald-500/20">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-building-columns text-emerald-400"></i> 12 Empresas &amp; Verticais da Holding BancoFé
          </h2>
          <p class="text-xs text-slate-300">Estrutura societária e operacional consolidada no polo Nova Olímpia / Tangará da Serra - MT.</p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5 text-xs">
          <button onclick="filtrarEmpresas('todas')" class="btn-filtro-empresa active px-3 py-1 rounded-lg bg-emerald-600 text-slate-950 font-black transition text-[11px]" data-filtro="todas">
            Todas (12)
          </button>
          <button onclick="filtrarEmpresas('fintech')" class="btn-filtro-empresa px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold transition text-[11px]" data-filtro="fintech">
            Fintech &amp; Crédito (3)
          </button>
          <button onclick="filtrarEmpresas('imob')" class="btn-filtro-empresa px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold transition text-[11px]" data-filtro="imob">
            Imobiliário &amp; Obras (2)
          </button>
          <button onclick="filtrarEmpresas('agro')" class="btn-filtro-empresa px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold transition text-[11px]" data-filtro="agro">
            Agro &amp; Indústria (1)
          </button>
          <button onclick="filtrarEmpresas('varejo')" class="btn-filtro-empresa px-3 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-bold transition text-[11px]" data-filtro="varejo">
            Varejo &amp; Serviços (6)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="gridEmpresas">
        
        <!-- EMPRESA 1: BancoFé Digital & Banking Core -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="fintech">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">Fintech Core</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 53.338.003/0001-04</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-building-columns text-emerald-400"></i> 1. BancoFé Digital &amp; Banking Core
            </h4>
            <p class="text-xs text-slate-300 mt-1">Plataforma central de BaaS, contas PJ/PF, chave Pix DICT, liquidação bancária e boletos híbridos.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">Carteira PIX</span>
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">QR Code Bacen</span>
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">Drex Web3</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-emerald-400 font-bold font-mono">10 Módulos Ativos</span>
            <a href="/plataforma/carteira" class="text-xs text-emerald-300 hover:underline font-bold flex items-center gap-1">Acessar <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 2: BancoFé Operações Financeiras -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="fintech">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60 uppercase">Crédito &amp; CRM</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 53.338.003/0001-04</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-scale-balanced text-purple-400"></i> 2. BancoFé Operações Financeiras
            </h4>
            <p class="text-xs text-slate-300 mt-1">Mesa de Crédito SAC/PRICE, esteira de propostas, formalização de CCB Digital e antecipação de recebíveis.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">Mesa de Risco</span>
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">CCB Lei 10.931</span>
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">Trava CERC</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-purple-400 font-bold font-mono">R$ 8.53M Aprovados</span>
            <a href="/admin/mesa-credito" class="text-xs text-purple-300 hover:underline font-bold flex items-center gap-1">Acessar <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 3: BancoFé Cadastro 360 & Vault -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="fintech">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60 uppercase">Governança &amp; Vault</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 53.338.003/0001-04</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-id-card-clip text-teal-400"></i> 3. BancoFé Cadastro 360 &amp; Vault
            </h4>
            <p class="text-xs text-slate-300 mt-1">Auditoria pericial de KYC/AML, custódia no cofre criptográfico com 13 certidões e gestão de Termos SCR Bacen.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">13 Certidões</span>
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">Termo SCR</span>
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">Vault SHA-256</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-teal-400 font-bold font-mono">48 Fontes Ativas</span>
            <a href="/admin/cadastro-360" class="text-xs text-teal-300 hover:underline font-bold flex items-center gap-1">Acessar <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 4: Casa Nova Imóveis & Financiamentos -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="imob">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700/60 uppercase">Imobiliário</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 08.941.233/0001-90</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-house-chimney text-blue-400"></i> 4. Casa Nova Imóveis &amp; Financiamentos
            </h4>
            <p class="text-xs text-slate-300 mt-1">Imobiliária líder regional (Tangará da Serra), 20 proponentes migrados para o BancoFé e crédito habitacional SBPE/MCMV.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300">20 Proponentes</span>
              <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300">SBPE Habitacional</span>
              <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300">Roleta de Leads</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-blue-400 font-bold font-mono">R$ 2.16M em Análise</span>
            <a href="/admin/mesa-credito?empresa=Casa+Nova+Imóveis+%26+Financiamentos" class="text-xs text-blue-300 hover:underline font-bold flex items-center gap-1">Ver Propostas <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 5: Agropecuária UISA & Biorrefinaria -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="agro">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">Agro &amp; Safra</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 15.009.178/0001-70</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-wheat-awn text-emerald-400"></i> 5. Agropecuária UISA &amp; Biorrefinaria
            </h4>
            <p class="text-xs text-slate-300 mt-1">Biorrefinaria de cana e bioeletricidade (Nova Olímpia), CPR Verde de Soja e Milho e convênio folha de 3.500 colaboradores.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">CPR Verde</span>
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">Barter Agro</span>
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300">3.500 Vidas</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-emerald-400 font-bold font-mono">R$ 7.68M em Operações</span>
            <a href="/admin/mesa-credito?empresa=Agro+%26+Crédito+Rural+(UISA+Biorrefinaria)" class="text-xs text-emerald-300 hover:underline font-bold flex items-center gap-1">Ver Propostas <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 6: Construtora Ultra & Engenharia -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="imob">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">Engenharia &amp; Obras</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 18.491.204/0001-55</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-helmet-safety text-amber-400"></i> 6. Construtora Ultra &amp; Incorporadora
            </h4>
            <p class="text-xs text-slate-300 mt-1">Engenharia civil, obras verticais, condomínios fechados, laudos periciais de medição e repasses CNO/SERO.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300">Medição de Obras</span>
              <span class="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300">CNO / SERO</span>
              <span class="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300">Loteamentos</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-amber-400 font-bold font-mono">R$ 4.20M em Análise</span>
            <a href="/admin/mesa-credito?empresa=Construtora+Ultra+%26+Incorporadora" class="text-xs text-amber-300 hover:underline font-bold flex items-center gap-1">Ver Propostas <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 7: Dino Barbearia & Varejo Multi-Negócio -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="varejo">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60 uppercase">Varejo &amp; Serviços</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 24.891.044/0001-12</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-scissors text-teal-400"></i> 7. Dino Barbearia &amp; Varejo Multi-Negócio
            </h4>
            <p class="text-xs text-slate-300 mt-1">Estética masculina, clube de assinatura recorrente via PIX BancoFé, barbearia executiva e agendamento inteligente.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">Clube Recorrente</span>
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">WhatsApp IA</span>
              <span class="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300">Franquias</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-teal-400 font-bold font-mono">180 Assinantes</span>
            <a href="/admin/mesa-credito?empresa=Dino+Barbearia+%26+Varejo+Multi-Negócio" class="text-xs text-teal-300 hover:underline font-bold flex items-center gap-1">Ver Operação <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 8: Zuma Cozinha Oriental & Gastronomia -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="varejo">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 uppercase">Gastronomia</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 36.296.848/0001-57</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-bowl-food text-rose-400"></i> 8. Zuma Cozinha Oriental &amp; Gastronomia
            </h4>
            <p class="text-xs text-slate-300 mt-1">Operação gastronômica 360°, gestão de 27 mesas, Frente de Caixa PDV Touch, KDS de 4 praças e App do Garçom.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300">27 Mesas</span>
              <span class="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300">KDS Cozinha</span>
              <span class="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300">PDV Touch</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-rose-400 font-bold font-mono">4 Módulos Ativos</span>
            <a href="/admin/mesa-credito?empresa=Zuma+Cozinha+Oriental+%26+Gastronomia" class="text-xs text-rose-300 hover:underline font-bold flex items-center gap-1">Ver Operação <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 9: Zuma Moda, Roupas & Boutique -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="varejo">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60 uppercase">Moda &amp; Boutique</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 36.296.848/0001-57</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-shirt text-purple-400"></i> 9. Zuma Moda, Roupas &amp; Boutique
            </h4>
            <p class="text-xs text-slate-300 mt-1">Varejo de moda e vestuário premium, crediário próprio BancoFé, controle de coleções e catálogo inteligente.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">Crediário Próprio</span>
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">Boutique</span>
              <span class="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300">PDV Moda</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-purple-400 font-bold font-mono">2 Módulos Ativos</span>
            <a href="/admin/mesa-credito?empresa=Zuma+Moda%2C+Roupas+%26+Boutique" class="text-xs text-purple-300 hover:underline font-bold flex items-center gap-1">Ver Operação <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 10: Dr. Clima & Refrigeração Comercial -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="varejo">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 uppercase">Engenharia Térmica</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 41.520.100/0001-88</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-snowflake text-cyan-400"></i> 10. Dr. Clima &amp; Engenharia Térmica
            </h4>
            <p class="text-xs text-slate-300 mt-1">Climatização de precisão, PMOC hospitalar e comercial, câmaras frigoríficas Anvisa e telemetria IoT.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300">Telemetria IoT</span>
              <span class="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300">PMOC</span>
              <span class="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300">Frio Anvisa</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-cyan-400 font-bold font-mono">Monitoramento Ao Vivo</span>
            <a href="/telemetria" class="text-xs text-cyan-300 hover:underline font-bold flex items-center gap-1">Ver IoT <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 11: Stallone Franquias & Expansão -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="varejo">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-700/60 uppercase">Franquias &amp; Fitness</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 45.890.112/0001-33</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-dumbbell text-orange-400"></i> 11. Stallone Franquias &amp; Fitness
            </h4>
            <p class="text-xs text-slate-300 mt-1">Nutrição esportiva, academia, suplementação e repasse de royalties de franquias automatizado via split de pagamento BancoFé.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-orange-950/80 text-orange-300">Split Pagamentos</span>
              <span class="px-2 py-0.5 rounded bg-orange-950/80 text-orange-300">Recorrência</span>
              <span class="px-2 py-0.5 rounded bg-orange-950/80 text-orange-300">Royalties</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-orange-400 font-bold font-mono">Split Automático</span>
            <a href="/admin" class="text-xs text-orange-300 hover:underline font-bold flex items-center gap-1">Ver Módulo <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

        <!-- EMPRESA 12: Kytto Tech & Inovação Digital -->
        <div class="empresa-card p-4 rounded-xl bg-slate-900/70 border border-emerald-900/60 hover:border-emerald-500/40 transition flex flex-col justify-between" data-cat="fintech">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 uppercase">Tecnologia &amp; AI</span>
              <span class="text-[11px] font-mono text-slate-400">CNPJ: 50.073.355/0001-80</span>
            </div>
            <h4 class="text-sm font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-code text-indigo-400"></i> 12. Kytto Tech &amp; Inovação Digital
            </h4>
            <p class="text-xs text-slate-300 mt-1">Fábrica de software, arquitetura de microsserviços, conectores MCP, Git CI/CD DevOps e modelos de inteligência artificial.</p>
            <div class="mt-3 flex flex-wrap gap-1 text-[10px]">
              <span class="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300">Git DevOps</span>
              <span class="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300">Protocolo MCP</span>
              <span class="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300">AI Gemini</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-indigo-400 font-bold font-mono">100% CI/CD</span>
            <a href="/git" class="text-xs text-indigo-300 hover:underline font-bold flex items-center gap-1">Ver Git <i class="fa-solid fa-chevron-right text-[9px]"></i></a>
          </div>
        </div>

      </div>
    </div>

    <!-- ============================================================== -->
    <!-- 7. STREAM DE PROPOSTAS RECENTES NA MESA DE CRÉDITO            -->
    <!-- ============================================================== -->
    <div class="glass-card rounded-2xl p-6 border border-emerald-500/20">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-400"></i> Fila Operacional da Mesa de Crédito (Ao Vivo)
          </h2>
          <p class="text-xs text-slate-300">Últimas propostas em deliberação com classificação de risco e amortização.</p>
        </div>

        <a href="/admin/mesa-credito" class="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold text-xs transition flex items-center gap-1.5">
          <span>Abrir Mesa Completa (16)</span>
          <i class="fa-solid fa-arrow-right text-[10px]"></i>
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-900/80 uppercase font-black text-slate-400 border-b border-emerald-900/60 text-[10px] tracking-wider">
            <tr>
              <th class="py-3 px-3">Protocolo</th>
              <th class="py-3 px-3">Tomador / Documento</th>
              <th class="py-3 px-3">Vertical / Empresa</th>
              <th class="py-3 px-3">Produto</th>
              <th class="py-3 px-3">Valor Solicitado</th>
              <th class="py-3 px-3 text-center">Score / Rating</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-emerald-950/60 font-medium">
            ${propostas.map((p: PropostaMesaCredito) => `
              <tr class="hover:bg-emerald-950/30 transition">
                <td class="py-3 px-3 font-mono font-bold text-emerald-400 text-[11px]">${p.codigoProtocolo || p.id}</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-white text-xs">${p.clienteNome}</div>
                  <div class="font-mono text-[10px] text-slate-400">${p.clienteDocumento}</div>
                </td>
                <td class="py-3 px-3 text-slate-300 text-[11px]">${p.empresaOrigemNome}</td>
                <td class="py-3 px-3 text-emerald-300 text-[11px] font-semibold">${p.produtoNome}</td>
                <td class="py-3 px-3 font-mono font-bold text-white text-xs">
                  ${p.valorSolicitado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  <div class="text-[10px] text-slate-400 font-normal">${p.prazoMeses}x • ${p.taxaMensalPercentual}% a.m. (${p.sistemaAmortizacao})</div>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${p.ratingBancoFe === 'AAA' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-blue-950 text-blue-300 border border-blue-700'}">
                    ${p.ratingBancoFe} (${p.scoreBancoFe})
                  </span>
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                    p.status === 'FORMALIZADO_CCB' ? 'bg-purple-950 text-purple-300 border border-purple-700' :
                    p.status === 'APROVADO_MESA' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
                    'bg-amber-950 text-amber-300 border border-amber-700'
                  }">
                    ${p.statusLabel || p.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td class="py-3 px-3 text-right">
                  <a href="/admin/mesa-credito?proposta=${p.id}" class="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-[11px] font-bold transition inline-flex items-center gap-1">
                    Auditar <i class="fa-solid fa-arrow-right text-[9px]"></i>
                  </a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- 8. SIMULADOR SAC / PRICE RÁPIDO EMBUTIDO                       -->
    <!-- ============================================================== -->
    <div class="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-[#0c4a34]/30 via-[#071510] to-[#040d0a]">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-extrabold text-white flex items-center gap-2">
            <i class="fa-solid fa-calculator text-emerald-400"></i> Simulador Rápido de Financiamento SAC vs PRICE
          </h2>
          <p class="text-xs text-slate-300">Cálculo instantâneo de parcelas, juros, amortização e CET conforme diretrizes Bacen.</p>
        </div>

        <div class="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-emerald-900/60">
          <button id="btnSimPrice" onclick="alterarSistemaSimulador('PRICE')" class="px-4 py-1.5 rounded-lg text-xs font-black transition text-slate-400 hover:text-white">
            Tabela PRICE (Fixa)
          </button>
          <button id="btnSimSac" onclick="alterarSistemaSimulador('SAC')" class="px-4 py-1.5 rounded-lg text-xs font-black transition bg-emerald-600 text-slate-950">
            Tabela SAC (Decrescente)
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Valor do Crédito (R$)</label>
          <input type="number" id="simValor" value="500000" step="10000" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/80 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold" oninput="calcularSimuladorRapido()">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prazo Contratual (Meses)</label>
          <input type="number" id="simPrazo" value="36" min="6" max="360" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/80 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold" oninput="calcularSimuladorRapido()">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa Mensal (% a.m.)</label>
          <input type="number" id="simTaxa" value="1.06" step="0.05" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/80 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold" oninput="calcularSimuladorRapido()">
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Renda Declarada Mensal (R$)</label>
          <input type="number" id="simRenda" value="85000" step="5000" class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-900/80 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 font-bold" oninput="calcularSimuladorRapido()">
        </div>
      </div>

      <!-- Resultados do Cálculo -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-emerald-900/50">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">1ª Parcela Estimada</p>
          <p id="resPrimeiraParcela" class="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">R$ 19.188,89</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Última Parcela Estimada</p>
          <p id="resUltimaParcela" class="text-base sm:text-lg font-black text-teal-300 font-mono mt-0.5">R$ 14.035,56</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Total de Juros</p>
          <p id="resTotalJuros" class="text-base sm:text-lg font-black text-slate-200 font-mono mt-0.5">R$ 98.050,00</p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Comprometimento DTI</p>
          <p id="resComprometimentoDti" class="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">22.5% da Renda</p>
        </div>
      </div>
    </div>

  </main>

  <!-- ============================================================== -->
  <!-- 9. MODAL DE NOVA SIMULAÇÃO & PROPOSTA (INSTANTÂNEO)           -->
  <!-- ============================================================== -->
  <div id="modalNovaSimulacao" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="bg-[#071510] border border-emerald-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
      <div class="flex items-center justify-between pb-4 border-b border-emerald-900/60 mb-4">
        <h3 class="text-base font-extrabold text-white flex items-center gap-2">
          <i class="fa-solid fa-calculator text-emerald-400"></i> Nova Simulação &amp; Proposta na Mesa de Crédito
        </h3>
        <button onclick="fecharModalNovaSimulacao()" class="text-slate-400 hover:text-white transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <form id="formNovaSimulacao" onsubmit="submeterNovaSimulacao(event)" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Nome Completo / Razão Social *</label>
            <input type="text" id="modalNome" required placeholder="Ex: Cooperativa de Grãos do Vale" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">CPF ou CNPJ *</label>
            <input type="text" id="modalDoc" required placeholder="00.000.000/0001-00" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white font-mono focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Tipo de Tomador</label>
            <select id="modalTipo" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
              <option value="PJ">Pessoa Jurídica (PJ)</option>
              <option value="PF">Pessoa Física (PF)</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Renda / Faturamento (R$) *</label>
            <input type="number" id="modalRenda" required placeholder="Ex: 85000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white font-mono focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Patrimônio Declarado (R$)</label>
            <input type="number" id="modalPatrimonio" placeholder="Ex: 1200000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white font-mono focus:outline-none focus:border-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Empresa / Vertical de Origem</label>
            <select id="modalEmpresa" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
              <option value="Casa Nova Imóveis">Casa Nova Imóveis &amp; Financiamentos</option>
              <option value="Agro & Crédito Rural (UISA Biorrefinaria)">Agro &amp; Crédito Rural (UISA Biorrefinaria)</option>
              <option value="BancoFe — Operações Financeiras & CRM">BancoFé — Operações Financeiras &amp; CRM</option>
              <option value="Construtora Ultra & Incorporadora">Construtora Ultra &amp; Incorporadora</option>
              <option value="Dino Barbearia & Varejo Multi-Negócio">Dino Barbearia &amp; Varejo Multi-Negócio</option>
              <option value="Zuma Cozinha Oriental & Gastronomia">Zuma Cozinha Oriental &amp; Gastronomia</option>
              <option value="Zuma Moda, Roupas & Boutique">Zuma Moda, Roupas &amp; Boutique</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Produto Financeiro</label>
            <select id="modalProduto" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
              <option value="Financiamento Imobiliário SBPE">Financiamento Imobiliário SBPE</option>
              <option value="Cédula de Produto Rural (CPR-F)">Cédula de Produto Rural (CPR-F)</option>
              <option value="Capital de Giro PJ">Capital de Giro PJ</option>
              <option value="Crédito Direto ao Consumidor (CDC)">Crédito Direto ao Consumidor (CDC)</option>
              <option value="Home Equity (Garantia de Imóvel)">Home Equity (Garantia de Imóvel)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-300 font-bold mb-1">Valor Solicitado (R$) *</label>
            <input type="number" id="modalValor" required placeholder="Ex: 500000" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white font-mono focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Prazo (Meses) *</label>
            <input type="number" id="modalPrazo" required value="36" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white font-mono focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-slate-300 font-bold mb-1">Sistema de Amortização</label>
            <select id="modalAmortizacao" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
              <option value="PRICE">Tabela PRICE (Fixa)</option>
              <option value="SAC">Tabela SAC (Decrescente)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-slate-300 font-bold mb-1">Finalidade da Operação</label>
          <input type="text" id="modalFinalidade" placeholder="Ex: Expansão de infraestrutura e compra de estoque de insumos" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-emerald-900 text-white focus:outline-none focus:border-emerald-500">
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-emerald-900/60">
          <button type="button" onclick="fecharModalNovaSimulacao()" class="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/60">
            <i class="fa-solid fa-play"></i> Rodar Análise &amp; Criar Proposta
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- ============================================================== -->
  <!-- 10. RODAPÉ INSTITUCIONAL DA HOLDING BANCOFÉ                   -->
  <!-- ============================================================== -->
  <footer class="mt-12 border-t border-emerald-950 bg-[#030806] py-8 text-xs text-slate-400">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm">
            BF
          </div>
          <div>
            <p class="font-extrabold text-white text-sm">BANCOFÉ PARTICIPAÇÕES &amp; OPERAÇÕES FINANCEIRAS S/A</p>
            <p class="text-[11px] text-slate-400">Correspondente Bancário Multibancos • Instituição de Pagamento • BaaS</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-4 text-[11px]">
          <span class="text-emerald-400 font-mono"><i class="fa-solid fa-server mr-1"></i>Google Cloud Run São Paulo</span>
          <span><i class="fa-solid fa-shield-halved mr-1 text-emerald-400"></i>Criptografia TLS 1.3 / SHA-256</span>
          <span><i class="fa-solid fa-landmark mr-1 text-emerald-400"></i>Resolução CMN 2.682/99</span>
        </div>
      </div>
      <div class="border-t border-emerald-950/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
        <p>© 2026 BancoFé S/A. Todos os direitos reservados. CNPJ: 53.338.003/0001-04 • Nova Olímpia &amp; Tangará da Serra/MT.</p>
        <p>Diretoria Estatutária: Rodrigo Ribeiro Gonçalves (Presidente) • Patrícia Ferrari Paulino Gonçalves (Sócia-Administradora).</p>
      </div>
    </div>
  </footer>

  <!-- ============================================================== -->
  <!-- 11. SCRIPT DE INTERATIVIDADE, CÁLCULO & FILTROS                -->
  <!-- ============================================================== -->
  <script>
    let sistemaAmortizacaoAtual = 'SAC';

    function preencherBusca(termo) {
      document.getElementById('inputBuscaRapida').value = termo;
    }

    function executarBuscaRapida() {
      const termo = document.getElementById('inputBuscaRapida').value.trim();
      if (!termo) {
        alert('Por favor, informe um CPF ou CNPJ para auditar.');
        return;
      }
      const limpo = termo.replace(/\\D/g, '');
      window.location.href = '/plataforma/consulta-cpf?documento=' + encodeURIComponent(limpo || termo);
    }

    function abrirModalNovaSimulacao() {
      document.getElementById('modalNovaSimulacao').classList.remove('hidden');
    }

    function fecharModalNovaSimulacao() {
      document.getElementById('modalNovaSimulacao').classList.add('hidden');
    }

    function filtrarEmpresas(categoria) {
      document.querySelectorAll('.btn-filtro-empresa').forEach(b => {
        if (b.dataset.filtro === categoria) {
          b.classList.remove('bg-emerald-950/70', 'text-emerald-300', 'border', 'border-emerald-800/60');
          b.classList.add('bg-emerald-600', 'text-slate-950', 'font-black');
        } else {
          b.classList.remove('bg-emerald-600', 'text-slate-950', 'font-black');
          b.classList.add('bg-emerald-950/70', 'text-emerald-300', 'border', 'border-emerald-800/60');
        }
      });

      const cards = document.querySelectorAll('.empresa-card');
      cards.forEach(card => {
        if (categoria === 'todas' || card.dataset.cat === categoria) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }

    function alterarSistemaSimulador(sistema) {
      sistemaAmortizacaoAtual = sistema;
      const btnPrice = document.getElementById('btnSimPrice');
      const btnSac = document.getElementById('btnSimSac');

      if (sistema === 'PRICE') {
        btnPrice.className = 'px-4 py-1.5 rounded-lg text-xs font-black transition bg-emerald-600 text-slate-950';
        btnSac.className = 'px-4 py-1.5 rounded-lg text-xs font-black transition text-slate-400 hover:text-white';
      } else {
        btnSac.className = 'px-4 py-1.5 rounded-lg text-xs font-black transition bg-emerald-600 text-slate-950';
        btnPrice.className = 'px-4 py-1.5 rounded-lg text-xs font-black transition text-slate-400 hover:text-white';
      }
      calcularSimuladorRapido();
    }

    function calcularSimuladorRapido() {
      const P = parseFloat(document.getElementById('simValor').value) || 0;
      const n = parseInt(document.getElementById('simPrazo').value) || 1;
      const taxaMes = (parseFloat(document.getElementById('simTaxa').value) || 0) / 100;
      const renda = parseFloat(document.getElementById('simRenda').value) || 1;

      let p1 = 0;
      let pN = 0;
      let totalJuros = 0;

      if (sistemaAmortizacaoAtual === 'PRICE') {
        if (taxaMes === 0) {
          p1 = P / n;
          pN = p1;
          totalJuros = 0;
        } else {
          const fator = Math.pow(1 + taxaMes, n);
          p1 = P * ((taxaMes * fator) / (fator - 1));
          pN = p1;
          totalJuros = (p1 * n) - P;
        }
      } else {
        // SAC
        const amortizacaoConstante = P / n;
        const juros1 = P * taxaMes;
        p1 = amortizacaoConstante + juros1;
        const jurosN = amortizacaoConstante * taxaMes;
        pN = amortizacaoConstante + jurosN;
        totalJuros = (n * (juros1 + jurosN)) / 2;
      }

      const dti = (p1 / renda) * 100;

      document.getElementById('resPrimeiraParcela').textContent = p1.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('resUltimaParcela').textContent = pN.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('resTotalJuros').textContent = totalJuros.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('resComprometimentoDti').textContent = dti.toFixed(1) + '% da Renda';
    }

    async function submeterNovaSimulacao(event) {
      event.preventDefault();
      const payload = {
        nomeTomador: document.getElementById('modalNome').value,
        documentoTomador: document.getElementById('modalDoc').value,
        tipoPessoa: document.getElementById('modalTipo').value,
        rendaMensalDeclarada: parseFloat(document.getElementById('modalRenda').value),
        patrimonioDeclarado: parseFloat(document.getElementById('modalPatrimonio').value) || 0,
        empresaGrupo: document.getElementById('modalEmpresa').value,
        produto: document.getElementById('modalProduto').value,
        valorSolicitado: parseFloat(document.getElementById('modalValor').value),
        prazoMeses: parseInt(document.getElementById('modalPrazo').value),
        taxaMensalSugerida: 1.06,
        sistemaAmortizacao: document.getElementById('modalAmortizacao').value,
        finalidade: document.getElementById('modalFinalidade').value || 'Operação de Crédito Estruturado BancoFé'
      };

      try {
        const res = await fetch('/api/v1/mesa-credito/nova-proposta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.sucesso) {
          alert('Proposta gerada com sucesso na Mesa de Crédito! Protocolo: ' + data.proposta.id);
          window.location.href = '/admin/mesa-credito?proposta=' + data.proposta.id;
        } else {
          alert('Erro ao criar proposta: ' + (data.erro || 'Falha no servidor'));
        }
      } catch (err) {
        alert('Erro ao comunicar com a Mesa de Crédito: ' + err.message);
      }
    }

    // Inicialização do simulador ao carregar
    window.addEventListener('DOMContentLoaded', () => {
      calcularSimuladorRapido();
    });
  </script>
</body>
</html>`;
}
