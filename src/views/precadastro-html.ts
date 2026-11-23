/**
 * Renderiza a interface web oficial da Esteira de Pré-Cadastro 360 BancoFé
 * Permite visualizar a fila de onboarding, cadastrar novos proponentes,
 * simular crédito SAC/Price, emitir certificados autônomos e gerenciar pendências documentais.
 */
export function renderizarHtmlPreCadastro(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pré-Cadastro 360 & Onboarding • BancoFé</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .bg-bancofe-dark { background-color: #0b1712; }
    .bg-bancofe-primary { background-color: #0c4a34; }
    .text-bancofe-gold { color: #d4af37; }
    .border-bancofe-gold { border-color: #d4af37; }
  </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col">

  <!-- TOPBAR BANCOFÉ -->
  <header class="bg-bancofe-dark text-white border-b border-emerald-950 sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner border border-emerald-500/30">
          <i class="fa-solid fa-building-columns text-emerald-200"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
            <span class="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">Enterprise 360</span>
          </div>
          <p class="text-xs text-slate-400">Plataforma Bancária & Hub de Crédito Multicanal</p>
        </div>
      </div>

      <!-- NAVEGAÇÃO SUPERIOR -->
      <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
        <a href="/plataforma/consulta-cpf" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-magnifying-glass-chart mr-1.5 text-emerald-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-3 py-2 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 transition">
          <i class="fa-solid fa-user-check mr-1.5 text-emerald-400"></i> Pré-Cadastro 360
        </a>
        <a href="/plataforma/clientes-potenciais" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-crosshairs mr-1.5 text-emerald-400"></i> Radar de Clientes
        </a>
        <a href="/admin" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-cubes mr-1.5 text-emerald-400"></i> Gestão de Módulos
        </a>
        <a href="/plataforma/carteira" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-wallet mr-1.5 text-emerald-400"></i> Carteira PIX
        </a>
        <a href="/admin/backoffice" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-chart-pie mr-1.5 text-emerald-400"></i> ERP Backoffice
        </a>
      </nav>

      <!-- USUÁRIO LOGADO -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-200">Admin Corporativo</p>
          <p class="text-[11px] text-emerald-400 font-mono">BFE-PRD-AUTORIZADO</p>
        </div>
        <a href="/logout" class="p-2 text-slate-400 hover:text-rose-400 transition" title="Encerrar Sessão">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

    <!-- CABEÇALHO DA PÁGINA -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-950 text-emerald-200 border border-emerald-700/60">
            <i class="fa-solid fa-landmark mr-1 text-emerald-400"></i> Módulo BancoFé Operações Financeiras
          </span>
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-950 text-blue-200 border border-blue-700/60">
            <i class="fa-solid fa-house-chimney mr-1 text-blue-400"></i> Base Integrada Casa Nova (casanova.kytto.com.br)
          </span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Pré-Cadastro 360 BancoFé</h1>
        <p class="text-sm text-slate-600 mt-1">
          Módulo operacional de onboarding e concessão de crédito sob governança do <strong>BancoFé Operações Financeiras</strong>. Consolida 100% dos proponentes, compradores e interessados migrados da base da Casa Nova Imóveis.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/admin/backoffice" class="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2 text-xs">
          <i class="fa-solid fa-arrow-left"></i> Cockpit ERP
        </a>
        <button onclick="abrirModalNovoPreCadastro()" class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm transition flex items-center gap-2 text-sm">
          <i class="fa-solid fa-plus"></i> Novo Pré-Cadastro
        </button>
        <button onclick="carregarPreCadastros()" class="px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition text-sm">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>
    </div>

    <!-- CARDS DE METRICAS (KPIS) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpis-container">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Total de Propostas</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-total">5</p>
        <span class="text-xs text-emerald-600 font-medium">100% integradas ao 360</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Aprovadas Autônomas</p>
        <p class="text-2xl font-bold text-emerald-700 mt-1" id="kpi-aprovados">3</p>
        <span class="text-xs text-emerald-600 font-medium">Certificados emitidos</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Volume Aprovado</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-volume">R$ 2.745.000</p>
        <span class="text-xs text-slate-500">Média de R$ 915k / proposta</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Pendências Ativas</p>
        <p class="text-2xl font-bold text-amber-600 mt-1" id="kpi-pendentes">2</p>
        <span class="text-xs text-amber-700 font-medium">Documentos sob conferência</span>
      </div>
    </div>

    <!-- FILTROS E BUSCA -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <button onclick="filtrarStatus('todos')" class="filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white" data-status="todos">Todos</button>
        <button onclick="filtrarStatus('aprovado_autonomo')" class="filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-status="aprovado_autonomo">Aprovado Autônomo</button>
        <button onclick="filtrarStatus('em_qualificacao')" class="filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-status="em_qualificacao">Em Qualificação</button>
        <button onclick="filtrarStatus('pendente_documentos')" class="filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-status="pendente_documentos">Pendente Docs</button>
      </div>
      <div class="w-full md:w-72 relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        <input type="text" id="input-busca" oninput="buscarTermo(this.value)" placeholder="Buscar por proponente, CPF ou protocolo..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </div>
    </div>

    <!-- TABELA DA FILA DE PRÉ-CADASTROS -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <th class="py-3 px-4">Protocolo / Data</th>
              <th class="py-3 px-4">Proponente & Documento</th>
              <th class="py-3 px-4">Canal / Origem</th>
              <th class="py-3 px-4">Produto & Valor</th>
              <th class="py-3 px-4">1ª Parcela (SAC)</th>
              <th class="py-3 px-4">Status & Score</th>
              <th class="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-precadastros" class="divide-y divide-slate-100">
            <tr>
              <td colspan="7" class="text-center py-8 text-slate-500">Carregando esteira de pré-cadastros...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <!-- MODAL NOVO PRÉ-CADASTRO -->
  <div id="modal-novo-precadastro" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      <div class="bg-bancofe-dark text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-user-plus text-emerald-400"></i>
          <h3 class="font-bold text-base">Novo Pré-Cadastro & Onboarding BancoFé</h3>
        </div>
        <button onclick="fecharModalNovoPreCadastro()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <form id="form-novo-precadastro" onsubmit="salvarNovoPreCadastro(event)" class="p-6 overflow-y-auto space-y-4 text-xs">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Nome Completo do Proponente *</label>
            <input type="text" name="nomeCompleto" required placeholder="Ex.: Rodrigo Ribeiro Gonçalves" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">CPF ou CNPJ *</label>
            <input type="text" name="cpfOuCnpj" required placeholder="Ex.: 305.871.628-13" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">E-mail Corporativo / Pessoal *</label>
            <input type="email" name="email" required placeholder="rodrigo.goncalves@kytto.com.br" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Telefone WhatsApp *</label>
            <input type="text" name="telefone" required placeholder="(18) 99712-4411" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Renda Mensal Declarada (R$) *</label>
            <input type="number" name="rendaMensalDeclarada" required min="1000" step="500" value="15000" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Município</label>
            <input type="text" name="cidade" value="Tangará da Serra" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">UF</label>
            <input type="text" name="uf" value="MT" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Produto Pretendido *</label>
            <select name="produtoPretendido" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="minha_casa_minha_vida">Minha Casa Minha Vida / Social (0,58% a.m.)</option>
              <option value="financiamento_imobiliario" selected>Financiamento Imobiliário SBPE / Casa Nova (0,85% a.m.)</option>
              <option value="home_equity">Home Equity c/ Garantia de Imóvel (0,85% a.m.)</option>
              <option value="credito_loteamento">Crédito Terrenos & Lotes Urbanos (0,95% a.m.)</option>
              <option value="credito_rural_agro">Crédito Rural CPR & Custeio Safra (0,75% a.m.)</option>
              <option value="emprestimo_consignado">Empréstimo Consignado em Folha (0,79% a.m.)</option>
              <option value="capital_giro_pj">Capital de Giro PJ & Maquininha (1,15% a.m.)</option>
              <option value="cartao_credito_black">Cartão de Crédito Black VIP BancoFé</option>
              <option value="abertura_conta_digital">Abertura de Conta Corrente Digital</option>
              <option value="investimento_lci_lca">Investimentos Estruturados (LCI / LCA)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Canal Parceiro</label>
            <select name="empresaParceira" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="Casa Nova Imóveis">Casa Nova Imóveis (Tangará da Serra)</option>
              <option value="UISA Biorrefinaria">UISA Biorrefinaria (Nova Olímpia)</option>
              <option value="Construtora Ultra">Construtora Ultra Engenharia</option>
              <option value="Dino Barbearia & Perfumaria">Dino Barbearia & Varejo</option>
              <option value="BancoFé Direto">BancoFé Direto / Portal Online</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Valor Pretendido (R$)</label>
            <input type="number" name="valorPretendido" min="10000" step="10000" value="350000" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Prazo (Meses)</label>
            <input type="number" name="prazoMeses" min="12" max="420" value="360" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Amortização</label>
            <select name="sistemaAmortizacao" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500">
              <option value="SAC">SAC (Parcelas Decrescentes)</option>
              <option value="PRICE">PRICE (Parcelas Fixas)</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <input type="checkbox" name="autorizacaoLgpd" id="lgpd-chk" checked class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
          <label for="lgpd-chk" class="text-slate-600">Autorização expressa de consulta cadastral SCR Bacen e tratamento de dados conforme Lei nº 13.709/2018 (LGPD).</label>
        </div>

        <div class="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onclick="fecharModalNovoPreCadastro()" class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-sm flex items-center gap-2">
            <i class="fa-solid fa-check"></i> Registrar e Simular Crédito
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL DETALHES & CERTIFICADO -->
  <div id="modal-detalhes" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      <div class="bg-bancofe-dark text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-certificate text-bancofe-gold"></i>
          <h3 class="font-bold text-base" id="modal-detalhes-titulo">Dossiê de Pré-Cadastro & Simulação</h3>
        </div>
        <button onclick="fecharModalDetalhes()" class="text-slate-400 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <div class="p-6 overflow-y-auto space-y-6 text-xs" id="modal-detalhes-corpo">
        <!-- Preenchido dinamicamente via JS -->
      </div>

      <div class="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
        <div id="modal-link-360"></div>
        <button onclick="fecharModalDetalhes()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl">Fechar</button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT DINÂMICO -->
  <script>
    let preCadastrosCache = [];
    let filtroAtual = 'todos';
    let buscaAtual = '';

    async function carregarPreCadastros() {
      try {
        const resp = await fetch('/api/v1/precadastro/listar');
        const dados = await resp.json();
        preCadastrosCache = dados.itens || dados || [];
        renderizarTabela();
        atualizarKpis(dados.metricas);
      } catch (e) {
        console.error('Erro ao carregar pré-cadastros:', e);
      }
    }

    function atualizarKpis(metricas) {
      if (!metricas) return;
      document.getElementById('kpi-total').textContent = metricas.totalPreCadastros || preCadastrosCache.length;
      document.getElementById('kpi-aprovados').textContent = metricas.aprovadosAutonomos || 0;
      document.getElementById('kpi-volume').textContent = 'R$ ' + ((metricas.volumeTotalAprovado || 0)).toLocaleString('pt-BR');
      document.getElementById('kpi-pendentes').textContent = metricas.pendentesDocumentos || 0;
    }

    function renderizarTabela() {
      const tbody = document.getElementById('tabela-precadastros');
      let filtrados = preCadastrosCache;

      if (filtroAtual !== 'todos') {
        filtrados = filtrados.filter(item => item.status === filtroAtual);
      }

      if (buscaAtual) {
        const t = buscaAtual.toLowerCase().trim();
        filtrados = filtrados.filter(item => 
          item.titular.nomeCompleto.toLowerCase().includes(t) ||
          item.titular.cpfOuCnpj.includes(t) ||
          item.codigoProtocolo.toLowerCase().includes(t) ||
          item.titular.cidade.toLowerCase().includes(t)
        );
      }

      if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400">Nenhum pré-cadastro encontrado com os filtros aplicados.</td></tr>';
        return;
      }

      tbody.innerHTML = filtrados.map(item => {
        const badges = {
          aprovado_autonomo: '<span class="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Aprovado Autônomo</span>',
          em_qualificacao: '<span class="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-300">Em Qualificação</span>',
          pendente_documentos: '<span class="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">Pendente Docs</span>',
          mesa_credito: '<span class="px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 border border-purple-300">Mesa de Crédito</span>',
          novo: '<span class="px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-300">Novo</span>',
        };

        const statusBadge = badges[item.status] || item.status;
        const valorSol = item.simulacao?.valorSolicitado ? 'R$ ' + item.simulacao.valorSolicitado.toLocaleString('pt-BR') : 'R$ 100.000';
        const parcela = item.simulacao?.valorPrimeiraParcela ? 'R$ ' + item.simulacao.valorPrimeiraParcela.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : 'R$ 1.500,00';
        const dataFormatada = new Date(item.dataCriacao).toLocaleDateString('pt-BR');

        return \`
          <tr class="hover:bg-slate-50 transition border-b border-slate-100">
            <td class="py-3 px-4 font-mono">
              <span class="font-bold text-slate-900">\${item.codigoProtocolo}</span>
              <p class="text-[11px] text-slate-400">\${dataFormatada}</p>
            </td>
            <td class="py-3 px-4">
              <p class="font-bold text-slate-900 text-sm">\${item.titular.nomeCompleto}</p>
              <p class="text-slate-500 font-mono text-[11px]">\${item.titular.cpfOuCnpj} • \${item.titular.cidade}/\${item.titular.uf}</p>
            </td>
            <td class="py-3 px-4 text-slate-600 font-medium">
              <span class="px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                <i class="fa-solid fa-house-chimney text-blue-600 mr-1"></i>\${item.empresaParceira || 'Casa Nova Imóveis'}
              </span>
              <p class="text-[10px] text-slate-400 mt-0.5">Origem: \${item.canalOrigem || 'crm_casanova'}</p>
            </td>
            <td class="py-3 px-4">
              <p class="font-bold text-emerald-800">\${valorSol}</p>
              <p class="text-[11px] text-slate-500 capitalize">\${(item.produtoPretendido || '').replace(/_/g, ' ')}</p>
            </td>
            <td class="py-3 px-4 font-mono font-semibold text-slate-800">
              \${parcela}
            </td>
            <td class="py-3 px-4">
              \${statusBadge}
              <p class="text-[11px] text-slate-400 mt-0.5">Score: \${item.scoreSerasaEstimado || 800}</p>
            </td>
            <td class="py-3 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button onclick="verDetalhes('\${item.id}')" class="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition" title="Ver Detalhes">
                  <i class="fa-solid fa-eye"></i>
                </button>
                <a href="/plataforma/consulta-cpf?documento=\${item.titular.cpfLimpo}" class="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition" title="Consultar 360">
                  <i class="fa-solid fa-magnifying-glass-chart"></i>
                </a>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filtrarStatus(status) {
      filtroAtual = status;
      document.querySelectorAll('.filtro-btn').forEach(btn => {
        if (btn.getAttribute('data-status') === status) {
          btn.className = 'filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white';
        } else {
          btn.className = 'filtro-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });
      renderizarTabela();
    }

    function buscarTermo(v) {
      buscaAtual = v;
      renderizarTabela();
    }

    function abrirModalNovoPreCadastro() {
      document.getElementById('modal-novo-precadastro').classList.remove('hidden');
    }

    function fecharModalNovoPreCadastro() {
      document.getElementById('modal-novo-precadastro').classList.add('hidden');
    }

    async function salvarNovoPreCadastro(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const payload = {
        nomeCompleto: formData.get('nomeCompleto'),
        cpfOuCnpj: formData.get('cpfOuCnpj'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        rendaMensalDeclarada: Number(formData.get('rendaMensalDeclarada')),
        cidade: formData.get('cidade'),
        uf: formData.get('uf'),
        produtoPretendido: formData.get('produtoPretendido'),
        empresaParceira: formData.get('empresaParceira'),
        valorPretendido: Number(formData.get('valorPretendido')),
        prazoMeses: Number(formData.get('prazoMeses')),
        sistemaAmortizacao: formData.get('sistemaAmortizacao'),
        autorizacaoLgpd: formData.get('autorizacaoLgpd') === 'on',
      };

      try {
        const resp = await fetch('/api/v1/precadastro/criar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const res = await resp.json();
        if (res.sucesso || res.id) {
          fecharModalNovoPreCadastro();
          form.reset();
          await carregarPreCadastros();
          verDetalhes(res.id || (res.registro && res.registro.id));
        } else {
          alert('Erro ao salvar pré-cadastro: ' + (res.erro || 'Falha na validação'));
        }
      } catch (err) {
        alert('Falha na comunicação com o servidor');
      }
    }

    function verDetalhes(id) {
      const item = preCadastrosCache.find(r => r.id === id);
      if (!item) return;

      const corpo = document.getElementById('modal-detalhes-corpo');
      const cert = item.simulacao?.certificado;

      let htmlCert = '';
      if (cert) {
        htmlCert = \`
          <div class="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-bancofe-gold shadow-lg relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 text-7xl text-white/5"><i class="fa-solid fa-stamp"></i></div>
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-award text-bancofe-gold text-lg"></i>
                <span class="font-bold tracking-wide uppercase text-xs text-bancofe-gold">Certificado de Pré-Aprovação Autônoma</span>
              </div>
              <span class="font-mono text-[10px] text-slate-400">\${cert.codigoCertificado}</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <p class="text-slate-400 text-[10px] uppercase">Limite Pré-Aprovado</p>
                <p class="text-xl font-bold text-emerald-300">R$ \${cert.limiteAprovado.toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <p class="text-slate-400 text-[10px] uppercase">Prazo Máximo</p>
                <p class="text-base font-semibold">\${cert.prazoMesesAprovado} meses (\${cert.sistema})</p>
              </div>
              <div>
                <p class="text-slate-400 text-[10px] uppercase">Taxa Bonificada</p>
                <p class="text-base font-semibold text-emerald-400">\${cert.taxaJurosMensal}% a.m.</p>
              </div>
              <div>
                <p class="text-slate-400 text-[10px] uppercase">Validade</p>
                <p class="text-base font-semibold">\${cert.validadeDias} dias</p>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 mt-3 font-mono">Hash Autenticador: \${cert.hashSha256}</p>
          </div>
        \`;
      }

      corpo.innerHTML = \`
        \${htmlCert}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <i class="fa-solid fa-user text-emerald-600"></i> Dados do Proponente
            </h4>
            <div class="space-y-1 text-slate-600">
              <p><strong class="text-slate-800">Nome:</strong> \${item.titular.nomeCompleto}</p>
              <p><strong class="text-slate-800">CPF/CNPJ:</strong> \${item.titular.cpfOuCnpj}</p>
              <p><strong class="text-slate-800">Renda Mensal:</strong> R$ \${item.titular.rendaMensalDeclarada.toLocaleString('pt-BR')}</p>
              <p><strong class="text-slate-800">Localização:</strong> \${item.titular.cidade} - \${item.titular.uf}</p>
              <p><strong class="text-slate-800">Contato:</strong> \${item.titular.telefone} • \${item.titular.email}</p>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <i class="fa-solid fa-calculator text-emerald-600"></i> Simulação & Enquadramento
            </h4>
            <div class="space-y-1 text-slate-600">
              <p><strong class="text-slate-800">1ª Parcela:</strong> R$ \${(item.simulacao?.valorPrimeiraParcela || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              <p><strong class="text-slate-800">Margem 30% da Renda:</strong> R$ \${(item.simulacao?.capacidadeParcela30Pct || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              <p><strong class="text-slate-800">Comprometimento de Renda:</strong> \${item.simulacao?.comprometimentoRendaPct || 0}%</p>
              <p><strong class="text-slate-800">Parecer Técnico:</strong> \${item.simulacao?.motivoStatus || 'Enquadrado'}</p>
            </div>
          </div>
        </div>

        \${item.analiseMesaCredito ? \`
          <div class="bg-gradient-to-br from-slate-900 to-emerald-950 text-white p-5 rounded-xl border border-emerald-500/30 shadow-md space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-white/10">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-microchip text-emerald-400"></i>
                <h5 class="font-bold text-sm tracking-wide text-white">Parecer da Mesa de Crédito Algorítmica BancoFé</h5>
              </div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                RATING \${item.analiseMesaCredito.rating} • SCORE \${item.analiseMesaCredito.scoreCalculado}/1000
              </span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span class="text-slate-400 text-[10px] uppercase block">Probab. Inadimplência:</span>
                <span class="font-bold text-emerald-300 text-sm mono">\${item.analiseMesaCredito.probabilidadeInadimplenciaPct}%</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase block">Decisão do Motor:</span>
                <span class="font-bold text-white text-xs uppercase">\${(item.analiseMesaCredito.decisao || '').replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase block">LTV Máximo Imóvel:</span>
                <span class="font-bold text-emerald-300 text-sm mono">\${item.analiseMesaCredito.limitesCalculados.ltvMaximoPct}%</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase block">Giro PJ Sugerido:</span>
                <span class="font-bold text-white text-sm mono">R$ \${(item.analiseMesaCredito.limitesCalculados.capitalGiroPj || 0).toLocaleString('pt-BR')}</span>
              </div>
            </div>
            \${item.analiseMesaCredito.fatoresPositivos && item.analiseMesaCredito.fatoresPositivos.length > 0 ? \`
              <div class="pt-2 text-[11px] text-slate-300 border-t border-white/10 flex items-start gap-1.5">
                <i class="fa-solid fa-circle-check text-emerald-400 mt-0.5"></i>
                <span><strong>Pontos Fortes:</strong> \${item.analiseMesaCredito.fatoresPositivos.join(' • ')}</span>
              </div>
            \` : ''}
          </div>
        \` : ''}

        <div>
          <h4 class="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
            <i class="fa-solid fa-list-check text-emerald-600"></i> Checklist de Pendências Documentais
          </h4>
          <div class="space-y-2">
            \${(item.pendencias || []).map(p => \`
              <div class="flex items-center justify-between p-2.5 rounded-lg border \${p.status === 'aprovado' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : p.status === 'anexado' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-amber-50 border-amber-200 text-amber-800'}">
                <div class="flex items-center gap-2">
                  <i class="fa-solid \${p.status === 'aprovado' ? 'fa-check-circle text-emerald-600' : p.status === 'anexado' ? 'fa-file-arrow-up text-blue-600' : 'fa-clock text-amber-600'}"></i>
                  <span class="font-medium">\${p.descricao}</span>
                  \${p.obrigatorio ? '<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Obrigatório</span>' : ''}
                </div>
                <span class="font-bold uppercase text-[10px] tracking-wider">\${p.status}</span>
              </div>
            \`).join('')}
          </div>
        </div>
      \`;

      document.getElementById('modal-link-360').innerHTML = \`
        <a href="/plataforma/consulta-cpf?documento=\${item.titular.cpfLimpo}" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass-chart"></i> Abrir Dossiê 360 Completo
        </a>
      \`;

      document.getElementById('modal-detalhes').classList.remove('hidden');
    }

    function fecharModalDetalhes() {
      document.getElementById('modal-detalhes').classList.add('hidden');
    }

    // Inicialização
      carregarPreCadastros();
    </script>
  </body>
  </html>`;
}

export const renderizarHtmlPrecadastro = renderizarHtmlPreCadastro;
