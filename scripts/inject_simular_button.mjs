import fs from 'fs';

function updateSidebar(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Imports
  if (!content.includes('CloudRain')) {
    content = content.replace('  Moon,\n', '  Moon,\n  CloudRain,\n');
  }
  if (!content.includes('SimuladorSerendipidadeModal')) {
    content = content.replace(
      'import { ZumiMascot } from "./ZumiMascot";',
      'import { ZumiMascot } from "./ZumiMascot";\nimport { SimuladorSerendipidadeModal } from "./SimuladorSerendipidadeModal";'
    );
  }

  // 2. NAV_SECTIONS
  if (!content.includes('/dr-clima')) {
    content = content.replace(
      '{ path: "/ultra", label: "👁️ Ultra Vision AI", icon: ShieldCheck, badge: "Câmeras & IA", badgeColor: "bg-cyan-600 text-white" },',
      '{ path: "/ultra", label: "👁️ Ultra Vision AI", icon: ShieldCheck, badge: "Câmeras & IA", badgeColor: "bg-cyan-600 text-white" },\n      { path: "/dr-clima", label: "🌧️ Dr. Clima & Chuva", icon: CloudRain, badge: "Meteorologia", badgeColor: "bg-purple-600 text-white" },'
    );
  }

  // 3. DICAS_SERENDIPIDADE
  const newDicas = `export interface DicaSerendipidade {
  titulo: string;
  tag: string;
  texto: string;
  rota: string;
  acao: string;
  simuladorType: "clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv";
}

export const DICAS_SERENDIPIDADE: DicaSerendipidade[] = [
  {
    titulo: "Dr. Clima Tangará: Alerta de Chuva",
    tag: "Meteorologia & Delivery",
    texto: "Previsão de pancadas de chuva em Tangará da Serra: ative o 'Plano Chuva de Vendas' para capturar +75% no delivery enquanto Bonsai e rivais atrasam 85+ min.",
    rota: "/dr-clima",
    acao: "Abrir Dr. Clima",
    simuladorType: "clima",
  },
  {
    titulo: "Atraso no Concorrente",
    tag: "Gap Competitivo",
    texto: "Bonsai tem 68 min de espera no delivery às sextas: dispare contra-ataque para o Jardim Europa com entrega garantida em 35 min.",
    rota: "/mercado",
    acao: "Ver no War Room",
    simuladorType: "gap",
  },
  {
    titulo: "Cotação do Salmão Nobre",
    tag: "Insumos & Dólar",
    texto: "Dólar estável mantém custo CIF do Salmão Nobre Fresco a R$ 80,60/kg entregue em Tangará da Serra via rota Puerto Montt.",
    rota: "/previsao-compras",
    acao: "Conferir Câmbio",
    simuladorType: "salmao",
  },
  {
    titulo: "Desintermediação iFood",
    tag: "Margem Líquida",
    texto: "70% das vendas rivais estão presas no iFood: use 10% de cashback no Zuma PWA e economize até 27% de taxas de marketplace.",
    rota: "/mercado",
    acao: "Plano de Ataque",
    simuladorType: "ifood",
  },
  {
    titulo: "Ocupação dos Tatames",
    tag: "Ociosidade Salão",
    texto: "Identificado buraco de ocupação na terça-feira às 19h: ative reserva nos Tatames VIP com brinde autoral do Chef.",
    rota: "/mapa-de-calor",
    acao: "Ver Mapa de Calor",
    simuladorType: "tatames",
  },
  {
    titulo: "CFTV & Ultra Vision",
    tag: "Visão Computacional",
    texto: "CAM-01 identificou mesa com gesto de mão levantada há 48s: acione ronda preventiva de garçons no Salão Nobre.",
    rota: "/ultra",
    acao: "Abrir Ultra Vision",
    simuladorType: "cftv",
  },
];`;

  content = content.replace(/export const DICAS_SERENDIPIDADE = \[[\s\S]*?\];/, newDicas);

  // 4. State
  if (!content.includes('simulatorOpen')) {
    content = content.replace(
      'const proximaDica = () => {',
      'const [simulatorOpen, setSimulatorOpen] = useState(false);\n  const [criterioInicial, setCriterioInicial] = useState<"clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv">("clima");\n  const proximaDica = () => {'
    );
  }

  // 5. Card com botão "Simular"
  const oldCardTarget = `<div className="flex items-center justify-between pt-1 border-t border-purple-500/15 text-[10px]">
              <button
                type="button"
                onClick={proximaDica}
                className="text-[var(--muted)] hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Ver próxima sugestão"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Nova dica</span>
              </button>
              <Link
                href={dicaAtual.rota}
                onClick={() => setMobileOpen(false)}
                className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-0.5 no-underline"
              >
                <span>{dicaAtual.acao}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>`;

  const newCardReplacement = `<div className="flex items-center justify-between pt-1 border-t border-purple-500/15 text-[10px]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={proximaDica}
                className="text-[var(--muted)] hover:text-purple-600 flex items-center gap-1 cursor-pointer transition-colors"
                title="Ver próxima sugestão"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Nova dica</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCriterioInicial(dicaAtual.simuladorType || "clima");
                    setSimulatorOpen(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  title="Simular impacto preditivo agora"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-300" />
                  <span>Simular</span>
                </button>
                <Link
                  href={dicaAtual.rota}
                  onClick={() => setMobileOpen(false)}
                  className="text-purple-600 dark:text-purple-400 hover:underline font-bold flex items-center gap-0.5 no-underline"
                >
                  <span>{dicaAtual.acao}</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>`;

  if (content.includes(oldCardTarget)) {
    content = content.replace(oldCardTarget, newCardReplacement);
  }

  // Tornar o card clicável também
  content = content.replace(
    '<div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/5 border border-purple-500/20 text-xs space-y-1.5 shadow-2xs">',
    '<div onClick={() => { setCriterioInicial(dicaAtual.simuladorType || "clima"); setSimulatorOpen(true); }} className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/5 border border-purple-500/20 text-xs space-y-1.5 shadow-2xs cursor-pointer hover:border-purple-500/40 transition-all">'
  );

  // 6. Injetar o Modal antes de </aside>
  if (!content.includes('<SimuladorSerendipidadeModal')) {
    content = content.replace(
      '</aside>',
      `  <SimuladorSerendipidadeModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        initialCriterio={criterioInicial}
      />
      </aside>`
    );
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${filePath} atualizado com botão Simular e modal!`);
}

updateSidebar('/home/ubuntu/zuma-repo/client/src/components/shell/Sidebar.tsx');
updateSidebar('/home/ubuntu/zumapilot/client/src/components/shell/Sidebar.tsx');
