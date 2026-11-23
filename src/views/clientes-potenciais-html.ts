/**
 * Renderiza a interface web oficial do Radar Preditivo & Base Potencial de Clientes BancoFé
 * Mapeamento de compradores, investidores e tomadores de crédito qualificados
 * por segmento socioeconômico regional (Tangará da Serra, Nova Olímpia, Mirante do Paranapanema).
 */
export function renderizarHtmlClientesPotenciais(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Radar Preditivo & Base Potencial de Clientes • BancoFé</title>
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
        <a href="/plataforma/precadastro" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-user-check mr-1.5 text-emerald-400"></i> Pré-Cadastro 360
        </a>
        <a href="/plataforma/clientes-potenciais" class="px-3 py-2 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 transition">
          <i class="fa-solid fa-crosshairs mr-1.5 text-emerald-400"></i> Radar de Clientes
        </a>
        <a href="/admin" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-cubes mr-1.5 text-emerald-400"></i> Gestão de Módulos
        </a>
        <a href="/plataforma/carteira" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-wallet mr-1.5 text-emerald-400"></i> Carteira PIX
        </a>
      </nav>

      <!-- USUÁRIO -->
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

    <!-- CABEÇALHO -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-blue-100 text-blue-800">Prospecção Ativa & Inteligência</span>
          <span class="text-xs text-slate-500">• Tangará da Serra, Chapadão dos Parecis & Região</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Radar Preditivo de Clientes & Investidores</h1>
        <p class="text-sm text-slate-600 mt-1">
          Mapeamento preditivo de capacidade financeira, score de birô, patrimônio e afinidade a produtos bancários e imobiliários BancoFé.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/plataforma/precadastro" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-user-plus"></i> Abrir Pré-Cadastro
        </a>
      </div>
    </div>

    <!-- KPIS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpis-radar">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Clientes no Radar</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-radar-total">16</p>
        <span class="text-xs text-emerald-600 font-medium">100% qualificados regionalmente</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Renda Média Mensal</p>
        <p class="text-2xl font-bold text-emerald-700 mt-1" id="kpi-radar-renda">R$ 33.000</p>
        <span class="text-xs text-slate-500">Capacidade de alavancagem alta</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Poder de Compra Total</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-radar-compra">R$ 23.490.000</p>
        <span class="text-xs text-slate-500">Demanda qualificada ativa</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Crédito Pré-Aprovável</p>
        <p class="text-2xl font-bold text-bancofe-gold mt-1" id="kpi-radar-credito">R$ 10.970.000</p>
        <span class="text-xs text-emerald-600 font-medium">Enquadramento SAC & Price</span>
      </div>
    </div>

    <!-- ABAS DE SEGMENTOS ECONÔMICOS & BUSCA -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
      <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" id="tabs-segmentos">
        <button onclick="filtrarSegmento('todos')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white" data-seg="todos">Todos (16)</button>
        <button onclick="filtrarSegmento('agronegocio')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="agronegocio">Agronegócio</button>
        <button onclick="filtrarSegmento('medicos_saude')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="medicos_saude">Médicos & Saúde</button>
        <button onclick="filtrarSegmento('empresarios')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="empresarios">Empresários</button>
        <button onclick="filtrarSegmento('servidores_publicos')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="servidores_publicos">Servidores Públicos</button>
        <button onclick="filtrarSegmento('primeiro_imovel_mcmv')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="primeiro_imovel_mcmv">MCMV</button>
        <button onclick="filtrarSegmento('investidores_patrimoniais')" class="segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200" data-seg="investidores_patrimoniais">Investidores</button>
      </div>
      <div class="w-full md:w-72 relative">
        <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
        <input type="text" id="busca-radar" oninput="buscarRadar(this.value)" placeholder="Buscar por nome, cargo ou empresa..." class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </div>
    </div>

    <!-- GRID DE CARDS DOS CLIENTES POTENCIAIS -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="grid-clientes-radar">
      <div class="col-span-full py-12 text-center text-slate-400">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
        <p>Carregando base de inteligência do Radar Preditivo...</p>
      </div>
    </div>

  </main>

  <script>
    let clientesRadarCache = [];
    let segmentoAtual = 'todos';
    let buscaRadarAtual = '';

    async function carregarRadar() {
      try {
        const resp = await fetch('/api/v1/radar/clientes-potenciais');
        const dados = await resp.json();
        clientesRadarCache = dados.itens || dados || [];
        renderizarGrid();
        if (dados.estatisticas) {
          document.getElementById('kpi-radar-total').textContent = dados.estatisticas.totalClientesRadar;
          document.getElementById('kpi-radar-renda').textContent = 'R$ ' + dados.estatisticas.rendaMedia.toLocaleString('pt-BR');
          document.getElementById('kpi-radar-compra').textContent = 'R$ ' + dados.estatisticas.poderCompraTotal.toLocaleString('pt-BR');
          document.getElementById('kpi-radar-credito').textContent = 'R$ ' + dados.estatisticas.volumePreAprovadoTotal.toLocaleString('pt-BR');
        }
      } catch (err) {
        console.error('Erro ao carregar radar:', err);
      }
    }

    function renderizarGrid() {
      const container = document.getElementById('grid-clientes-radar');
      let filtrados = clientesRadarCache;

      if (segmentoAtual !== 'todos') {
        filtrados = filtrados.filter(c => c.segmento === segmentoAtual);
      }

      if (buscaRadarAtual) {
        const t = buscaRadarAtual.toLowerCase().trim();
        filtrados = filtrados.filter(c =>
          c.nome.toLowerCase().includes(t) ||
          c.profissaoCargo.toLowerCase().includes(t) ||
          c.empresaOuInstituicao.toLowerCase().includes(t) ||
          c.bairroReferencia.toLowerCase().includes(t) ||
          c.municipio.toLowerCase().includes(t)
        );
      }

      if (filtrados.length === 0) {
        container.innerHTML = '<div class="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">Nenhum cliente potencial encontrado com os filtros selecionados.</div>';
        return;
      }

      container.innerHTML = filtrados.map(c => {
        const scoreCor = c.scoreSerasaEstimado >= 900 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                         c.scoreSerasaEstimado >= 800 ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300';

        const produtosBadges = (c.produtosBancariosSugeridos || []).map(p => 
          \`<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/60">\${p}</span>\`
        ).join('');

        return \`
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">\${c.segmento.replace(/_/g, ' ')}</span>
                  <h3 class="text-base font-bold text-slate-900 leading-snug">\${c.nome}</h3>
                  <p class="text-xs text-slate-500 font-mono">\${c.cpfMascarado}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs font-bold border \${scoreCor}">
                  \${c.scoreSerasaEstimado} Score
                </span>
              </div>

              <div class="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p class="text-slate-700 font-medium"><i class="fa-solid fa-briefcase text-slate-400 mr-1.5"></i>\${c.profissaoCargo}</p>
                <p class="text-slate-600"><i class="fa-solid fa-building text-slate-400 mr-1.5"></i>\${c.empresaOuInstituicao}</p>
                <p class="text-slate-500"><i class="fa-solid fa-location-dot text-slate-400 mr-1.5"></i>\${c.bairroReferencia}, \${c.municipio}/\${c.uf}</p>
              </div>

              <div class="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div class="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <p class="text-[10px] font-semibold text-emerald-800 uppercase">Renda Estimada</p>
                  <p class="font-bold text-slate-900">R$ \${c.rendaEstimadaMensal.toLocaleString('pt-BR')}/mês</p>
                </div>
                <div class="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">
                  <p class="text-[10px] font-semibold text-emerald-800 uppercase">Crédito Pré-Aprovado</p>
                  <p class="font-bold text-emerald-700">R$ \${c.limiteCreditoPreAprovadoEstimado.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div class="mt-3">
                <p class="text-[11px] font-semibold text-slate-600 mb-1.5">Produtos BancoFé Recomendados:</p>
                <div class="flex flex-wrap gap-1">
                  \${produtosBadges}
                </div>
              </div>

              <div class="mt-3 text-[11px] text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                <strong class="text-amber-900"><i class="fa-solid fa-bolt text-amber-500 mr-1"></i>Ação Sugerida:</strong> \${c.sugestaoAcaoImediata}
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a href="/plataforma/consulta-cpf?documento=\${c.nome}" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-magnifying-glass-chart"></i> Consultar 360
              </a>
              <a href="/plataforma/precadastro" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition">
                <i class="fa-solid fa-check"></i> Pré-Cadastrar
              </a>
            </div>
          </div>
        \`;
      }).join('');
    }

    function filtrarSegmento(seg) {
      segmentoAtual = seg;
      document.querySelectorAll('.segmento-btn').forEach(btn => {
        if (btn.getAttribute('data-seg') === seg) {
          btn.className = 'segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 text-white';
        } else {
          btn.className = 'segmento-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
        }
      });
      renderizarGrid();
    }

    function buscarRadar(v) {
      buscaRadarAtual = v;
      renderizarGrid();
    }

    // Inicialização
    carregarRadar();
  </script>
</body>
</html>`;
}
