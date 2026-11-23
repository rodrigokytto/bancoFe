import { CONFIG_OFICIAL_KYTTO } from "../config-kytto.ts";

/**
 * Renderiza a tela oficial de autenticação da Plataforma Casanova / Consulta 360
 * Credenciais corporativas de PRD:
 * Usuário: Admin
 * Senha: #080581Verdao
 */
export function renderizarHtmlLogin(erroMsg?: string, returnTo: string = "/plataforma/consulta-cpf"): string {
  const cnpjKytto = CONFIG_OFICIAL_KYTTO.empresa.cnpj;
  const razaoKytto = CONFIG_OFICIAL_KYTTO.empresa.razaoSocial;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Seguro PRD • Casanova DataGraph 360 & Kytto</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at 50% 20%, #153224 0%, #0a1510 50%, #050b08 100%);
    }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .emerald-glow {
      box-shadow: 0 0 50px -10px rgba(16, 185, 129, 0.25);
    }
  </style>
</head>
<body class="min-h-screen text-slate-100 flex flex-col items-center justify-center p-4">

  <!-- Card Principal de Login -->
  <div class="w-full max-w-md bg-slate-900/90 border border-emerald-900/50 rounded-2xl p-8 backdrop-blur-xl emerald-glow shadow-2xl relative overflow-hidden">
    <!-- Efeito Luminoso Superior -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

    <!-- Header do Login com Identidade Visual -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 mb-4 shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
        <i class="fa-solid fa-shield-halved text-white text-2xl"></i>
      </div>
      <h1 class="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
        Casanova <span class="text-emerald-400">DataGraph 360</span>
      </h1>
      <p class="text-xs text-slate-400 mt-1">Ambiente Oficial de Produção (PRD) • Google Cloud</p>
      
      <!-- Badge Institucional Kytto -->
      <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-[11px] text-emerald-300">
        <i class="fa-solid fa-building-circle-check text-emerald-400"></i>
        <span>${razaoKytto}</span>
      </div>
      <div class="text-[10px] text-slate-500 mt-1 mono">CNPJ: ${cnpjKytto}</div>
    </div>

    <!-- Alerta de Erro se houver -->
    ${
      erroMsg
        ? `<div class="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
            <i class="fa-solid fa-triangle-exclamation text-red-400 text-sm"></i>
            <span>${erroMsg}</span>
          </div>`
        : ""
    }

    <!-- Formulário de Autenticação -->
    <form id="form-login" method="POST" action="/login" class="space-y-5">
      <input type="hidden" name="returnTo" value="${returnTo}" />

      <!-- Campo Usuário -->
      <div>
        <label for="username" class="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
          Usuário Administrador
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i class="fa-solid fa-user text-sm"></i>
          </div>
          <input
            type="text"
            id="username"
            name="username"
            required
            autocomplete="username"
            value="Admin"
            placeholder="Digite seu usuário..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder-slate-500"
          />
        </div>
      </div>

      <!-- Campo Senha -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label for="password" class="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Senha de Acesso
          </label>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <i class="fa-solid fa-lock text-sm"></i>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="••••••••••••"
            class="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder-slate-500"
          />
          <button
            type="button"
            id="btn-toggle-senha"
            class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
          >
            <i class="fa-solid fa-eye text-sm" id="icone-olho"></i>
          </button>
        </div>
      </div>

      <!-- Informações Oficiais de Acesso -->
      <div class="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div class="flex items-center justify-between text-slate-300 font-medium">
          <span><i class="fa-solid fa-key text-emerald-400 mr-1"></i> Credenciais PRD Autorizadas:</span>
        </div>
        <div class="flex justify-between text-slate-400">
          <span>Usuário:</span> <strong class="text-emerald-400 mono">Admin</strong>
        </div>
        <div class="flex justify-between text-slate-400">
          <span>Senha:</span> <strong class="text-emerald-400 mono">#080581Verdao</strong>
        </div>
      </div>

      <!-- Botão de Login -->
      <button
        type="submit"
        id="btn-submit"
        class="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2"
      >
        <span>Entrar na Plataforma</span>
        <i class="fa-solid fa-arrow-right"></i>
      </button>
    </form>

    <!-- Rodapé de Governança -->
    <div class="mt-6 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500">
      <p>Sessão Segura TLS 1.3 • Auditoria DPO & LGPD (Art. 41)</p>
      <p class="mt-0.5">Rodrigo Gonçalves • Kytto Tecnologia & Casanova Imóveis</p>
    </div>
  </div>

  <script>
    // Alternar visibilidade da senha
    const btnToggle = document.getElementById('btn-toggle-senha');
    const inputSenha = document.getElementById('password');
    const iconeOlho = document.getElementById('icone-olho');

    btnToggle.addEventListener('click', () => {
      if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        iconeOlho.classList.remove('fa-eye');
        iconeOlho.classList.add('fa-eye-slash');
      } else {
        inputSenha.type = 'password';
        iconeOlho.classList.remove('fa-eye-slash');
        iconeOlho.classList.add('fa-eye');
      }
    });

    // Intercepta submit para setar credenciais e cookie de sessão
    const form = document.getElementById('form-login');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const returnTo = "${returnTo}";

      const btnSubmit = document.getElementById('btn-submit');
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Autenticando...';

      try {
        const res = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.sucesso) {
          // Grava cookie no cliente e redireciona
          document.cookie = "session_token=" + data.token + "; path=/; max-age=2592000; SameSite=Lax";
          window.location.href = returnTo;
        } else {
          alert('Credenciais inválidas: ' + (data.mensagem || 'Usuário ou senha incorretos.'));
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>Entrar na Plataforma</span> <i class="fa-solid fa-arrow-right"></i>';
        }
      } catch (err) {
        alert('Erro ao conectar ao servidor de autenticação.');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span>Entrar na Plataforma</span> <i class="fa-solid fa-arrow-right"></i>';
      }
    });
  </script>
</body>
</html>`;
}
