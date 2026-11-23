/**
 * Renderiza o Painel de Gestão de E-Commerce & Omnichannel Multi-Negócio do BancoFé (/admin/ecommerce)
 * Conecta 100% das lojas virtuais e canais do ecossistema:
 * - Zuma Cozinha Oriental (Delivery, Cardápio Digital & Takeaway)
 * - Casa Nova Imóveis & Construtora (Catálogo Imobiliário & Financiamentos Habitacionais)
 * - Zuma Moda & Boutique (Varejo de Roupas, Malas Condicionais e Crediário)
 * - Agropecuária UISA / Agro Open (Insumos, Mudas, Sementes e Maquinário Agrícola)
 * - Barbearia Dino (Agendamento & Cosméticos)
 * - Stallone Nutre Sport (Suplementos & Nutrição Esportiva)
 */
export function renderizarHtmlAdminEcommerce(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin E-Commerce & Omnichannel • BancoFé Holding</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #071510; color: #f1f5f9; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .bg-bancofe-dark { background-color: #071510; }
    .bg-bancofe-card { background-color: #0d281e; }
    .border-bancofe { border-color: rgba(16, 185, 129, 0.2); }
    .card-transition { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased">

  <!-- TOPBAR BANCOFÉ VERDE INSTITUCIONAL -->
  <header class="bg-[#05110c] text-white border-b border-emerald-900/60 sticky top-0 z-50 shadow-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- Brand & Admin Console -->
      <div class="flex items-center gap-3 shrink-0">
        <a href="/admin" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-emerald-400/30">
            <i class="fa-solid fa-cart-shopping text-emerald-100"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg font-extrabold tracking-tight text-white">Banco<span class="text-emerald-400">Fé</span></span>
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">E-Commerce Admin</span>
            </div>
            <p class="text-[11px] text-emerald-400/80">Gestão Omnichannel Multi-Loja & Liquidação D+0</p>
          </div>
        </a>
      </div>

      <!-- Navegação Principal -->
      <nav class="hidden xl:flex items-center gap-1.5 text-xs font-semibold">
        <a href="/" class="px-3 py-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-house text-emerald-400"></i> Home
        </a>
        <a href="/admin/mesa-credito" class="px-3 py-1.5 rounded-lg text-emerald-200 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-scale-balanced text-emerald-400"></i> Mesa de Crédito
        </a>
        <a href="/admin/crm-financeira" class="px-3 py-1.5 rounded-lg text-emerald-200 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-briefcase text-emerald-400"></i> Operações & CRM
        </a>
        <a href="/admin/ecommerce" class="px-3 py-1.5 rounded-lg bg-emerald-800 text-white border border-emerald-500/50 transition flex items-center gap-1.5 shadow-sm">
          <i class="fa-solid fa-store text-emerald-300"></i> E-Commerce Hub
        </a>
        <a href="/admin/cadastro-360" class="px-3 py-1.5 rounded-lg text-emerald-200 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-id-card-clip text-emerald-400"></i> Cadastro 360
        </a>
        <a href="/consulta-360" class="px-3 py-1.5 rounded-lg text-emerald-200 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-magnifying-glass text-teal-400"></i> Consulta 360
        </a>
        <a href="/admin" class="px-3 py-1.5 rounded-lg text-emerald-200 hover:bg-emerald-950/70 border border-transparent hover:border-emerald-800/60 transition flex items-center gap-1.5">
          <i class="fa-solid fa-cubes text-emerald-400"></i> Gestão de Módulos
        </a>
        <a href="/admin/backoffice" class="px-3 py-1.5 rounded-lg text-emerald-300/80 hover:text-white hover:bg-emerald-950/50 transition flex items-center gap-1.5">
          <i class="fa-solid fa-server text-teal-400"></i> Backoffice
        </a>
      </nav>

      <!-- Perfil Operador & Ações -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-bold text-slate-100">Rodrigo Ribeiro Gonçalves</p>
          <div class="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ADMINISTRADOR GERAL • PRD</span>
          </div>
        </div>
        <a href="/login" class="p-2 rounded-lg bg-emerald-950/80 hover:bg-rose-950/50 border border-emerald-800/60 hover:border-rose-700/50 text-emerald-300 hover:text-rose-300 transition" title="Sessão Corporativa">
          <i class="fa-solid fa-shield-halved"></i>
        </a>
      </div>
    </div>
  </header>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

    <!-- CABEÇALHO DO MÓDULO E-COMMERCE -->
    <div class="bg-[#0c241a] p-6 rounded-2xl border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
            <i class="fa-solid fa-network-wired mr-1 text-emerald-400"></i>E-Commerce & Omnichannel Multi-Empresa
          </span>
          <span class="text-xs text-emerald-400/80">• Gateway BancoFé Pay Integrado</span>
          <span class="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-700/40">Liquidação D+0 Pix</span>
        </div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight mt-1.5">
          Cockpit Administrativo de Vendas Digitais
        </h1>
        <p class="text-sm text-slate-300 mt-1">
          Catálogo unificado, pedidos em tempo real, split de pagamento por CNPJ e integração direta com a esteira de crédito do BancoFé.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap">
        <a href="/admin/crm-financeira" class="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-2">
          <i class="fa-solid fa-hand-holding-dollar"></i> Mesa de Operações
        </a>
        <a href="/plataforma/consulta-cpf" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition flex items-center gap-2">
          <i class="fa-solid fa-magnifying-glass"></i> Consulta 360°
        </a>
      </div>
    </div>

    <!-- CARDS DE KPIS EM TEMPO REAL -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>GMV Mensal Consolidado</span>
          <i class="fa-solid fa-chart-line text-emerald-400"></i>
        </div>
        <div class="text-2xl font-extrabold text-emerald-400 font-mono">R$ 1.845.290,00</div>
        <div class="text-xs text-emerald-500 font-semibold mt-1">
          <i class="fa-solid fa-arrow-trend-up mr-1"></i>+18,4% vs mês anterior
        </div>
      </div>

      <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Pedidos Hoje (Omnichannel)</span>
          <i class="fa-solid fa-bag-shopping text-emerald-400"></i>
        </div>
        <div class="text-2xl font-extrabold text-white font-mono">142 pedidos</div>
        <div class="text-xs text-slate-400 mt-1">
          98 Delivery • 32 Retirada • 12 Mesa
        </div>
      </div>

      <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Ticket Médio Geral</span>
          <i class="fa-solid fa-receipt text-emerald-400"></i>
        </div>
        <div class="text-2xl font-extrabold text-white font-mono">R$ 164,80</div>
        <div class="text-xs text-emerald-400 mt-1">
          Taxa de conversão: 4,8%
        </div>
      </div>

      <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 shadow-md">
        <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Split BancoFé Pay (D+0)</span>
          <i class="fa-solid fa-bolt text-amber-400"></i>
        </div>
        <div class="text-2xl font-extrabold text-amber-400 font-mono">100% Automático</div>
        <div class="text-xs text-slate-400 mt-1">
          Liquidação direta nas subcontas
        </div>
      </div>
    </div>

    <!-- SELETOR DE LOJAS DA HOLDING -->
    <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <i class="fa-solid fa-store text-emerald-400"></i> Lojas & Vitrines Virtuais da Holding
        </h3>
        <span class="text-xs text-slate-400">6 Storefronts Ativos • Multi-Tenant</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <!-- Zuma Gastronomia -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-utensils text-emerald-400"></i> Zuma Cozinha Oriental
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Delivery, Cardápio Digital, 27 Mesas & KDS Integrado</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Faturamento: <strong class="text-emerald-400 font-mono">R$ 284.500</strong></span>
            <a href="/cardapio" class="text-emerald-400 hover:underline">Ver Loja →</a>
          </div>
        </div>

        <!-- Casa Nova Imóveis -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-house-chimney text-emerald-400"></i> Casa Nova Imóveis
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Catálogo de Imóveis, Loteamentos e Crédito Imobiliário</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Pipeline: <strong class="text-emerald-400 font-mono">R$ 14.200.000</strong></span>
            <a href="/plataforma/precadastro" class="text-emerald-400 hover:underline">Ver Imóveis →</a>
          </div>
        </div>

        <!-- Zuma Moda -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-shirt text-emerald-400"></i> Zuma Moda & Boutique
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Moda Feminina/Masculina, Malas Condicionais e EAN-13</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Faturamento: <strong class="text-emerald-400 font-mono">R$ 142.000</strong></span>
            <a href="/moda" class="text-emerald-400 hover:underline">Ver Catálogo →</a>
          </div>
        </div>

        <!-- Agropecuária UISA -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-wheat-awn text-emerald-400"></i> Agro & Cana (UISA)
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Insumos, Mudas de Cana, Commodities e Financiamento Barter</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Volume: <strong class="text-emerald-400 font-mono">R$ 8.920.000</strong></span>
            <a href="/agro" class="text-emerald-400 hover:underline">Ver Safra →</a>
          </div>
        </div>

        <!-- Barbearia Dino -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-scissors text-emerald-400"></i> Barbearia Dino
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Agendamentos Online, Cosméticos e Clube de Assinatura</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Faturamento: <strong class="text-emerald-400 font-mono">R$ 48.000</strong></span>
            <a href="/admin" class="text-emerald-400 hover:underline">Ver Serviços →</a>
          </div>
        </div>

        <!-- Stallone Nutre -->
        <div class="p-4 rounded-xl bg-[#0e271e] border border-emerald-700/40 hover:border-emerald-500 transition space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fa-solid fa-dumbbell text-emerald-400"></i> Stallone Nutre Sport
            </span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Ativa</span>
          </div>
          <p class="text-xs text-slate-300">Suplementação, Creatinas, Whey Protein e Vitaminas</p>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-emerald-900/50">
            <span>Faturamento: <strong class="text-emerald-400 font-mono">R$ 96.500</strong></span>
            <a href="/admin" class="text-emerald-400 hover:underline">Ver Produtos →</a>
          </div>
        </div>
      </div>
    </div>

    <!-- TABELA DE PEDIDOS EM TEMPO REAL -->
    <div class="bg-[#0b1d16] p-5 rounded-2xl border border-emerald-900/60 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-emerald-400"></i> Últimos Pedidos Omnichannel
        </h3>
        <span class="text-xs text-slate-400">Sincronização em Tempo Real (WebSocket / D+0)</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-emerald-900/70 text-slate-400 uppercase tracking-wider text-[11px]">
              <th class="py-3 px-3">Pedido</th>
              <th class="py-3 px-3">Loja</th>
              <th class="py-3 px-3">Cliente</th>
              <th class="py-3 px-3">Canal</th>
              <th class="py-3 px-3">Valor Total</th>
              <th class="py-3 px-3">Pagamento</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-emerald-950/60 font-medium">
            <tr class="hover:bg-emerald-950/30 transition">
              <td class="py-3 px-3 font-mono font-bold text-white">#PED-8842</td>
              <td class="py-3 px-3 text-emerald-300">Zuma Gastronomia</td>
              <td class="py-3 px-3 text-slate-200">Lucas Silveira (069.***.***-61)</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50">WhatsApp Zumi</span></td>
              <td class="py-3 px-3 font-mono font-bold text-emerald-400">R$ 218,00</td>
              <td class="py-3 px-3 text-slate-300"><i class="fa-brands fa-pix text-emerald-400 mr-1"></i> PIX D+0</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900 text-emerald-300">Em Separação</span></td>
              <td class="py-3 px-3 text-right">
                <a href="/cozinha" class="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] transition">Ver KDS</a>
              </td>
            </tr>
            <tr class="hover:bg-emerald-950/30 transition">
              <td class="py-3 px-3 font-mono font-bold text-white">#PED-8841</td>
              <td class="py-3 px-3 text-emerald-300">Zuma Moda & Boutique</td>
              <td class="py-3 px-3 text-slate-200">Mariana Albuquerque Costa</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-700/50">Mala Condicional</span></td>
              <td class="py-3 px-3 font-mono font-bold text-emerald-400">R$ 1.480,00</td>
              <td class="py-3 px-3 text-slate-300"><i class="fa-solid fa-credit-card text-purple-400 mr-1"></i> Cartão D+1</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900 text-purple-300">Entregue Condicional</span></td>
              <td class="py-3 px-3 text-right">
                <a href="/moda" class="px-2.5 py-1 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-[11px] transition">Ver Mala</a>
              </td>
            </tr>
            <tr class="hover:bg-emerald-950/30 transition">
              <td class="py-3 px-3 font-mono font-bold text-white">#PED-8840</td>
              <td class="py-3 px-3 text-emerald-300">Casa Nova Imóveis</td>
              <td class="py-3 px-3 text-slate-200">Construtora Tangará Ltda</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-700/50">Financiamento B2B</span></td>
              <td class="py-3 px-3 font-mono font-bold text-emerald-400">R$ 450.000,00</td>
              <td class="py-3 px-3 text-slate-300"><i class="fa-solid fa-file-contract text-amber-400 mr-1"></i> CCB BancoFé</td>
              <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-300">Em Análise Mesa</span></td>
              <td class="py-3 px-3 text-right">
                <a href="/admin/crm-financeira" class="px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-white font-bold text-[11px] transition">Mesa Crédito</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </main>

  <!-- RODAPÉ INSTITUCIONAL -->
  <footer class="bg-[#05110c] border-t border-emerald-950 py-6 text-xs text-slate-400 text-center">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="font-extrabold text-white">BancoFé Holding & S/A</span>
        <span>•</span>
        <span>Plataforma E-Commerce & Omnichannel</span>
        <span>•</span>
        <span class="text-emerald-400 font-mono">ISPB 799</span>
      </div>
      <div class="text-slate-400 text-[11px]">
        Conformidade BACEN, LGPD e Liquidação Instantânea PIX
      </div>
    </div>
  </footer>

</body>
</html>`;
}
