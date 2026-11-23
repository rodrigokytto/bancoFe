import fs from 'fs';
import path from 'path';

const capturesDir = '/home/ubuntu/zumapilot/client/public/captures';

const colabs = [
  { id: 'colab_01', nome: 'Hiroshi Tanaka', cargo: 'Sushichef Executivo', camera: 'CAM-03 (Sushibar)', conf: '99.8%', touca: true, avental: true, cor: '#4F46E5' },
  { id: 'colab_02', nome: 'Carlos Eduardo', cargo: 'Chef Cozinha Quente', camera: 'CAM-02 (Cozinha)', conf: '99.5%', touca: true, avental: true, cor: '#EA580C' },
  { id: 'colab_03', nome: 'Sofia Rezende', cargo: 'Sushigirl / Especialista Frio', camera: 'CAM-03 (Sushibar)', conf: '99.7%', touca: true, avental: true, cor: '#0891B2' },
  { id: 'colab_04', nome: 'Matheus Lima', cargo: 'Mestre dos Woks & Frituras', camera: 'CAM-02 (Cozinha)', conf: '99.2%', touca: true, avental: true, cor: '#D97706' },
  { id: 'colab_05', nome: 'Beatriz Mendes', cargo: 'Chefe de Salão & Sommelier', camera: 'CAM-01 (Salão VIP)', conf: '99.9%', touca: false, avental: true, cor: '#9333EA' },
  { id: 'colab_06', nome: 'Lucas Pinheiro', cargo: 'Garçom Sênior & Comandas', camera: 'CAM-01 (Salão VIP)', conf: '99.4%', touca: false, avental: true, cor: '#2563EB' },
  { id: 'colab_07', nome: 'Juliana Costa', cargo: 'Barmaid & Mixologista', camera: 'CAM-04 (Bar Drinks)', conf: '99.6%', touca: true, avental: true, cor: '#DB2777' },
  { id: 'colab_08', nome: 'Rafael Nogueira', cargo: 'Líder Assepsia & Steward', camera: 'CAM-05 (Doca & Lixo)', conf: '99.1%', touca: true, avental: true, cor: '#059669' }
];

colabs.forEach((c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
    <rect width="400" height="400" fill="#0F172A"/>
    <!-- Grid overlay de visão computacional -->
    <defs>
      <pattern id="grid_${c.id}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="grad_${c.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c.cor}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#0284C7" stop-opacity="0.4"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#grid_${c.id})" />

    <!-- Câmera Header -->
    <rect x="16" y="16" width="368" height="28" rx="6" fill="#1E293B" stroke="#334155"/>
    <circle cx="32" cy="30" r="4" fill="#22C55E"/>
    <text x="44" y="34" font-family="monospace" font-size="11" font-weight="bold" fill="#F8FAFC">ULTRA VISION AI 4K · ${c.camera}</text>
    <text x="320" y="34" font-family="monospace" font-size="10" fill="#94A3B8">REC 60FPS</text>

    <!-- Silhueta e Rosto do Colaborador -->
    <circle cx="200" cy="180" r="75" fill="url(#grad_${c.id})" stroke="${c.cor}" stroke-width="2"/>
    <path d="M 120 340 C 120 270, 280 270, 280 340 Z" fill="url(#grad_${c.id})" opacity="0.85"/>

    <!-- Touca Sanitária ANVISA se aplicável -->
    ${c.touca ? `
      <path d="M 122 170 C 122 100, 278 100, 278 170 Z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
      <rect x="118" y="166" width="164" height="12" rx="3" fill="#CBD5E1"/>
      <text x="160" y="150" font-family="sans-serif" font-size="9" font-weight="bold" fill="#475569">TOUCA ANVISA OK</text>
    ` : ''}

    <!-- Olhos e Face Landmarks -->
    <circle cx="175" cy="175" r="4" fill="#FFFFFF"/>
    <circle cx="225" cy="175" r="4" fill="#FFFFFF"/>
    <path d="M 185 210 Q 200 220 215 210" stroke="#FFFFFF" stroke-width="2" fill="none"/>

    <!-- Mesh Facial & Bounding Box -->
    <rect x="105" y="95" width="190" height="210" rx="10" fill="none" stroke="#22C55E" stroke-width="2" stroke-dasharray="8 4"/>
    <path d="M 95 115 L 95 95 L 115 95" stroke="#22C55E" stroke-width="4" fill="none"/>
    <path d="M 305 115 L 305 95 L 285 95" stroke="#22C55E" stroke-width="4" fill="none"/>
    <path d="M 95 285 L 95 305 L 115 305" stroke="#22C55E" stroke-width="4" fill="none"/>
    <path d="M 305 285 L 305 305 L 285 305" stroke="#22C55E" stroke-width="4" fill="none"/>

    <!-- Landmarks Cruzados -->
    <circle cx="175" cy="175" r="7" stroke="#38BDF8" stroke-width="1.5" fill="none"/>
    <circle cx="225" cy="175" r="7" stroke="#38BDF8" stroke-width="1.5" fill="none"/>
    <circle cx="200" cy="195" r="3" fill="#38BDF8"/>
    <line x1="175" y1="175" x2="200" y2="195" stroke="#38BDF8" stroke-width="0.8" opacity="0.6"/>
    <line x1="225" y1="175" x2="200" y2="195" stroke="#38BDF8" stroke-width="0.8" opacity="0.6"/>

    <!-- Badge Biométrico -->
    <rect x="110" y="275" width="180" height="22" rx="4" fill="#15803D"/>
    <text x="120" y="290" font-family="monospace" font-size="11" font-weight="bold" fill="#FFFFFF">MATCH: ${c.conf} · PORTARIA 671</text>

    <!-- Footer Informativo -->
    <rect x="16" y="352" width="368" height="36" rx="6" fill="#1E293B" stroke="#334155"/>
    <text x="28" y="368" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FFFFFF">${c.nome} · ${c.cargo}</text>
    <text x="28" y="381" font-family="monospace" font-size="9" fill="#94A3B8">Zuma Tangará da Serra (MT) · CNPJ 36.296.848/0001-57</text>
  </svg>`;

  fs.writeFileSync(path.join(capturesDir, `${c.id}_biometria.svg`), svg);
});

console.log('✅ 8 Imagens vetoriais de biometria facial e conformidade ANVISA geradas com sucesso em public/captures!');
