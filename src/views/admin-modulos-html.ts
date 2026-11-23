/**
 * Renderiza o Painel Administrativo Corporativo do BancoFé (/admin)
 * Permite adicionar, modificar, ativar/desativar e excluir módulos por linha de negócio:
 * - BancoFé Digital & Banking
 * - Casa Nova Imóveis
 * - Agro & Crédito Rural UISA
 * - Construtora Ultra
 * - Dino Barbearia & Varejo
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .bg-bancofe-dark { background-color: #0b1712; }
    .bg-bancofe-primary { background-color: #0c4a34; }
  </style>
</head>
<body class="text-slate-800 min-h-screen flex flex-col">

  <!-- TOPBAR -->
  <header class="bg-bancofe-dark text-white border-b border-emerald-950 sticky top-0 z-50 shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner border border-emerald-500/30">
          <i class="fa-solid fa-building-columns text-emerald-200"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg font-bold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
            <span class="px-2 py-0.5 text-xs font-semibold rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">Admin Console</span>
          </div>
          <p class="text-xs text-slate-400">Gestão Global de Módulos & Negócios Corporativos</p>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
        <a href="/plataforma/consulta-cpf" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-magnifying-glass-chart mr-1.5 text-emerald-400"></i> Consulta 360
        </a>
        <a href="/plataforma/precadastro" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-user-check mr-1.5 text-emerald-400"></i> Pré-Cadastro 360
        </a>
        <a href="/plataforma/clientes-potenciais" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-crosshairs mr-1.5 text-emerald-400"></i> Radar de Clientes
        </a>
        <a href="/admin" class="px-3 py-2 rounded-lg bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 transition">
          <i class="fa-solid fa-cubes mr-1.5 text-emerald-400"></i> Gestão de Módulos
        </a>
        <a href="/plataforma/carteira" class="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-emerald-950/50 transition">
          <i class="fa-solid fa-wallet mr-1.5 text-emerald-400"></i> Carteira PIX
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-200">Superadmin</p>
          <p class="text-[11px] text-emerald-400 font-mono">ROOT-MASTER</p>
        </div>
        <a href="/logout" class="p-2 text-slate-400 hover:text-rose-400 transition">
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
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-amber-100 text-amber-800">Painel Administrativo ERP</span>
          <span class="text-xs text-slate-500">• Cloud Run Produção (southamerica-east1)</span>
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Gestão de Módulos por Negócio</h1>
        <p class="text-sm text-slate-600 mt-1">
          Habilite, configure, adicione ou remova módulos e funcionalidades sob demanda para cada linha de negócio do ecossistema.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="abrirModalAdicionarModulo()" class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-plus"></i> Adicionar Módulo ao Negócio
        </button>
      </div>
    </div>

    <!-- KPIS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Linhas de Negócio</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-negocios">5</p>
        <span class="text-xs text-emerald-600 font-medium">100% integradas</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Módulos Ativos</p>
        <p class="text-2xl font-bold text-emerald-700 mt-1" id="kpi-modulos-ativos">11</p>
        <span class="text-xs text-slate-500">Operação em tempo real</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Total de Módulos</p>
        <p class="text-2xl font-bold text-slate-900 mt-1" id="kpi-modulos-total">11</p>
        <span class="text-xs text-slate-500">0 inativos</span>
      </div>
      <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs font-semibold text-slate-500 uppercase">Integrações Oficiais</p>
        <p class="text-2xl font-bold text-emerald-700 mt-1">48 / 48</p>
        <span class="text-xs text-emerald-600 font-medium">100% Operacionais (0 erros)</span>
      </div>
    </div>

    <!-- SELETOR DE NEGÓCIOS (CARDS / TABS) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" id="container-seletor-negocios">
      <!-- Injetado dinamicamente -->
    </div>

    <!-- PAINEL DO NEGÓCIO ATUAL -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow" id="negocio-icone-container">
            <i class="fa-solid fa-building-columns" id="negocio-icone"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-slate-900" id="negocio-nome">BancoFé Digital</h2>
            <p class="text-xs text-slate-500 font-mono" id="negocio-cnpj">CNPJ: 53.338.003/0001-04</p>
          </div>
        </div>
        <p class="text-xs text-slate-600 max-w-md" id="negocio-desc">
          Plataforma central de banking, crédito inteligente, contas digitais e meios de pagamento.
        </p>
      </div>

      <!-- LISTA DE MÓDULOS DO NEGÓCIO SELECIONADO -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
            <i class="fa-solid fa-cubes text-emerald-600"></i> Módulos Habilitados para este Negócio
          </h3>
          <span class="text-xs font-semibold text-slate-500" id="contador-modulos-negocio">4 módulos</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="grid-modulos-negocio">
          <!-- Injetado dinamicamente -->
        </div>
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
          <label class="block font-semibold text-slate-700 mb-1">Negócio de Destino</label>
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
            <input type="text" name="rotaUrl" required value="/plataforma/" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ícone FontAwesome</label>
            <input type="text" name="icone" value="fa-cube" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
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

  <script>
    let negociosCache = [];
    let negocioSelecionadoId = 'neg-bancofe';

    async function carregarNegocios() {
      try {
        const resp = await fetch('/api/v1/admin/negocios');
        const dados = await resp.json();
        negociosCache = dados.negocios || dados || [];
        renderizarSeletorNegocios();
        renderizarPainelNegocioAtual();
        atualizarKpisAdmin(dados.metricas);
      } catch (e) {
        console.error('Erro ao carregar negócios:', e);
      }
    }

    function atualizarKpisAdmin(metricas) {
      if (!metricas) return;
      document.getElementById('kpi-negocios').textContent = metricas.totalNegocios || negociosCache.length;
      document.getElementById('kpi-modulos-ativos').textContent = metricas.modulosAtivos || 11;
      document.getElementById('kpi-modulos-total').textContent = metricas.totalModulos || 11;
    }

    function renderizarSeletorNegocios() {
      const container = document.getElementById('container-seletor-negocios');
      container.innerHTML = negociosCache.map(neg => {
        const ativo = neg.id === negocioSelecionadoId;
        const classeAtiva = ativo
          ? 'bg-emerald-900/90 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50'
          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50';

        return \`
          <button onclick="selecionarNegocio('\${neg.id}')" class="p-3 rounded-xl border text-left transition flex flex-col justify-between \${classeAtiva}">
            <div class="flex items-center justify-between mb-2">
              <i class="fa-solid \${neg.icone} text-lg \${ativo ? 'text-emerald-300' : 'text-slate-400'}"></i>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded \${ativo ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-600'}">\${(neg.modulos || []).length} mods</span>
            </div>
            <p class="font-bold text-xs leading-tight">\${neg.nome}</p>
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
      document.getElementById('negocio-icone').className = \`fa-solid \${neg.icone}\`;
      document.getElementById('negocio-icone-container').style.backgroundColor = neg.corPrimaria || '#0c4a34';
      document.getElementById('contador-modulos-negocio').textContent = \`\${(neg.modulos || []).length} módulos cadastrados\`;

      const grid = document.getElementById('grid-modulos-negocio');
      if (!neg.modulos || neg.modulos.length === 0) {
        grid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400 bg-slate-50 rounded-xl">Nenhum módulo configurado para este negócio. Clique em \"Adicionar Módulo\" para habilitar.</div>';
        return;
      }

      grid.innerHTML = neg.modulos.map(m => {
        return \`
          <div class="p-4 rounded-xl border \${m.ativo ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50/70 opacity-75'} shadow-sm flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg \${m.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-sm">
                    <i class="fa-solid \${m.icone || 'fa-cube'}"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-xs text-slate-900">\${m.nome}</h4>
                    <span class="font-mono text-[10px] text-slate-400">\${m.codigo}</span>
                  </div>
                </div>
                <button onclick="alternarStatus('\${neg.id}', '\${m.id}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition \${m.ativo ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}">
                  \${m.ativo ? '● Ativo' : '○ Inativo'}
                </button>
              </div>

              <p class="text-xs text-slate-600 mt-2">\${m.descricao}</p>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span class="font-mono text-slate-500">\${m.rotaUrl}</span>
              <div class="flex items-center gap-1.5">
                <a href="\${m.rotaUrl}" class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition" title="Abrir Módulo">
                  <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Acessar
                </a>
                <button onclick="excluirModulo('\${neg.id}', '\${m.id}')" class="p-1 text-slate-400 hover:text-rose-600 transition" title="Remover Módulo">
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

    function fecharModalAdicionarModulo() {
      document.getElementById('modal-add-modulo').classList.add('hidden');
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
        if (res.sucesso || res.id) {
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
      if (!confirm('Deseja realmente remover este módulo deste negócio?')) return;
      try {
        const resp = await fetch(\`/api/v1/admin/modulos/\${negocioId}/\${moduloId}\`, {
          method: 'DELETE',
        });
        if (resp.ok) {
          await carregarNegocios();
        }
      } catch (err) {
        console.error('Falha ao excluir módulo:', err);
      }
    }

    carregarNegocios();
  </script>
</body>
</html>`;
}
