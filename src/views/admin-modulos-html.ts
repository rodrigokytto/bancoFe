/**
 * Renderiza o Painel Administrativo Corporativo do BancoFé (/admin)
 * Permite gerenciar 100% das linhas de negócio e módulos do ecossistema:
 * - BancoFé Digital & Banking Core
 * - BancoFe — Operações Financeiras & CRM 360°
 * - BancoFe — Cadastro 360°, Vault & Compliance
 * - Casa Nova Imóveis & Crédito Habitacional
 * - Agro & Crédito Rural (UISA / Biorrefinaria)
 * - Construtora Ultra & Engenharia
 * - Dino Barbearia & Varejo Multi-Negócio
 * - Zuma Cozinha Oriental & Gastronomia
 * - Zuma Moda, Roupas & Boutique
 */
export function renderizarHtmlAdminModulos(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Corporativo • Gestão de Módulos por Negócio • BancoFé</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .bg-bancofe-dark { background-color: #071510; }
    .bg-bancofe-primary { background-color: #0c4a34; }
    .border-nubank { border-color: #820ad1; }
    .text-nubank { color: #820ad1; }
    .bg-nubank { background-color: #820ad1; }
    .bg-nubank-subtle { background-color: rgba(130, 10, 209, 0.08); }
    .card-transition { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col antialiased">

  <!-- TOPBAR DE ALTA GOVERNANÇA -->
  <header class="bg-bancofe-dark text-white border-b border-emerald-950/80 sticky top-0 z-50 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Admin Console -->
      <div class="flex items-center gap-3 shrink-0">
        <a href="/admin" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-emerald-400/30">
            <i class="fa-solid fa-building-columns text-emerald-100"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">Admin Console</span>
            </div>
            <p class="text-[11px] text-slate-400">Gestão Global Multi-Negócio & Governança</p>
          </div>
        </a>
      </div>

      <!-- Navegação Principal com Módulos Estratégicos -->
      <nav class="hidden xl:flex items-center gap-1 text-xs font-semibold">
        <a href="/admin/crm-financeira" class="px-2.5 py-1.5 rounded-lg text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/60 transition flex items-center gap-1.5 shadow-sm" title="Operações Financeiras & CRM 360">
          <i class="fa-solid fa-briefcase text-purple-400"></i>
          <span>Operações & CRM</span>
          <span class="px-1.5 py-0.2 rounded text-[9px] bg-purple-600 text-white font-bold">360°</span>
        </a>
        <a href="/admin/mesa-credito" class="px-2.5 py-1.5 rounded-lg text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-800/60 transition flex items-center gap-1.5 shadow-sm" title="Mesa de Crédito & Financiamentos">
          <i class="fa-solid fa-scale-balanced text-emerald-400"></i>
          <span>Mesa de Crédito</span>
        </a>
        <a href="/admin/cadastro-360" class="px-2.5 py-1.5 rounded-lg text-purple-200 bg-purple-950/60 hover:bg-purple-900/70 border border-purple-800/60 transition flex items-center gap-1.5 shadow-sm" title="Cadastro 360, Pré-Cadastro & Vault Documental">
          <i class="fa-solid fa-id-card-clip text-purple-400"></i>
          <span>Cadastro 360° & Vault</span>
        </a>
        <a href="/admin/termos" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5" title="Central de Termos Contratuais & SCR Bacen">
          <i class="fa-solid fa-file-shield text-emerald-400"></i> Termos & SCR
        </a>
        <a href="/plataforma/consulta-cpf" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-magnifying-glass-chart text-emerald-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-user-check text-emerald-400"></i> Pré-Cadastro
        </a>
        <a href="/admin" class="px-2.5 py-1.5 rounded-lg bg-emerald-900/70 text-emerald-200 border border-emerald-600/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-cubes text-emerald-400"></i> Gestão de Módulos
        </a>
        <a href="/plataforma/carteira" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-wallet text-emerald-400"></i> Carteira PIX
        </a>
        <a href="/" class="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5" title="Ir para o Cockpit Geral SPA">
          <i class="fa-solid fa-gauge-high text-teal-400"></i> Cockpit Geral
        </a>
      </nav>

      <!-- Perfil Operador & Ações -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-200">Rodrigo Gonçalves</p>
          <div class="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ROOT-MASTER • PRD</span>
          </div>
        </div>
        <a href="/login" class="p-2 rounded-lg bg-slate-900/80 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition" title="Sair ou Trocar Usuário">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

    <!-- CABEÇALHO DO PAINEL -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-purple-100 text-purple-900 border border-purple-200">
            <i class="fa-solid fa-building-columns mr-1 text-purple-700"></i>Painel Administrativo Multi-Negócio
          </span>
          <span class="text-xs text-slate-500">• Google Cloud Run (southamerica-east1)</span>
          <span class="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-800">100% PRD Ativo</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          Gestão de Módulos por Linha de Negócio
        </h1>
        <p class="text-sm text-slate-600 mt-1 max-w-3xl">
          Adicione, modifique parâmetros, ative/inative ou remova módulos sob demanda para cada empresa e vertical do ecossistema BancoFe, integrando originação de crédito, CRM, compliance PLD-FT, governança de dados e operações.
        </p>
      </div>

      <!-- Ações Principais -->
      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <button onclick="abrirModalAdicionarNegocio()" class="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm border border-slate-800">
          <i class="fa-solid fa-plus text-purple-400"></i> + Nova Linha de Negócio
        </button>
        <button onclick="abrirModalAdicionarModulo()" class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-cube"></i> + Adicionar Módulo ao Negócio
        </button>
      </div>
    </div>

    <!-- KPIS CONSOLIDADOS EM TEMPO REAL -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Linhas de Negócio</p>
          <p class="text-3xl font-extrabold text-slate-900 mt-1" id="kpi-negocios">9</p>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <i class="fa-solid fa-circle-check"></i>
          <span>100% homologadas em PRD</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Módulos Ativos</p>
          <p class="text-3xl font-extrabold text-emerald-700 mt-1" id="kpi-modulos-ativos">31</p>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <i class="fa-solid fa-bolt text-amber-500"></i>
          <span>Operação simultânea em tempo real</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Módulos</p>
          <p class="text-3xl font-extrabold text-slate-900 mt-1" id="kpi-modulos-total">31</p>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <i class="fa-solid fa-cubes text-purple-600"></i>
          <span id="kpi-modulos-inativos">0 inativos</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conectores Oficiais</p>
          <p class="text-3xl font-extrabold text-purple-700 mt-1">48 / 48</p>
        </div>
        <div class="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <i class="fa-solid fa-shield-check text-emerald-600"></i>
          <span>100% Operacionais (0 falhas)</span>
        </div>
      </div>
    </div>

    <!-- SELETOR HORIZONTAL DE NEGÓCIOS (CARDS / TABS) -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group text-slate-400"></i> Selecione a Linha de Negócio para Gestão:
        </h3>
        <span class="text-xs text-slate-400">Clique para alternar o painel</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" id="container-seletor-negocios">
        <!-- Renderizado dinamicamente via JS -->
      </div>
    </div>

    <!-- PAINEL DETALHADO DO NEGÓCIO ATUAL -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      
      <!-- Cabeçalho do Negócio -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div class="flex items-start sm:items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md shrink-0" id="negocio-icone-container">
            <i class="fa-solid fa-building-columns" id="negocio-icone"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-xl font-bold text-slate-900" id="negocio-nome">BancoFé Digital</h2>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white" id="negocio-badge">Fintech</span>
            </div>
            <p class="text-xs text-slate-500 font-mono mt-0.5" id="negocio-cnpj">CNPJ: 53.338.003/0001-04</p>
          </div>
        </div>
        <div class="lg:text-right max-w-xl">
          <p class="text-xs text-slate-600" id="negocio-desc">
            Plataforma central de banking, crédito inteligente, contas digitais e meios de pagamento.
          </p>
          <div class="mt-2 flex items-center lg:justify-end gap-2 text-[11px]">
            <span class="text-slate-400">Endpoint Base:</span>
            <span class="font-mono text-emerald-700 font-semibold" id="negocio-url">https://erp-bancofe-5xsi5uyoda-rj.a.run.app</span>
          </div>
        </div>
      </div>

      <!-- Barra de Ações do Negócio -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-sm text-slate-900 flex items-center gap-2">
            <i class="fa-solid fa-cubes text-emerald-600"></i> Módulos Habilitados para este Negócio
          </h3>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700" id="contador-modulos-negocio">
            5 módulos
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="abrirModalAdicionarModuloParaAtual()" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-plus text-[10px]"></i> Adicionar Módulo Aqui
          </button>
        </div>
      </div>

      <!-- GRID DE MÓDULOS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="grid-modulos-negocio">
        <!-- Injetado dinamicamente via JS -->
      </div>
    </div>

  </main>

  <!-- MODAL ADICIONAR MÓDULO -->
  <div id="modal-add-modulo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div class="bg-bancofe-dark text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-cube text-emerald-400"></i>
          <h3 class="font-bold text-base">Adicionar Novo Módulo ao Negócio</h3>
        </div>
        <button onclick="fecharModalAdicionarModulo()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form id="form-add-modulo" onsubmit="salvarModulo(event)" class="p-6 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Negócio de Destino *</label>
          <select id="modal-select-negocio" name="negocioId" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold bg-slate-50">
            <!-- Opções via JS -->
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nome do Módulo *</label>
            <input type="text" name="nome" required placeholder="Ex.: Esteira de CPR Rural" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Código Único (Identificador) *</label>
            <input type="text" name="codigo" required placeholder="Ex.: CPR_RURAL_V1" class="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Descrição das Funcionalidades *</label>
          <textarea name="descricao" rows="2" required placeholder="Descreva os objetivos, integrações e ações do módulo..." class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Categoria *</label>
            <select name="categoria" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="credito">Crédito & Financiamento</option>
              <option value="consulta">Consulta & KYC/AML</option>
              <option value="operacao">Operação & Leads</option>
              <option value="financeiro">Financeiro & Pagamentos</option>
              <option value="compliance">Compliance & Notarial</option>
              <option value="integracao">Integração de APIs</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rota / Endpoint URL *</label>
            <input type="text" name="rotaUrl" id="add-rota-url" required value="/admin/crm-financeira" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ícone FontAwesome</label>
            <input type="text" name="icone" value="fa-cube" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <!-- Atalhos rápidos de rota -->
        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Atalhos de rotas prontas:</p>
          <div class="flex flex-wrap gap-1.5 text-[10px]">
            <button type="button" onclick="setAddRota('/admin/crm-financeira')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 font-medium">/admin/crm-financeira</button>
            <button type="button" onclick="setAddRota('/admin/cadastro-360')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-purple-700 hover:bg-purple-50 font-medium">/admin/cadastro-360</button>
            <button type="button" onclick="setAddRota('/admin/pre-cadastro')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium">/admin/pre-cadastro</button>
            <button type="button" onclick="setAddRota('/admin/termos')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium">/admin/termos</button>
            <button type="button" onclick="setAddRota('/plataforma/consulta-cpf')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium">/plataforma/consulta-cpf</button>
            <button type="button" onclick="setAddRota('/plataforma/carteira')" class="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium">/plataforma/carteira</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Permissão Mínima de Acesso</label>
            <select name="permissoesMinimas" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="USUARIO">Usuário Comum / Operador</option>
              <option value="GERENTE" selected>Gerente de Negócio</option>
              <option value="ADMINISTRADOR_MASTER">Administrador Master</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" name="ativo" id="chk-ativo" checked class="w-4 h-4 text-emerald-600 rounded">
            <label for="chk-ativo" class="font-semibold text-slate-700">Ativar Módulo Imediatamente</label>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onclick="fecharModalAdicionarModulo()" class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Salvar Módulo
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL EDITAR MÓDULO -->
  <div id="modal-edit-modulo" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-pen-to-square text-purple-400"></i>
          <h3 class="font-bold text-base">Modificar Módulo Existente</h3>
        </div>
        <button onclick="fecharModalEditarModulo()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form id="form-edit-modulo" onsubmit="salvarEdicaoModulo(event)" class="p-6 space-y-4 text-xs">
        <input type="hidden" name="negocioId" id="edit-negocio-id">
        <input type="hidden" name="moduloId" id="edit-modulo-id">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nome do Módulo *</label>
            <input type="text" name="nome" id="edit-nome" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Código Único (Identificador)</label>
            <input type="text" name="codigo" id="edit-codigo" readonly class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 uppercase font-mono text-slate-500">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Descrição das Funcionalidades *</label>
          <textarea name="descricao" id="edit-descricao" rows="2" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Categoria *</label>
            <select name="categoria" id="edit-categoria" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500">
              <option value="credito">Crédito & Financiamento</option>
              <option value="consulta">Consulta & KYC/AML</option>
              <option value="operacao">Operação & Leads</option>
              <option value="financeiro">Financeiro & Pagamentos</option>
              <option value="compliance">Compliance & Notarial</option>
              <option value="integracao">Integração de APIs</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Rota / Endpoint URL *</label>
            <input type="text" name="rotaUrl" id="edit-rotaUrl" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-purple-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ícone FontAwesome</label>
            <input type="text" name="icone" id="edit-icone" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-purple-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Permissão Mínima de Acesso</label>
            <select name="permissoesMinimas" id="edit-permissoes" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500">
              <option value="USUARIO">Usuário Comum / Operador</option>
              <option value="GERENTE">Gerente de Negócio</option>
              <option value="ADMINISTRADOR_MASTER">Administrador Master</option>
            </select>
          </div>
          <div class="flex items-center gap-2 pt-5">
            <input type="checkbox" name="ativo" id="edit-chk-ativo" class="w-4 h-4 text-purple-600 rounded">
            <label for="edit-chk-ativo" class="font-semibold text-slate-700">Módulo Ativo</label>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onclick="fecharModalEditarModulo()" class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL ADICIONAR NOVA LINHA DE NEGÓCIO -->
  <div id="modal-add-negocio" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
      <div class="bg-bancofe-dark text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-building text-emerald-400"></i>
          <h3 class="font-bold text-base">Nova Linha de Negócio Corporativa</h3>
        </div>
        <button onclick="fecharModalAdicionarNegocio()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form id="form-add-negocio" onsubmit="salvarNovoNegocio(event)" class="p-6 space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nome Fantasia do Negócio *</label>
            <input type="text" name="nome" required placeholder="Ex.: BancoFe Seguros & Previdência" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Slug / Identificador *</label>
            <input type="text" name="slug" required placeholder="Ex.: seguros" class="w-full px-3 py-2 rounded-lg border border-slate-300 lowercase font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Razão Social Completa *</label>
            <input type="text" name="razaoSocial" required placeholder="Ex.: BANCOFE SEGUROS LTDA" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">CNPJ *</label>
            <input type="text" name="cnpj" required placeholder="00.000.000/0001-00" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Segmento</label>
            <select name="segmento" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="banking">Banking & Fintech</option>
              <option value="credito">Crédito & Fomento</option>
              <option value="compliance">Compliance & DPO</option>
              <option value="agro">Agro & Safra</option>
              <option value="imobiliario">Imobiliário</option>
              <option value="construcao">Construção Civil</option>
              <option value="varejo">Varejo & Serviços</option>
              <option value="gastronomia">Gastronomia</option>
              <option value="moda">Moda & Boutique</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Cor Primária (Hex)</label>
            <input type="color" name="corPrimaria" value="#0c4a34" class="w-full h-9 p-1 rounded-lg border border-slate-300 cursor-pointer">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ícone FontAwesome</label>
            <input type="text" name="icone" value="fa-building" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Descrição Institucional *</label>
          <textarea name="descricao" rows="2" required placeholder="Descreva os objetivos de negócio..." class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onclick="fecharModalAdicionarNegocio()" class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Criar Negócio
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- JAVASCRIPT REATIVO -->
  <script>
    let negociosCache = [];
    let negocioSelecionadoId = 'neg-bancofe';

    async function carregarNegocios() {
      try {
        const resp = await fetch('/api/v1/admin/negocios');
        const dados = await resp.json();
        negociosCache = dados.negocios || dados || [];
        
        // Se o negócio selecionado não existir mais, seleciona o primeiro
        if (!negociosCache.find(n => n.id === negocioSelecionadoId) && negociosCache.length > 0) {
          negocioSelecionadoId = negociosCache[0].id;
        }

        renderizarSeletorNegocios();
        renderizarPainelNegocioAtual();
        atualizarKpisAdmin(dados.metricas);
      } catch (e) {
        console.error('Erro ao carregar negócios:', e);
      }
    }

    function atualizarKpisAdmin(metricas) {
      if (metricas) {
        document.getElementById('kpi-negocios').textContent = metricas.totalNegocios || negociosCache.length;
        document.getElementById('kpi-modulos-ativos').textContent = metricas.modulosAtivos || 0;
        document.getElementById('kpi-modulos-total').textContent = metricas.totalModulos || 0;
        document.getElementById('kpi-modulos-inativos').textContent = (metricas.modulosInativos || 0) + ' inativos';
      } else {
        const totalMods = negociosCache.reduce((acc, n) => acc + (n.modulos?.length || 0), 0);
        const ativosMods = negociosCache.reduce((acc, n) => acc + (n.modulos?.filter(m => m.ativo).length || 0), 0);
        document.getElementById('kpi-negocios').textContent = negociosCache.length;
        document.getElementById('kpi-modulos-ativos').textContent = ativosMods;
        document.getElementById('kpi-modulos-total').textContent = totalMods;
        document.getElementById('kpi-modulos-inativos').textContent = (totalMods - ativosMods) + ' inativos';
      }
    }

    function renderizarSeletorNegocios() {
      const container = document.getElementById('container-seletor-negocios');
      container.innerHTML = negociosCache.map(neg => {
        const ativo = neg.id === negocioSelecionadoId;
        const totalMods = (neg.modulos || []).length;
        const ativosMods = (neg.modulos || []).filter(m => m.ativo).length;
        
        let classeAtiva = 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50';
        if (ativo) {
          if (neg.id === 'neg-operacoes-crm' || neg.id === 'neg-cadastro360-vault') {
            classeAtiva = 'bg-purple-950 text-white border-purple-600 shadow-md ring-2 ring-purple-500/50';
          } else {
            classeAtiva = 'bg-emerald-950 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50';
          }
        }

        return \`
          <button onclick="selecionarNegocio('\${neg.id}')" class="p-3.5 rounded-xl border text-left card-transition flex flex-col justify-between \${classeAtiva}">
            <div class="flex items-center justify-between mb-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center \${ativo ? 'bg-white/10 text-emerald-300' : 'bg-slate-100 text-slate-600'}">
                <i class="fa-solid \${neg.icone || 'fa-building'} text-sm"></i>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded \${ativo ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}">
                \${totalMods} mods
              </span>
            </div>
            <div>
              <p class="font-bold text-xs leading-tight line-clamp-1">\${neg.nome}</p>
              <div class="flex items-center justify-between mt-1 text-[10px] \${ativo ? 'text-emerald-300' : 'text-slate-400'}">
                <span class="truncate">\${neg.badge || 'Corporativo'}</span>
                <span>\${ativosMods}/\${totalMods} ativos</span>
              </div>
            </div>
          </button>
        \`;
      }).join('');
    }

    function selecionarNegocio(id) {
      negocioSelecionadoId = id;
      renderizarSeletorNegocios();
      renderizarPainelNegocioAtual();
    }

    function renderizarPainelNegocioAtual() {
      const neg = negociosCache.find(n => n.id === negocioSelecionadoId);
      if (!neg) return;

      document.getElementById('negocio-nome').textContent = neg.nome;
      document.getElementById('negocio-cnpj').textContent = \`CNPJ: \${neg.cnpj} • \${neg.razaoSocial}\`;
      document.getElementById('negocio-desc').textContent = neg.descricao;
      document.getElementById('negocio-icone').className = \`fa-solid \${neg.icone || 'fa-building'}\`;
      document.getElementById('negocio-icone-container').style.backgroundColor = neg.corPrimaria || '#0c4a34';
      document.getElementById('negocio-url').textContent = neg.urlBase || 'https://erp-bancofe-5xsi5uyoda-rj.a.run.app';
      
      const badgeEl = document.getElementById('negocio-badge');
      badgeEl.textContent = neg.badge || 'Corporativo';
      badgeEl.style.backgroundColor = neg.corPrimaria || '#0c4a34';

      const totalMods = (neg.modulos || []).length;
      const ativosMods = (neg.modulos || []).filter(m => m.ativo).length;
      document.getElementById('contador-modulos-negocio').textContent = \`\${ativosMods} de \${totalMods} módulos ativos\`;

      const grid = document.getElementById('grid-modulos-negocio');
      if (!neg.modulos || neg.modulos.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2"><i class="fa-solid fa-cube text-3xl text-slate-300"></i><p class="font-medium text-sm">Nenhum módulo cadastrado nesta linha de negócio.</p><p class="text-xs">Clique no botão \"Adicionar Módulo Aqui\" acima para habilitar novas funcionalidades.</p></div>';
        return;
      }

      grid.innerHTML = neg.modulos.map(m => {
        const catBadgeClasses = {
          credito: 'bg-purple-100 text-purple-800 border-purple-200',
          consulta: 'bg-blue-100 text-blue-800 border-blue-200',
          operacao: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          financeiro: 'bg-amber-100 text-amber-800 border-amber-200',
          compliance: 'bg-rose-100 text-rose-800 border-rose-200',
          integracao: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        }[m.categoria] || 'bg-slate-100 text-slate-800 border-slate-200';

        return \`
          <div class="p-4 rounded-xl border \${m.ativo ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-75'} shadow-sm flex flex-col justify-between space-y-3 card-transition">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl \${m.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-base shadow-sm shrink-0">
                    <i class="fa-solid \${m.icone || 'fa-cube'}"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900 leading-tight">\${m.nome}</h4>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="font-mono text-[10px] text-slate-400">\${m.codigo}</span>
                      <span class="px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase \${catBadgeClasses}">\${m.categoria}</span>
                    </div>
                  </div>
                </div>

                <!-- Botão Alternar Status -->
                <button onclick="alternarStatus('\${neg.id}', '\${m.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition shrink-0 \${m.ativo ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}" title="Clique para ativar/desativar">
                  \${m.ativo ? '● Ativo' : '○ Inativo'}
                </button>
              </div>

              <p class="text-xs text-slate-600 mt-2.5 leading-relaxed">\${m.descricao}</p>
            </div>

            <!-- Rodapé do Card com Ações -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2 flex-wrap">
              <span class="font-mono text-slate-500 truncate max-w-[180px]" title="\${m.rotaUrl}">\${m.rotaUrl}</span>
              
              <div class="flex items-center gap-1.5">
                <a href="\${m.rotaUrl}" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition flex items-center gap-1" title="Abrir Módulo">
                  <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> Acessar
                </a>
                <button onclick="abrirModalEditarModulo('\${neg.id}', '\${m.id}')" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition" title="Modificar Parâmetros">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button onclick="excluirModulo('\${neg.id}', '\${m.id}')" class="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition" title="Remover Módulo">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function abrirModalAdicionarModulo() {
      const select = document.getElementById('modal-select-negocio');
      select.innerHTML = negociosCache.map(n => \`
        <option value="\${n.id}" \${n.id === negocioSelecionadoId ? 'selected' : ''}>\${n.nome}</option>
      \`).join('');
      document.getElementById('modal-add-modulo').classList.remove('hidden');
    }

    function abrirModalAdicionarModuloParaAtual() {
      abrirModalAdicionarModulo();
      document.getElementById('modal-select-negocio').value = negocioSelecionadoId;
    }

    function fecharModalAdicionarModulo() {
      document.getElementById('modal-add-modulo').classList.add('hidden');
    }

    function setAddRota(url) {
      document.getElementById('add-rota-url').value = url;
    }

    async function salvarModulo(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const negocioId = formData.get('negocioId');
      const payload = {
        nome: formData.get('nome'),
        codigo: formData.get('codigo'),
        descricao: formData.get('descricao'),
        categoria: formData.get('categoria'),
        rotaUrl: formData.get('rotaUrl'),
        icone: formData.get('icone'),
        permissoesMinimas: formData.get('permissoesMinimas'),
        ativo: formData.get('ativo') === 'on',
      };

      try {
        const resp = await fetch(\`/api/v1/admin/modulos/\${negocioId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const res = await resp.json();
        if (res.sucesso || res.modulo || res.id) {
          fecharModalAdicionarModulo();
          form.reset();
          await carregarNegocios();
        } else {
          alert('Erro ao adicionar módulo: ' + (res.erro || 'Falha na validação'));
        }
      } catch (err) {
        alert('Falha na comunicação com o servidor');
      }
    }

    function abrirModalEditarModulo(negocioId, moduloId) {
      const neg = negociosCache.find(n => n.id === negocioId);
      if (!neg) return;
      const mod = neg.modulos.find(m => m.id === moduloId);
      if (!mod) return;

      document.getElementById('edit-negocio-id').value = negocioId;
      document.getElementById('edit-modulo-id').value = moduloId;
      document.getElementById('edit-nome').value = mod.nome;
      document.getElementById('edit-codigo').value = mod.codigo;
      document.getElementById('edit-descricao').value = mod.descricao;
      document.getElementById('edit-categoria').value = mod.categoria;
      document.getElementById('edit-rotaUrl').value = mod.rotaUrl;
      document.getElementById('edit-icone').value = mod.icone || 'fa-cube';
      document.getElementById('edit-permissoes').value = mod.permissoesMinimas || 'GERENTE';
      document.getElementById('edit-chk-ativo').checked = mod.ativo;

      document.getElementById('modal-edit-modulo').classList.remove('hidden');
    }

    function fecharModalEditarModulo() {
      document.getElementById('modal-edit-modulo').classList.add('hidden');
    }

    async function salvarEdicaoModulo(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const negocioId = formData.get('negocioId');
      const moduloId = formData.get('moduloId');
      const payload = {
        nome: formData.get('nome'),
        descricao: formData.get('descricao'),
        categoria: formData.get('categoria'),
        rotaUrl: formData.get('rotaUrl'),
        icone: formData.get('icone'),
        permissoesMinimas: formData.get('permissoesMinimas'),
        ativo: formData.get('ativo') === 'on',
      };

      try {
        const resp = await fetch(\`/api/v1/admin/modulos/\${negocioId}/\${moduloId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const res = await resp.json();
        if (res.sucesso || res.modulo) {
          fecharModalEditarModulo();
          await carregarNegocios();
        } else {
          alert('Erro ao atualizar módulo: ' + (res.erro || 'Falha na validação'));
        }
      } catch (err) {
        alert('Falha na comunicação com o servidor');
      }
    }

    async function alternarStatus(negocioId, moduloId) {
      try {
        const resp = await fetch(\`/api/v1/admin/modulos/\${negocioId}/\${moduloId}/status\`, {
          method: 'PATCH',
        });
        if (resp.ok) {
          await carregarNegocios();
        }
      } catch (err) {
        console.error('Falha ao alternar status do módulo:', err);
      }
    }

    async function excluirModulo(negocioId, moduloId) {
      if (!confirm('Deseja realmente remover este módulo desta linha de negócio?')) return;
      try {
        const resp = await fetch(\`/api/v1/admin/modulos/\${negocioId}/\${moduloId}\`, {
          method: 'DELETE',
        });
        if (resp.ok) {
          await carregarNegocios();
        } else {
          alert('Erro ao excluir módulo.');
        }
      } catch (err) {
        console.error('Falha ao excluir módulo:', err);
      }
    }

    function abrirModalAdicionarNegocio() {
      document.getElementById('modal-add-negocio').classList.remove('hidden');
    }

    function fecharModalAdicionarNegocio() {
      document.getElementById('modal-add-negocio').classList.add('hidden');
    }

    async function salvarNovoNegocio(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const payload = {
        nome: formData.get('nome'),
        slug: formData.get('slug'),
        razaoSocial: formData.get('razaoSocial'),
        cnpj: formData.get('cnpj'),
        segmento: formData.get('segmento'),
        corPrimaria: formData.get('corPrimaria'),
        icone: formData.get('icone'),
        descricao: formData.get('descricao'),
      };

      try {
        const resp = await fetch('/api/v1/admin/negocios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const res = await resp.json();
        if (res.sucesso || res.negocio) {
          fecharModalAdicionarNegocio();
          form.reset();
          if (res.negocio?.id) {
            negocioSelecionadoId = res.negocio.id;
          }
          await carregarNegocios();
        } else {
          alert('Erro ao criar negócio: ' + (res.erro || 'Falha na validação'));
        }
      } catch (err) {
        alert('Falha na comunicação com o servidor');
      }
    }

    // Inicialização
    carregarNegocios();
  </script>
</body>
</html>`;
}
