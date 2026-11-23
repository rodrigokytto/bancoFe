/**
 * Renderiza o Backoffice Corporativo Multi-Empresa (/admin/backoffice)
 * Holding BancoFé, Kytto, Zuma, Casa Nova, Agro UISA, Dino e Stallone
 */
export function renderizarHtmlBackoffice(usuario?: any): string {
  const nomeUsuario = usuario?.nome || "Rodrigo Ribeiro Gonçalves";
  const emailUsuario = usuario?.email || "rrodrigogon@gmail.com";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ERP Backoffice Completo • Holding BancoFé & Ecossistema Kytto</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0b1118; color: #f1f5f9; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .card-glass {
      background: rgba(18, 26, 38, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .card-hover:hover {
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#0b1118] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">

  <!-- TOPBAR INSTITUCIONAL -->
  <header class="sticky top-0 z-50 bg-[#0e1724]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo e Identificação -->
      <div class="flex items-center gap-3">
        <a href="/admin/backoffice" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 group-hover:scale-105 transition">
            <i class="fa-solid fa-building-columns text-emerald-100"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-extrabold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
              <span class="text-xs px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase tracking-wider">Backoffice ERP</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium">Holding & Negócios • GCP & Render Sincronizados</p>
          </div>
        </a>
      </div>

      <!-- Links Rápidos de Navegação -->
      <nav class="hidden lg:flex items-center gap-2 text-sm font-semibold">
        <a href="/plataforma/consulta-cpf" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5">
          <i class="fa-solid fa-id-card text-emerald-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5">
          <i class="fa-solid fa-user-plus text-teal-400"></i> Pré-Cadastro Casa Nova
        </a>
        <a href="/gestao-emprestimos" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5">
          <i class="fa-solid fa-hand-holding-dollar text-amber-400"></i> Empréstimos CDC
        </a>
        <a href="/portal-cliente" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5">
          <i class="fa-solid fa-users text-blue-400"></i> Portal do Cliente
        </a>
        <a href="/admin/modulos" class="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1.5">
          <i class="fa-solid fa-cubes text-purple-400"></i> Módulos
        </a>
      </nav>

      <!-- Usuário e Status -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col text-right">
          <span class="text-xs font-bold text-slate-200">${nomeUsuario}</span>
          <span class="text-[11px] text-emerald-400 font-mono">${emailUsuario}</span>
        </div>
        <a href="/logout" class="px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-bold transition flex items-center gap-1.5">
          <i class="fa-solid fa-right-from-bracket"></i> Sair
        </a>
      </div>
    </div>
  </header>

  <!-- CORPO PRINCIPAL -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

    <!-- HERO BANNER COM STATUS MULTI-CLOUD -->
    <div class="card-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-br from-[#12202e] via-[#0e1724] to-[#0a121c]">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <i class="fa-solid fa-circle-check mr-1 text-emerald-400"></i> Produção Operacional Ativa
            </span>
            <span class="px-2.5 py-1 rounded-md text-xs font-mono text-slate-300 bg-slate-800/80 border border-slate-700">
              CNPJ: 53.338.003/0001-04 • Nova Olímpia & Tangará da Serra/MT
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ERP Corporativo & Cockpit de Operações Multi-Negócio
          </h1>
          <p class="text-sm text-slate-300 mt-1 max-w-3xl">
            Visão unificada das verticais da holding: Operações Financeiras BancoFé, Zuma Gastronomia, Casa Nova Imóveis, Agropecuária UISA, Barbearia Dino e Stallone.
          </p>
        </div>

        <!-- Badges de Infraestrutura Conectada -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div class="px-4 py-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Google Cloud Run</p>
              <p class="text-xs font-bold text-emerald-300 font-mono">southamerica-east1</p>
            </div>
          </div>
          <div class="px-4 py-3 rounded-xl bg-slate-900/90 border border-teal-500/30 flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-teal-400"></div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Render & PostgreSQL</p>
              <p class="text-xs font-bold text-teal-300 font-mono">oregon-global</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KPIs CONSOLIDADOS DA HOLDING -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card-glass rounded-xl p-5 border-l-4 border-emerald-500">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Carteira de Crédito Ativa</p>
        <p class="text-2xl font-black text-white mt-1 font-mono">R$ 845.020,50</p>
        <p class="text-xs text-emerald-400 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-arrow-trend-up"></i> 142 contratos vigentes (CDC)
        </p>
      </div>

      <div class="card-glass rounded-xl p-5 border-l-4 border-teal-500">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Base Pré-Cadastro Casa Nova</p>
        <p class="text-2xl font-black text-white mt-1 font-mono">4.820 clientes</p>
        <p class="text-xs text-teal-400 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-users-viewfinder"></i> Contatos qualificados & leads
        </p>
      </div>

      <div class="card-glass rounded-xl p-5 border-l-4 border-amber-500">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Consultas 360 de CPF</p>
        <p class="text-2xl font-black text-white mt-1 font-mono">1.428 consultas</p>
        <p class="text-xs text-amber-400 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-shield-halved"></i> Birôs, Receita & Score SCR
        </p>
      </div>

      <div class="card-glass rounded-xl p-5 border-l-4 border-purple-500">
        <p class="text-xs font-bold uppercase tracking-wider text-slate-400">Módulos no Catálogo</p>
        <p class="text-2xl font-black text-white mt-1 font-mono">38 módulos</p>
        <p class="text-xs text-purple-400 mt-1 flex items-center gap-1">
          <i class="fa-solid fa-cubes-stacked"></i> 100% no ar & homologados
        </p>
      </div>
    </div>

    <!-- SEÇÃO DE MÓDULOS DE NEGÓCIO E AÇÕES RÁPIDAS -->
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-black text-white flex items-center gap-2">
            <i class="fa-solid fa-shapes text-emerald-400"></i> Verticais Integradas da Holding
          </h2>
          <p class="text-xs text-slate-400">Clique para abrir qualquer ferramenta operacional em produção</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <!-- CARD 1: BANCOFÉ OPERAÇÕES FINANCEIRAS -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
                <i class="fa-solid fa-landmark"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
                Financeira & Hub de Crédito
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">BancoFé Operações Financeiras</h3>
            <p class="text-xs text-slate-300 mt-1">
              Vertical bancária e de crédito da holding: opera a Esteira Oficial de Pré-Cadastro (integrada com 100% da base de interessados e proponentes de Casa Nova Imóveis), Gestão de Empréstimos CDC, Boletos com Código de Barras, DICT Pix e Vault Seguro.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/plataforma/precadastro" class="block w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-user-check mr-1.5"></i> Esteira de Pré-Cadastro (Base Casa Nova)
              </a>
              <a href="/gestao-emprestimos" class="block w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-sliders mr-1.5"></i> Gestão de Empréstimos & Contratos
              </a>
              <a href="/plataforma/consulta-cpf" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-magnifying-glass mr-1.5"></i> Consulta 360 CPF & Bureaus
              </a>
              <a href="/portal-cliente" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-user mr-1.5"></i> Portal do Cliente & Boletos
              </a>
              <a href="/termos-digitais" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-file-contract mr-1.5"></i> Central de Termos & Vault Seguro
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 2: CONSULTA 360 & BIRÔS DE CRÉDITO -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-teal-500/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-2xl border border-teal-500/30">
                <i class="fa-solid fa-fingerprint"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-950 text-teal-300 border border-teal-700/60 uppercase">
                Compliance & Birôs
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Consulta 360 CPF & Empresas</h3>
            <p class="text-xs text-slate-300 mt-1">
              Dossiê cadastral profundo: situação Receita Federal, Score Serasa/SPC, Registrato SCR Bacen, Protestos em Cartórios e bens móveis/imóveis vinculados.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/plataforma/consulta-cpf" class="block w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-magnifying-glass mr-1.5"></i> Abrir Consulta 360 CPF
              </a>
              <a href="/plataforma/carteira" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-wallet mr-1.5"></i> Carteira Digital & Conciliação
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 3: CASA NOVA IMÓVEIS & PRÉ-CADASTRO -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-blue-500/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl border border-blue-500/30">
                <i class="fa-solid fa-house-chimney"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-700/60 uppercase">
                Imobiliária & Lançamentos
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Casa Nova Imóveis & Construtora</h3>
            <p class="text-xs text-slate-300 mt-1">
              Imobiliária, Incorporadora e Construtora: captação de imóveis, loteamentos em Tangará da Serra e originação contínua de cadastros e leads imobiliários, processados e financiados diretamente pelo módulo do BancoFé Operações Financeiras.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/plataforma/precadastro" class="block w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-users-viewfinder mr-1.5"></i> Ver Cadastros de Casa Nova no BancoFé
              </a>
              <a href="/plataforma/clientes-potenciais" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-crosshairs mr-1.5"></i> Radar de Prospecção Regional
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 4: ZUMA PILOT GASTRONOMIA -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-amber-500/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                <i class="fa-solid fa-utensils"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
                Gastronomia & PDV
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Zuma Cozinha Oriental</h3>
            <p class="text-xs text-slate-300 mt-1">
              Sistema gastronômico completo em Tangará da Serra: PDV balcão, controle de mesas e comandas, KDS da cozinha, motor de rotas e entrega com suporte a chuva.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/admin" class="block w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-cash-register mr-1.5"></i> Abrir PDV & Cockpit Salão
              </a>
              <a href="/admin/modulos" class="block w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center border border-slate-700 transition">
                <i class="fa-solid fa-layer-group mr-1.5"></i> Configurações do Cardápio
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 5: AGROPECUÁRIA & CANA UISA -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-emerald-600/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-600/30">
                <i class="fa-solid fa-wheat-awn"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
                Agronegócio & Agro Open
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Agropecuária & Cana de Açúcar</h3>
            <p class="text-xs text-slate-300 mt-1">
              Operações agropecuárias UISA em Nova Olímpia: contratos de safra, insumos agrícolas, antecipação de recebíveis do agronegócio e eventos Agro Open TTC.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/admin/modulos" class="block w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-tractor mr-1.5"></i> Gestão de Contratos de Safra
              </a>
            </div>
          </div>
        </div>

        <!-- CARD 6: CENTRAL DEVOPS & GIT MCP -->
        <div class="card-glass rounded-2xl p-6 card-hover transition border border-purple-500/30 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl border border-purple-500/30">
                <i class="fa-solid fa-code-branch"></i>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60 uppercase">
                DevOps & MCP
              </span>
            </div>
            <h3 class="text-lg font-bold text-white">Central Soberana Git & DevOps</h3>
            <p class="text-xs text-slate-300 mt-1">
              Controle de sincronização GitHub, 18 ferramentas de protocolo MCP ativas, webhooks automatizados e pipeline de integração contínua GCP e Render.
            </p>
            <div class="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <a href="/git" class="block w-full py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center transition">
                <i class="fa-solid fa-terminal mr-1.5"></i> Abrir Painel Git & DevOps
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- TABELA DE EMPRESAS CADASTRADAS NO BANCO DE DADOS -->
    <div class="card-glass rounded-2xl p-6 border border-slate-800">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-network-wired text-emerald-400"></i> Empresas & Tenants Registrados na Holding
          </h3>
          <p class="text-xs text-slate-400">Banco de Dados PostgreSQL Kytto Commerce Core • 100% dos tenants habilitados</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          6 Empresas Ativas
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-900/60 text-xs uppercase font-bold text-slate-400 border-b border-slate-800">
            <tr>
              <th class="py-3 px-4">Empresa / Tenant</th>
              <th class="py-3 px-4">CNPJ</th>
              <th class="py-3 px-4">Vertical</th>
              <th class="py-3 px-4">Localização</th>
              <th class="py-3 px-4">Módulos</th>
              <th class="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-medium">
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-emerald-400"></i> BancoFé Operações Financeiras
              </td>
              <td class="py-3 px-4 font-mono text-xs">53.338.003/0001-04</td>
              <td class="py-3 px-4">Operações Financeiras & Crédito</td>
              <td class="py-3 px-4">Nova Olímpia / Tangará - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">Pré-Cadastro Casa Nova, CDC, 360, Vault</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-bowl-rice text-amber-400"></i> Zuma Cozinha Oriental
              </td>
              <td class="py-3 px-4 font-mono text-xs">36.296.848/0001-57</td>
              <td class="py-3 px-4">Gastronomia & Delivery</td>
              <td class="py-3 px-4">Tangará da Serra - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">PDV, KDS, Mesas</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-building text-blue-400"></i> Casa Nova Imóveis & Construtora
              </td>
              <td class="py-3 px-4 font-mono text-xs">03.882.498/0001-10</td>
              <td class="py-3 px-4">Imobiliária & Lançamentos</td>
              <td class="py-3 px-4">Tangará da Serra - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">CRM, Imóveis, Roleta Leads</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-seedling text-emerald-400"></i> Agropecuária UISA & Cana
              </td>
              <td class="py-3 px-4 font-mono text-xs">43.084.070/0001-88</td>
              <td class="py-3 px-4">Agronegócio & Eventos</td>
              <td class="py-3 px-4">Nova Olímpia - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">Safra, Contratos</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-scissors text-teal-400"></i> Barbearia Dino
              </td>
              <td class="py-3 px-4 font-mono text-xs">50.073.355/0001-89</td>
              <td class="py-3 px-4">Estética & Serviços</td>
              <td class="py-3 px-4">Tangará da Serra - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">Agenda, WhatsApp IA</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
            <tr class="hover:bg-slate-800/40 transition">
              <td class="py-3 px-4 font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-dumbbell text-purple-400"></i> Stallone Nutre Sport
              </td>
              <td class="py-3 px-4 font-mono text-xs">56.099.531/0001-38</td>
              <td class="py-3 px-4">Nutrição & Suplementos</td>
              <td class="py-3 px-4">Tangará da Serra - MT</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded text-xs bg-emerald-950 text-emerald-300">Produtos, Estoque</span></td>
              <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 font-bold">No Ar</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <!-- FOOTER SOBERANO -->
  <footer class="border-t border-slate-800/80 bg-[#070b10] py-6 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>Sessão Segura TLS 1.3 • Auditoria BACEN / COSIF & DPO LGPD • Rodrigo Gonçalves • Nova Olímpia/MT</p>
      <p class="font-mono text-emerald-400/80">Google Cloud (southamerica-east1) × Render (oregon)</p>
    </div>
  </footer>

</body>
</html>
`;
}
