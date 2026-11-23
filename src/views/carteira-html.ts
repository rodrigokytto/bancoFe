/**
 * Interface Web Interativa da Carteira Digital, Gestão de Cartões, PIX e Carga de Créditos
 * Plataforma Casanova / Kytto Tecnologia (CNPJ 53.338.003/0001-04)
 */

import { CONFIG_OFICIAL_KYTTO } from "../config-kytto.ts";

export function renderizarHtmlCarteiraDigital(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carteira Digital & Gestão de Créditos | Casanova DataGraph</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .card-preview {
      background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #0f172a 100%);
      box-shadow: 0 20px 25px -5px rgba(30, 58, 138, 0.3), 0 8px 10px -6px rgba(30, 58, 138, 0.2);
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Header Institucional -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <a href="/" class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i class="fa-solid fa-wallet text-white text-lg"></i>
          </div>
          <div>
            <span class="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Carteira Digital <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">Bureaus & Créditos</span>
            </span>
            <p class="text-xs text-slate-400">${CONFIG_OFICIAL_KYTTO.empresa.razaoSocial} • CNPJ ${CONFIG_OFICIAL_KYTTO.empresa.cnpj}</p>
          </div>
        </a>
      </div>

      <div class="flex items-center space-x-4">
        <div class="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center space-x-2">
          <span class="text-xs text-slate-400">Saldo Disponível:</span>
          <span id="header-saldo" class="text-sm font-extrabold text-emerald-400 mono">R$ --,--</span>
        </div>
        <a href="/" class="text-xs px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition flex items-center gap-1.5">
          <i class="fa-solid fa-arrow-left"></i> Voltar à Consulta 360
        </a>
      </div>
    </div>
  </header>

  <!-- Container Principal -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

    <!-- Card de Boas-Vindas e Resumo da Carteira -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Saldo e Recarga Rápida -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">Saldo da Conta</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Ativo</span>
          </div>
          <div class="text-3xl font-black text-white mono mb-1" id="box-saldo">R$ --,--</div>
          <p class="text-xs text-slate-400 flex items-center gap-1">
            <i class="fa-solid fa-circle-check text-emerald-400"></i>
            Aprox. <span id="box-consultas-restantes" class="font-bold text-slate-200">--</span> consultas Serasa / Bureaus
          </p>
        </div>
        <div class="pt-6">
          <button onclick="scrollToTopup()" class="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition">
            <i class="fa-solid fa-plus-circle"></i> Recarregar Créditos Agora
          </button>
        </div>
      </div>

      <!-- Métodos de Pagamento Cadastrados -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">Métodos Cadastrados</span>
            <span class="text-xs text-indigo-400"><i class="fa-solid fa-shield-halved"></i> PCI-DSS Vault</span>
          </div>
          <div class="space-y-2 mt-3">
            <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span class="text-slate-300 flex items-center gap-2">
                <i class="fa-solid fa-credit-card text-blue-400"></i> Cartões de Crédito:
              </span>
              <span id="count-cartoes" class="font-bold text-white mono">0</span>
            </div>
            <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/60 border border-slate-700">
              <span class="text-slate-300 flex items-center gap-2">
                <i class="fa-brands fa-pix text-teal-400"></i> Chaves PIX Bacen:
              </span>
              <span id="count-pix" class="font-bold text-white mono">0</span>
            </div>
          </div>
        </div>
        <div class="pt-4 flex gap-2">
          <button onclick="abrirModalCartao()" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition">
            <i class="fa-solid fa-plus text-blue-400"></i> Cartão
          </button>
          <button onclick="abrirModalPix()" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition">
            <i class="fa-solid fa-plus text-teal-400"></i> Chave PIX
          </button>
        </div>
      </div>

      <!-- Auto-Recarga Inteligente -->
      <div class="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs uppercase font-bold text-slate-400 tracking-wider">Auto-Recarga</span>
            <span id="status-autorecarga-badge" class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">Desativada</span>
          </div>
          <p class="text-xs text-slate-400 mt-2">
            Evite interrupções nas consultas automatizando a recarga quando o saldo atingir um nível mínimo.
          </p>
          <div class="mt-3 text-xs p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60 text-slate-300">
            <span id="desc-autorecarga">Nenhuma regra de auto-recarga configurada no momento.</span>
          </div>
        </div>
        <div class="pt-4">
          <button onclick="abrirConfigAutoRecarga()" class="w-full py-2 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/60 text-purple-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition">
            <i class="fa-solid fa-gear"></i> Configurar Regra
          </button>
        </div>
      </div>
    </div>

    <!-- Navegação de Abas da Carteira -->
    <div class="border-b border-slate-800 flex space-x-6">
      <button onclick="trocarAbaCarteira('topup')" id="tab-btn-topup" class="pb-3 text-sm font-semibold border-b-2 border-emerald-500 text-emerald-400 flex items-center gap-2">
        <i class="fa-solid fa-bolt"></i> Carga de Créditos (Opção 3)
      </button>
      <button onclick="trocarAbaCarteira('cartoes')" id="tab-btn-cartoes" class="pb-3 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2">
        <i class="fa-solid fa-credit-card"></i> Cartões de Crédito (Opção 1)
      </button>
      <button onclick="trocarAbaCarteira('pix')" id="tab-btn-pix" class="pb-3 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2">
        <i class="fa-brands fa-pix"></i> Chaves PIX Bacen (Opção 2)
      </button>
      <button onclick="trocarAbaCarteira('extrato')" id="tab-btn-extrato" class="pb-3 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2">
        <i class="fa-solid fa-receipt"></i> Extrato & Livro-Razão
      </button>
    </div>

    <!-- ABA 1: CARGA DE CRÉDITOS (OPÇÃO 3) -->
    <div id="aba-topup" class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-circle-dollar-to-slot text-emerald-400"></i> Escolha um Pacote de Créditos ou Valor Personalizado
        </h2>
        <p class="text-xs text-slate-400">
          Créditos válidos para todas as consultas: Serasa Experian, Quod, SPC, CENPROT Protestos e Dossiês Periciais 360.
        </p>
      </div>

      <!-- Pacotes Comerciais -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Starter -->
        <div onclick="selecionarPacote(50.0)" class="cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-2xl p-5 shadow-lg transition duration-150 flex flex-col justify-between relative group">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Starter Imobiliário</div>
            <div class="text-2xl font-black text-white mono mb-2">R$ 50,00</div>
            <div class="text-xs text-slate-400 space-y-1.5">
              <p>✓ 20 Consultas Completas</p>
              <p>✓ Serasa, SPC e Quod</p>
              <p>✓ Relatório em PDF pericial</p>
            </div>
          </div>
          <button class="mt-4 w-full py-2 bg-slate-800 group-hover:bg-blue-600 text-white font-semibold rounded-xl text-xs transition">
            Selecionar Pacote
          </button>
        </div>

        <!-- Pro (Popular) -->
        <div onclick="selecionarPacote(100.0)" class="cursor-pointer bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-500 rounded-2xl p-5 shadow-xl transition duration-150 flex flex-col justify-between relative group">
          <div class="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Mais Escolhido
          </div>
          <div>
            <div class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Profissional Pro</div>
            <div class="text-2xl font-black text-white mono mb-2">R$ 100,00</div>
            <div class="text-xs text-slate-300 space-y-1.5">
              <p class="text-emerald-400 font-semibold">+ 12.5% de Bônus Kytto</p>
              <p>✓ 45 Consultas Completas</p>
              <p>✓ Grafo de Relacionamentos</p>
              <p>✓ Exportação Excel 6 Abas</p>
            </div>
          </div>
          <button class="mt-4 w-full py-2 bg-blue-600 group-hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition">
            Selecionar Pacote
          </button>
        </div>

        <!-- Business -->
        <div onclick="selecionarPacote(250.0)" class="cursor-pointer bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-5 shadow-lg transition duration-150 flex flex-col justify-between relative group">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Business Enterprise</div>
            <div class="text-2xl font-black text-white mono mb-2">R$ 250,00</div>
            <div class="text-xs text-slate-400 space-y-1.5">
              <p class="text-emerald-400 font-semibold">+ 20% de Bônus Kytto</p>
              <p>✓ 120 Consultas Completas</p>
              <p>✓ Multi-usuários e Tenants</p>
              <p>✓ Desambiguação de Homônimos IA</p>
            </div>
          </div>
          <button class="mt-4 w-full py-2 bg-slate-800 group-hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs transition">
            Selecionar Pacote
          </button>
        </div>

        <!-- Unlimited VIP -->
        <div onclick="selecionarPacote(500.0)" class="cursor-pointer bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-2xl p-5 shadow-lg transition duration-150 flex flex-col justify-between relative group">
          <div>
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Corporativo Master VIP</div>
            <div class="text-2xl font-black text-white mono mb-2">R$ 500,00</div>
            <div class="text-xs text-slate-400 space-y-1.5">
              <p class="text-emerald-400 font-semibold">+ 30% de Bônus Kytto</p>
              <p>✓ 260 Consultas Completas</p>
              <p>✓ Prioridade de Fila M-LED</p>
              <p>✓ API RESTful Ilimitada</p>
            </div>
          </div>
          <button class="mt-4 w-full py-2 bg-slate-800 group-hover:bg-purple-600 text-white font-semibold rounded-xl text-xs transition">
            Selecionar Pacote
          </button>
        </div>
      </div>

      <!-- Checkout e Seleção de Forma de Pagamento -->
      <div class="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-5 space-y-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-sliders text-blue-400"></i> Valor da Carga
          </h3>
          <div>
            <label class="block text-xs text-slate-400 mb-1">Valor em Reais (R$)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold text-sm">R$</span>
              <input type="number" id="input-valor-recarga" value="100.00" min="10" step="5"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-extrabold mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between text-slate-400">
              <span>Beneficiário Oficial:</span>
              <span class="text-white font-semibold">${CONFIG_OFICIAL_KYTTO.empresa.razaoSocial}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>CNPJ Emissor:</span>
              <span class="text-white font-semibold mono">${CONFIG_OFICIAL_KYTTO.empresa.cnpj}</span>
            </div>
            <div class="flex justify-between text-slate-400">
              <span>Liberação:</span>
              <span class="text-emerald-400 font-semibold">Instantânea</span>
            </div>
          </div>
        </div>

        <div class="md:col-span-7 flex flex-col justify-center space-y-4">
          <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-credit-card text-emerald-400"></i> Finalizar Pagamento
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Pagar com Cartão Cadastrado -->
            <button onclick="pagarComCartaoPadrao()" id="btn-pay-card" class="p-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-left shadow-lg shadow-blue-700/20 transition flex flex-col justify-between">
              <div>
                <i class="fa-solid fa-credit-card text-xl mb-2 text-blue-200"></i>
                <div class="font-bold text-sm">Pagar com Cartão</div>
                <div class="text-[11px] text-blue-200" id="btn-pay-card-desc">Carregando cartões...</div>
              </div>
              <span class="text-[10px] uppercase font-bold text-blue-200 mt-3 flex items-center gap-1">
                Cobrança 1-Clique <i class="fa-solid fa-arrow-right"></i>
              </span>
            </button>

            <!-- Pagar com PIX Instantâneo -->
            <button onclick="gerarQrCodePixRecarga()" class="p-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 text-white text-left shadow-lg shadow-teal-700/20 transition flex flex-col justify-between">
              <div>
                <i class="fa-brands fa-pix text-xl mb-2 text-teal-200"></i>
                <div class="font-bold text-sm">Pagar com PIX</div>
                <div class="text-[11px] text-teal-200">QR Code Dinâmico Copia e Cola</div>
              </div>
              <span class="text-[10px] uppercase font-bold text-teal-200 mt-3 flex items-center gap-1">
                Gera Chave Pix Instantânea <i class="fa-solid fa-bolt"></i>
              </span>
            </button>
          </div>

          <!-- Área de Exibição do PIX Gerado -->
          <div id="area-pix-resultado" class="hidden p-4 rounded-xl bg-slate-950 border border-teal-500/40 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                <i class="fa-solid fa-qrcode"></i> PIX Copia e Cola Gerado (Válido por 30 minutos)
              </span>
              <button onclick="fecharAreaPix()" class="text-slate-500 hover:text-slate-300 text-xs">✕</button>
            </div>
            <textarea id="pix-copia-cola-text" readonly rows="3" class="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 text-xs mono focus:outline-none"></textarea>
            <div class="flex items-center gap-2">
              <button onclick="copiarPix()" id="btn-copiar-pix" class="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition">
                <i class="fa-regular fa-copy"></i> Copiar Código PIX
              </button>
              <button onclick="simularConfirmacaoPix()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition">
                Já Paguei (Liberar)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ABA 2: GESTÃO DE CARTÕES DE CRÉDITO (OPÇÃO 1) -->
    <div id="aba-cartoes" class="hidden space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-credit-card text-blue-400"></i> Cartões de Crédito Cadastrados
          </h2>
          <p class="text-xs text-slate-400">
            Tokenização de segurança PCI-DSS. Nenhum dado sensível de CVV é armazenado em disco.
          </p>
        </div>
        <button onclick="abrirModalCartao()" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition">
          <i class="fa-solid fa-plus"></i> Novo Cartão
        </button>
      </div>

      <!-- Lista de Cartões Cadastrados -->
      <div id="lista-cartoes-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Renderizado dinamicamente via JS -->
      </div>
    </div>

    <!-- ABA 3: GESTÃO DE CHAVES PIX (OPÇÃO 2) -->
    <div id="aba-pix" class="hidden space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-brands fa-pix text-teal-400"></i> Chaves PIX Bacen Cadastradas
          </h2>
          <p class="text-xs text-slate-400">
            Validação estrita no Diretório de Identificadores de Contas Transacionais (DICT Bacen).
          </p>
        </div>
        <button onclick="abrirModalPix()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-teal-600/20 transition">
          <i class="fa-solid fa-plus"></i> Nova Chave PIX
        </button>
      </div>

      <!-- Lista de Chaves PIX -->
      <div id="lista-pix-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Renderizado dinamicamente via JS -->
      </div>
    </div>

    <!-- ABA 4: EXTRATO & LIVRO-RAZÃO (WALLET LEDGER) -->
    <div id="aba-extrato" class="hidden space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-receipt text-indigo-400"></i> Extrato Financeiro & Livro-Razão (Wallet Ledger)
          </h2>
          <p class="text-xs text-slate-400">
            Auditoria imutável com comprovantes criptográficos SHA-256 de cada transação de crédito e débito.
          </p>
        </div>
        <button onclick="carregarExtrato()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700 flex items-center gap-1.5 transition">
          <i class="fa-solid fa-rotate text-blue-400"></i> Atualizar
        </button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th class="px-4 py-3">Data / Hora</th>
                <th class="px-4 py-3">Tipo</th>
                <th class="px-4 py-3">Descrição</th>
                <th class="px-4 py-3">Forma Pagto</th>
                <th class="px-4 py-3 text-right">Valor</th>
                <th class="px-4 py-3 text-right">Saldo Após</th>
                <th class="px-4 py-3 text-center">Status</th>
                <th class="px-4 py-3 text-center">Comprovante</th>
              </tr>
            </thead>
            <tbody id="tabela-extrato-corpo" class="divide-y divide-slate-800">
              <!-- Renderizado via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </main>

  <!-- MODAL: CADASTRAR NOVO CARTÃO DE CRÉDITO -->
  <div id="modal-cartao" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-credit-card text-blue-400"></i> Cadastrar Cartão de Crédito
        </h3>
        <button onclick="fecharModalCartao()" class="text-slate-400 hover:text-white">✕</button>
      </div>

      <!-- Preview do Cartão com Renderização em Tempo Real -->
      <div class="card-preview rounded-2xl p-5 text-white h-44 flex flex-col justify-between shadow-xl relative overflow-hidden border border-white/10">
        <div class="flex justify-between items-center">
          <i class="fa-solid fa-microchip text-yellow-400 text-2xl"></i>
          <span id="preview-bandeira" class="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/20">CARTÃO</span>
        </div>
        <div id="preview-numero" class="text-lg font-bold mono tracking-widest text-center">•••• •••• •••• ••••</div>
        <div class="flex justify-between items-end text-xs">
          <div>
            <div class="text-[9px] uppercase tracking-wider text-slate-300">Titular</div>
            <div id="preview-titular" class="font-bold truncate max-w-[180px]">NOME DO TITULAR</div>
          </div>
          <div>
            <div class="text-[9px] uppercase tracking-wider text-slate-300 text-right">Validade</div>
            <div id="preview-validade" class="font-bold mono">MM/AA</div>
          </div>
        </div>
      </div>

      <!-- Formulário -->
      <form id="form-cadastrar-cartao" onsubmit="submeterNovoCartao(event)" class="space-y-3.5">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Número do Cartão</label>
          <input type="text" id="input-cartao-numero" required maxlength="19" placeholder="0000 0000 0000 0000"
            oninput="formatarNumeroCartaoPreview(this)"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Nome Impresso no Cartão</label>
          <input type="text" id="input-cartao-titular" required placeholder="NOME DO TITULAR"
            oninput="atualizarTitularPreview(this)"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-400 mb-1">Validade (MM/AA)</label>
            <input type="text" id="input-cartao-validade" required maxlength="5" placeholder="12/29"
              oninput="formatarValidadePreview(this)"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1">CVV (Segurança)</label>
            <input type="password" id="input-cartao-cvv" required maxlength="4" placeholder="123"
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white mono text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
        </div>

        <div class="flex items-center space-x-2 pt-1">
          <input type="checkbox" id="check-cartao-padrao" checked class="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500">
          <label for="check-cartao-padrao" class="text-xs text-slate-300">Definir como cartão principal de recarga</label>
        </div>

        <div class="pt-2 flex gap-2">
          <button type="button" onclick="fecharModalCartao()" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition">
            Cancelar
          </button>
          <button type="submit" id="btn-submit-cartao" class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition">
            Salvar e Tokenizar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: CADASTRAR NOVA CHAVE PIX -->
  <div id="modal-pix" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-brands fa-pix text-teal-400"></i> Cadastrar Chave PIX Bacen
        </h3>
        <button onclick="fecharModalPix()" class="text-slate-400 hover:text-white">✕</button>
      </div>

      <form id="form-cadastrar-pix" onsubmit="submeterNovaChavePix(event)" class="space-y-3.5">
        <div>
          <label class="block text-xs text-slate-400 mb-1">Chave PIX (CPF, CNPJ, E-mail, Celular ou EVP)</label>
          <input type="text" id="input-pix-chave" required placeholder="53.338.003/0001-04 ou email@empresa.com.br"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>

        <div>
          <label class="block text-xs text-slate-400 mb-1">Descrição / Finalidade</label>
          <input type="text" id="input-pix-descricao" placeholder="Ex: Conta Matriz Kytto"
            class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
        </div>

        <div class="flex items-center space-x-2 pt-1">
          <input type="checkbox" id="check-pix-padrao" checked class="rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500">
          <label for="check-pix-padrao" class="text-xs text-slate-300">Definir como chave PIX padrão</label>
        </div>

        <div class="pt-2 flex gap-2">
          <button type="button" onclick="fecharModalPix()" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition">
            Cancelar
          </button>
          <button type="submit" id="btn-submit-pix" class="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs transition">
            Validar e Salvar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- SCRIPT DE INTERATIVIDADE -->
  <script>
    let dadosCarteira = null;
    let ultimaOrdemPix = null;

    // Inicialização
    document.addEventListener("DOMContentLoaded", () => {
      carregarDadosCarteira();
      carregarExtrato();
    });

    async function carregarDadosCarteira() {
      try {
        const resp = await fetch("/api/v1/carteira/saldo");
        if (resp.ok) {
          dadosCarteira = await resp.json();
          atualizarInterfaceResumo();
          renderizarListaCartoes();
          renderizarListaPix();
        }
      } catch (err) {
        console.error("Erro ao carregar saldo da carteira:", err);
      }
    }

    function atualizarInterfaceResumo() {
      if (!dadosCarteira) return;
      const saldoFmt = "R$ " + dadosCarteira.saldoReais.toFixed(2);
      document.getElementById("header-saldo").innerText = saldoFmt;
      document.getElementById("box-saldo").innerText = saldoFmt;
      document.getElementById("box-consultas-restantes").innerText = dadosCarteira.consultasEstimadasRestantes;
      document.getElementById("count-cartoes").innerText = dadosCarteira.totalCartoes;
      document.getElementById("count-pix").innerText = dadosCarteira.totalChavesPix;

      // Auto-recarga
      const arBadge = document.getElementById("status-autorecarga-badge");
      const arDesc = document.getElementById("desc-autorecarga");
      if (dadosCarteira.autoRecarga?.ativa) {
        arBadge.className = "text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40";
        arBadge.innerText = "Ativa";
        arDesc.innerText = "Recarregar R$ " + dadosCarteira.autoRecarga.valorRecargaReais.toFixed(2) + " quando saldo cair para R$ " + dadosCarteira.autoRecarga.gatilhoSaldoMinimoReais.toFixed(2);
      } else {
        arBadge.className = "text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700";
        arBadge.innerText = "Desativada";
        arDesc.innerText = "Nenhuma regra de auto-recarga configurada no momento.";
      }

      // Botão pagar com cartão
      const btnCardDesc = document.getElementById("btn-pay-card-desc");
      if (dadosCarteira.cartaoPadrao) {
        btnCardDesc.innerText = dadosCarteira.cartaoPadrao.bandeira + " final " + dadosCarteira.cartaoPadrao.ultimos4Digitos;
      } else {
        btnCardDesc.innerText = "Nenhum cartão cadastrado";
      }
    }

    async function carregarExtrato() {
      try {
        const resp = await fetch("/api/v1/carteira/extrato");
        if (resp.ok) {
          const extrato = await resp.json();
          renderizarExtrato(extrato);
        }
      } catch (err) {
        console.error("Erro ao carregar extrato:", err);
      }
    }

    function renderizarExtrato(extrato) {
      const corpo = document.getElementById("tabela-extrato-corpo");
      corpo.innerHTML = "";
      if (!extrato || extrato.length === 0) {
        corpo.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-slate-500">Nenhuma transação registrada.</td></tr>';
        return;
      }

      extrato.forEach((tx) => {
        const isEntrada = tx.tipo.startsWith("RECARGA") || tx.tipo.startsWith("BONUS");
        const valorFmt = (isEntrada ? "+ R$ " : "- R$ ") + tx.valorReais.toFixed(2);
        const valorClass = isEntrada ? "text-emerald-400 font-bold" : "text-slate-300";

        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-800/40 transition";
        tr.innerHTML = \`
          <td class="px-4 py-3 text-slate-400 mono">\${new Date(tx.data).toLocaleString("pt-BR")}</td>
          <td class="px-4 py-3 font-semibold text-slate-200">\${tx.tipo}</td>
          <td class="px-4 py-3 text-slate-300">\${tx.descricao}</td>
          <td class="px-4 py-3 text-slate-400">\${tx.formaPagamento}</td>
          <td class="px-4 py-3 text-right mono \${valorClass}">\${valorFmt}</td>
          <td class="px-4 py-3 text-right mono text-slate-400">R$ \${tx.saldoAposReais.toFixed(2)}</td>
          <td class="px-4 py-3 text-center">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold \${tx.status === "CONCLUIDA" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}">
              \${tx.status}
            </span>
          </td>
          <td class="px-4 py-3 text-center mono text-[10px] text-slate-400" title="\${tx.comprovanteHash}">
            \${tx.comprovanteHash.slice(0, 10)}...
          </td>
        \`;
        corpo.appendChild(tr);
      });
    }

    async function renderizarListaCartoes() {
      try {
        const resp = await fetch("/api/v1/carteira/cartoes");
        if (!resp.ok) return;
        const cartoes = await resp.json();
        const container = document.getElementById("lista-cartoes-container");
        container.innerHTML = "";

        if (cartoes.length === 0) {
          container.innerHTML = '<div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">Nenhum cartão cadastrado ainda. Clique em "Novo Cartão" para adicionar.</div>';
          return;
        }

        cartoes.forEach((c) => {
          const cardEl = document.createElement("div");
          cardEl.className = "bg-slate-900 border " + (c.padrao ? "border-blue-500 shadow-blue-500/10" : "border-slate-800") + " rounded-2xl p-5 shadow-xl flex flex-col justify-between relative";
          cardEl.innerHTML = \`
            <div>
              <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
                  <i class="fa-solid fa-credit-card"></i> \${c.bandeira}
                </span>
                \${c.padrao ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">Principal</span>' : ''}
              </div>
              <div class="text-lg font-bold mono text-white mb-2">•••• •••• •••• \${c.ultimos4Digitos}</div>
              <div class="text-xs text-slate-400 uppercase truncate mb-1">\${c.nomeTitular}</div>
              <div class="text-xs text-slate-500 mono">Validade: \${c.mesExpiracao.toString().padStart(2, "0")}/\${c.anoExpiracao}</div>
            </div>
            <div class="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
              \${!c.padrao ? \`<button onclick="definirCartaoPadrao('\${c.id}')" class="text-xs text-blue-400 hover:text-blue-300 font-semibold">Tornar Principal</button>\` : '<span></span>'}
              <button onclick="removerCartao('\${c.id}')" class="text-xs text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
            </div>
          \`;
          container.appendChild(cardEl);
        });
      } catch (err) {
        console.error("Erro ao listar cartões:", err);
      }
    }

    async function renderizarListaPix() {
      try {
        const resp = await fetch("/api/v1/carteira/pix-chaves");
        if (!resp.ok) return;
        const chaves = await resp.json();
        const container = document.getElementById("lista-pix-container");
        container.innerHTML = "";

        if (chaves.length === 0) {
          container.innerHTML = '<div class="col-span-full p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">Nenhuma chave PIX cadastrada. Clique em "Nova Chave PIX" para adicionar.</div>';
          return;
        }

        chaves.forEach((k) => {
          const el = document.createElement("div");
          el.className = "bg-slate-900 border " + (k.padrao ? "border-teal-500 shadow-teal-500/10" : "border-slate-800") + " rounded-2xl p-5 shadow-xl flex flex-col justify-between";
          el.innerHTML = \`
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black uppercase text-teal-400 flex items-center gap-1.5">
                  <i class="fa-brands fa-pix"></i> \${k.tipo}
                </span>
                \${k.padrao ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">Padrão</span>' : ''}
              </div>
              <div class="text-sm font-bold mono text-white mb-1 truncate">\${k.chaveMascarada}</div>
              <div class="text-xs text-slate-400 truncate">\${k.descricao}</div>
            </div>
            <div class="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
              <span class="text-[10px] text-slate-500 mono">\${new Date(k.cadastradaEm).toLocaleDateString("pt-BR")}</span>
              <button onclick="removerChavePix('\${k.id}')" class="text-xs text-red-400 hover:text-red-300"><i class="fa-solid fa-trash"></i></button>
            </div>
          \`;
          container.appendChild(el);
        });
      } catch (err) {
        console.error("Erro ao listar chaves PIX:", err);
      }
    }

    // Ações de Cadastro
    async function submeterNovoCartao(event) {
      event.preventDefault();
      const num = document.getElementById("input-cartao-numero").value;
      const titular = document.getElementById("input-cartao-titular").value;
      const validade = document.getElementById("input-cartao-validade").value;
      const cvv = document.getElementById("input-cartao-cvv").value;
      const padrao = document.getElementById("check-cartao-padrao").checked;

      const [mes, ano] = validade.split("/").map(Number);

      try {
        const resp = await fetch("/api/v1/carteira/cartoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numeroCartao: num,
            nomeTitular: titular,
            mesExpiracao: mes,
            anoExpiracao: ano,
            cvv,
            definirComoPadrao: padrao,
          }),
        });

        const res = await resp.json();
        if (resp.ok && res.sucesso) {
          alert("Cartão cadastrado com sucesso!");
          fecharModalCartao();
          carregarDadosCarteira();
        } else {
          alert("Erro: " + (res.detalhes || res.erro || "Falha no cadastro do cartão"));
        }
      } catch (err) {
        alert("Erro de comunicação com o servidor: " + err.message);
      }
    }

    async function submeterNovaChavePix(event) {
      event.preventDefault();
      const chave = document.getElementById("input-pix-chave").value;
      const desc = document.getElementById("input-pix-descricao").value;
      const padrao = document.getElementById("check-pix-padrao").checked;

      try {
        const resp = await fetch("/api/v1/carteira/pix-chaves", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chave, descricao: desc, definirComoPadrao: padrao }),
        });

        const res = await resp.json();
        if (resp.ok && res.sucesso) {
          alert("Chave PIX cadastrada e validada com sucesso!");
          fecharModalPix();
          carregarDadosCarteira();
        } else {
          alert("Erro: " + (res.detalhes || res.erro || "Chave PIX inválida"));
        }
      } catch (err) {
        alert("Erro de comunicação: " + err.message);
      }
    }

    // Ações de Pagamento e Carga
    async function pagarComCartaoPadrao() {
      if (!dadosCarteira || !dadosCarteira.cartaoPadrao) {
        alert("Nenhum cartão de crédito cadastrado. Cadastre um cartão primeiro.");
        abrirModalCartao();
        return;
      }

      const valor = parseFloat(document.getElementById("input-valor-recarga").value);
      if (!valor || valor <= 0) {
        alert("Informe um valor de recarga válido.");
        return;
      }

      const card = dadosCarteira.cartaoPadrao;
      if (!confirm(\`Confirmar recarga de R$ \${valor.toFixed(2)} no cartão \${card.bandeira} final \${card.ultimos4Digitos}?\`)) {
        return;
      }

      try {
        const resp = await fetch("/api/v1/carteira/recargas/cartao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartaoId: card.id, valorReais: valor }),
        });

        const res = await resp.json();
        if (resp.ok && res.sucesso) {
          alert(res.mensagem);
          carregarDadosCarteira();
          carregarExtrato();
        } else {
          alert("Falha na recarga: " + (res.detalhes || res.erro));
        }
      } catch (err) {
        alert("Erro de comunicação: " + err.message);
      }
    }

    async function gerarQrCodePixRecarga() {
      const valor = parseFloat(document.getElementById("input-valor-recarga").value);
      if (!valor || valor <= 0) {
        alert("Informe um valor de recarga válido.");
        return;
      }

      try {
        const resp = await fetch("/api/v1/carteira/recargas/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valorReais: valor }),
        });

        const res = await resp.json();
        if (resp.ok && res.sucesso) {
          ultimaOrdemPix = res;
          document.getElementById("pix-copia-cola-text").value = res.chavePixCopiaECola;
          document.getElementById("area-pix-resultado").classList.remove("hidden");
          carregarExtrato();
        } else {
          alert("Falha ao gerar PIX: " + (res.detalhes || res.erro));
        }
      } catch (err) {
        alert("Erro de comunicação: " + err.message);
      }
    }

    function copiarPix() {
      const el = document.getElementById("pix-copia-cola-text");
      el.select();
      navigator.clipboard.writeText(el.value);
      const btn = document.getElementById("btn-copiar-pix");
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Código Copiado!';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar Código PIX';
      }, 2000);
    }

    async function simularConfirmacaoPix() {
      if (!ultimaOrdemPix) return;
      try {
        const resp = await fetch("/api/v1/carteira/recargas/pix/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transacaoId: ultimaOrdemPix.transacaoId }),
        });

        if (resp.ok) {
          alert("PIX confirmado e créditos liberados com sucesso!");
          fecharAreaPix();
          carregarDadosCarteira();
          carregarExtrato();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function fecharAreaPix() {
      document.getElementById("area-pix-resultado").classList.add("hidden");
    }

    async function definirCartaoPadrao(id) {
      await fetch("/api/v1/carteira/cartoes/" + id + "/padrao", { method: "PATCH" });
      carregarDadosCarteira();
    }

    async function removerCartao(id) {
      if (confirm("Deseja realmente remover este cartão?")) {
        await fetch("/api/v1/carteira/cartoes/" + id, { method: "DELETE" });
        carregarDadosCarteira();
      }
    }

    async function removerChavePix(id) {
      if (confirm("Deseja realmente remover esta chave PIX?")) {
        await fetch("/api/v1/carteira/pix-chaves/" + id, { method: "DELETE" });
        carregarDadosCarteira();
      }
    }

    function selecionarPacote(valor) {
      document.getElementById("input-valor-recarga").value = valor.toFixed(2);
    }

    function scrollToTopup() {
      trocarAbaCarteira("topup");
      document.getElementById("input-valor-recarga").focus();
    }

    function trocarAbaCarteira(aba) {
      ["topup", "cartoes", "pix", "extrato"].forEach((a) => {
        document.getElementById("aba-" + a).classList.add("hidden");
        const btn = document.getElementById("tab-btn-" + a);
        btn.className = "pb-3 text-sm font-semibold border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center gap-2";
      });

      document.getElementById("aba-" + aba).classList.remove("hidden");
      const btnAtivo = document.getElementById("tab-btn-" + aba);
      const cor = aba === "topup" ? "emerald" : aba === "cartoes" ? "blue" : aba === "pix" ? "teal" : "indigo";
      btnAtivo.className = "pb-3 text-sm font-semibold border-b-2 border-" + cor + "-500 text-" + cor + "-400 flex items-center gap-2";
    }

    // Modais
    function abrirModalCartao() { document.getElementById("modal-cartao").classList.remove("hidden"); }
    function fecharModalCartao() { document.getElementById("modal-cartao").classList.add("hidden"); }
    function abrirModalPix() { document.getElementById("modal-pix").classList.remove("hidden"); }
    function fecharModalPix() { document.getElementById("modal-pix").classList.add("hidden"); }

    // Preview do Cartão Interativo
    function formatarNumeroCartaoPreview(el) {
      let v = el.value.replace(/\\D/g, "");
      let formatted = "";
      for (let i = 0; i < v.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += v[i];
      }
      el.value = formatted;
      document.getElementById("preview-numero").innerText = formatted || "•••• •••• •••• ••••";

      // Detecta bandeira básica
      const band = document.getElementById("preview-bandeira");
      if (v.startsWith("4")) band.innerText = "VISA";
      else if (v.startsWith("5")) band.innerText = "MASTERCARD";
      else if (v.startsWith("3")) band.innerText = "AMEX";
      else if (v.startsWith("6")) band.innerText = "ELO";
      else band.innerText = "CARTÃO";
    }

    function atualizarTitularPreview(el) {
      document.getElementById("preview-titular").innerText = el.value.toUpperCase() || "NOME DO TITULAR";
    }

    function formatarValidadePreview(el) {
      let v = el.value.replace(/\\D/g, "");
      if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
      el.value = v;
      document.getElementById("preview-validade").innerText = v || "MM/AA";
    }
  </script>
</body>
</html>`;
}
