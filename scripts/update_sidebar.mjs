import fs from 'fs';

function updateSidebar(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Adicionar CloudRain e import do modal se não existirem
  if (!content.includes('CloudRain,')) {
    content = content.replace('Moon,', 'Moon,\n  CloudRain,');
  }
  if (!content.includes('SimuladorSerendipidadeModal')) {
    content = content.replace(
      'import { ZumiMascot } from "./ZumiMascot";',
      'import { ZumiMascot } from "./ZumiMascot";\nimport { SimuladorSerendipidadeModal } from "./SimuladorSerendipidadeModal";'
    );
  }

  // 2. Adicionar rota /dr-clima nas seções de menu
  if (!content.includes('/dr-clima')) {
    content = content.replace(
      '{ path: "/ultra", label: "👁️ Ultra Vision AI", icon: ShieldCheck, badge: "Câmeras & IA", badgeColor: "bg-cyan-600 text-white" },',
      '{ path: "/ultra", label: "👁️ Ultra Vision AI", icon: ShieldCheck, badge: "Câmeras & IA", badgeColor: "bg-cyan-600 text-white" },\n      { path: "/dr-clima", label: "🌧️ Dr. Clima & Chuva", icon: CloudRain, badge: "Meteorologia", badgeColor: "bg-purple-600 text-white" },'
    );
  }

  // 3. Atualizar DICAS_SERENDIPIDADE com a dica de chuva no topo e tipos
  const newDicas = `export interface DicaSerendipidade {
  id: string;
  titulo: string;
  tag: string;
  badgeColor?: string;
  texto: string;
  rota: string;
  acao: string;
  simuladorType: "clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv";
}

export const DICAS_SERENDIPIDADE: DicaSerendipidade[] = [
  {
    id: "clima",
    titulo: "Previsão Meteorológica & Delivery",
    tag: "METEOROLOGIA & DELIVERY",
    badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    texto: "Previsão de pancadas de chuva em Tangará da Serra: ative o 'Plano Chuva de Vendas' para focar em combos quentes e reforçar entregadores.",
    rota: "/dr-clima",
    acao: "Abrir Dr. Clima",
    simuladorType: "clima",
  },
  {
    id: "gap",
    titulo: "Atraso no Concorrente",
    tag: "Gap Competitivo",
    badgeColor: "bg-gradient-to-r from-amber-600 to-orange-600 text-white",
    texto: "Bonsai tem 68 min de espera no delivery às sextas: dispare contra-ataque para o Jardim Europa com entrega garantida em 35 min.",
    rota: "/mercado",
    acao: "Ver no War Room",
    simuladorType: "gap",
  },
  {
    id: "salmao",
    titulo: "Cotação do Salmão Nobre",
    tag: "Insumos & Dólar",
    badgeColor: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
    texto: "Dólar estável mantém custo CIF do Salmão Nobre Fresco a R$ 80,60/kg entregue em Tangará da Serra via rota Puerto Montt.",
    rota: "/mercado",
    acao: "Conferir Câmbio",
    simuladorType: "salmao",
  },
  {
    id: "ifood",
    titulo: "Desintermediação iFood",
    tag: "Margem Líquida",
    badgeColor: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white",
    texto: "70% das vendas rivais estão presas no iFood: use 10% de cashback no Zuma PWA e economize até 27% de taxas de marketplace.",
    rota: "/mercado",
    acao: "Plano de Ataque",
    simuladorType: "ifood",
  },
  {
    id: "tatames",
    titulo: "Ocupação dos Tatames",
    tag: "Ociosidade Salão",
    badgeColor: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white",
    texto: "Identificado buraco de ocupação na terça-feira às 19h: ative reserva nos Tatames VIP com brinde autoral do Chef.",
    rota: "/mapa-de-calor",
    acao: "Ver Mapa de Calor",
    simuladorType: "tatames",
  },
  {
    id: "cftv",
    titulo: "CFTV & Ultra Vision",
    tag: "Visão Computacional",
    badgeColor: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white",
    texto: "CAM-01 identificou mesa com gesto de mão levantada há 48s: acione ronda preventiva de garçons no Salão Nobre.",
    rota: "/ultra",
    acao: "Abrir Ultra Vision",
    simuladorType: "cftv",
  },
];`;

  // Substituir bloco antigo de DICAS_SERENDIPIDADE
  content = content.replace(/export const DICAS_SERENDIPIDADE = \[[\s\S]*?\];/, newDicas);

  // 4. Injetar estados do simulador no Sidebar
  if (!content.includes('simulatorOpen')) {
    content = content.replace(
      'const proximaDica = () => {',
      'const [simulatorOpen, setSimulatorOpen] = useState(false);\n  const [criterioInicial, setCriterioInicial] = useState<"clima" | "gap" | "salmao" | "ifood" | "tatames" | "cftv">("clima");\n  const proximaDica = () => {'
    );
  }

  // 5. Substituir renderização do card de Serendipidade
  const oldCardRegex = /\{\/\* Serin Serendipidade & Descobertas Fortuitas IA \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const newCard = `{/* Serin Serendipidade & Descobertas Fortuitas IA */}
          <div 
            onClick={() => {
              setCriterioInicial(dicaAtual.simuladorType || "clima");
              setSimulatorOpen(true);
            }}
            className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-amber-500/10 border border-purple-500/30 text-xs space-y-2 shadow-lg shadow-purple-900/10 hover:border-purple-400/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Serendipidade IA
                </span>
              </div>
              <span className={\`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider \${dicaAtual.badgeColor || "bg-purple-600 text-white"}\`}>
                {dicaAtual.tag}
              </span>
            </div>
            <p className="text-[11.5px] text-white/90 leading-snug font-medium">
              {dicaAtual.texto}
            </p>
            <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08] text-[10px]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={proximaDica}
                className="text-white/60 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Ver próxima sugestão de Serendipidade"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Nova dica</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCriterioInicial(dicaAtual.simuladorType || "clima");
                  setSimulatorOpen(true);
                }}
                className="text-purple-300 hover:text-purple-100 font-extrabold flex items-center gap-0.5 cursor-pointer transition-colors"
              >
                <span>{dicaAtual.acao}</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>`;

  content = content.replace(oldCardRegex, newCard);

  // 6. Inserir o SimuladorSerendipidadeModal antes do fechamento do fragmento </aside>
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
  console.log(`✅ Sidebar atualizado com sucesso em ${filePath}!`);
}

updateSidebar('/home/ubuntu/zuma-repo/client/src/components/shell/Sidebar.tsx');
updateSidebar('/home/ubuntu/zumapilot/client/src/components/shell/Sidebar.tsx');
