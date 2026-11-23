import re

target_path = "/home/ubuntu/zuma/client/src/pages/MercadoBenchmark.tsx"

with open(target_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Adicionar import de HoldingConsolidadaWarRoom
import_stmt = 'import { HoldingConsolidadaWarRoom } from "../components/ia/HoldingConsolidadaWarRoom";\n'
if 'HoldingConsolidadaWarRoom' not in code:
    code = re.sub(
        r'(import { DrClimaOperacaoChuvaSubsuite } from "\.\./components/ia/DrClimaOperacaoChuvaSubsuite";)',
        r'\1\n' + import_stmt,
        code
    )

# 2. Adicionar categoriaNegocio na interface ConcorrenteTangara
if 'categoriaNegocio?:' not in code:
    code = re.sub(
        r'(pratosPrecos\?: Array<[^>]+>;)',
        r'\1\n  categoriaNegocio?: "gastronomia" | "roupas" | "agro";',
        code
    )

# 3. Adicionar concorrentes de roupas e agro antes do fechamento de CONCORRENTES_TANGARA
novos_concorrentes = '''  },
  {
    id: "zuma_roupas_proprio",
    nome: "ZUMA MODA & VESTUÁRIO LTDA",
    fantasia: "Zuma Loja de Roupas & Boutique (Você)",
    cnpj: "36.296.848/0002-38",
    bairro: "Centro · Tangará da Serra",
    enderecoCompleto: "Av. Brasil, 1605 S, Centro, Tangará da Serra - MT",
    sociosReais: "Rodrigo Ribeiro Gonçalves / Leandro Cardoso",
    statusReceita: "ATIVA (Receita Federal)",
    cnae: "47.81-4-00 - Comércio varejista de artigos do vestuário",
    distanciaZumaKm: 0,
    modelo: "Boutique Física Premium + Provador VIP + Mala Condicional WhatsApp",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 168000,
    share: 17.9,
    ticketMedio: 385,
    googleRating: 4.9,
    googleReviews: 320,
    tempoMedioMin: 20,
    nivelAmeaca: "Líder",
    canalDominante: "Loja Física (82%) · WhatsApp Condicional (18%)",
    pontosFortes: [
      "Curadoria exclusiva de marcas premium e peças de alfaiataria",
      "Localização privilegiada no Centro de Tangará da Serra",
      "Sinergia de público com o restaurante Zuma Culinária Oriental",
      "Atendimento consultivo personalizado com provador privativo"
    ],
    vulnerabilidades: [
      "Baixa digitalização do catálogo online com compra direta",
      "Falta de campanhas coordenadas com a base de clientes do restaurante"
    ],
    gapTecnologico: "Integração PWA de moda e provador virtual em fase de expansão.",
    planoAtaqueZuma: "Ativar catálogo Social Commerce no Instagram/TikTok e cashback cruzado com o restaurante.",
    categoriaNegocio: "roupas",
    destaque: true
  },
  {
    id: "closet_chic",
    nome: "CLOSET CHIC BOUTIQUE TANGARA LTDA",
    fantasia: "Closet Chic Boutique",
    cnpj: "38.112.941/0001-92",
    bairro: "Centro · Tangará da Serra",
    distanciaZumaKm: 0.8,
    modelo: "Boutique Feminina Casual e Festa",
    porte: "Microempresa (ME)",
    faturamentoEst: 145000,
    share: 15.4,
    ticketMedio: 320,
    googleRating: 4.6,
    googleReviews: 140,
    tempoMedioMin: 30,
    nivelAmeaca: "Alto",
    canalDominante: "Loja Física (90%) · Instagram Direct (10%)",
    pontosFortes: [
      "Forte presença no Instagram local com fotos diárias no feed",
      "Clientela fiel de eventos e casamentos em Tangará"
    ],
    vulnerabilidades: [
      "Zero integração com delivery ou mala condicional estruturada",
      "Preços inflacionados sem programa de fidelidade ou cashback"
    ],
    gapTecnologico: "Apenas conta comum do Instagram e pagamentos em maquininha tradicional.",
    planoAtaqueZuma: "Oferecer Mala em Casa VIP com frete grátis e presente surpresa para clientes de alto padrão.",
    categoriaNegocio: "roupas"
  },
  {
    id: "carmen_steffens",
    nome: "CS TANGARA COMERCIO DE CALÇADOS E ROUPAS",
    fantasia: "Carmen Steffens Tangará",
    cnpj: "21.940.118/0001-14",
    bairro: "Av. Brasil · Tangará da Serra",
    distanciaZumaKm: 0.5,
    modelo: "Franquia de Alto Padrão de Calçados, Bolsas e Roupas",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 195000,
    share: 20.7,
    ticketMedio: 540,
    googleRating: 4.7,
    googleReviews: 210,
    tempoMedioMin: 25,
    nivelAmeaca: "Alto",
    canalDominante: "Loja Física (95%)",
    pontosFortes: [
      "Força de marca nacional consolidada",
      "Produtos de luxo com alto valor percebido"
    ],
    vulnerabilidades: [
      "Engessamento de franquia sem flexibilidade para promoções locais",
      "Público restrito a classes A com pouca renovação de clientes jovens"
    ],
    gapTecnologico: "Software legado de franquia sem automações locais de WhatsApp.",
    planoAtaqueZuma: "Campanha de moda versátil contemporânea com preços 30% mais competitivos.",
    categoriaNegocio: "roupas"
  },
  {
    id: "dudalina_camisaria",
    nome: "CAMISARIA & MODA MASCULINA TANGARA",
    fantasia: "Dudalina & Camisaria Executiva",
    cnpj: "19.821.442/0001-77",
    bairro: "Centro · Tangará da Serra",
    distanciaZumaKm: 1.1,
    modelo: "Loja Multimarcas Masculina e Feminina Executiva (Público Agro)",
    porte: "Microempresa (ME)",
    faturamentoEst: 170000,
    share: 18.1,
    ticketMedio: 410,
    googleRating: 4.5,
    googleReviews: 95,
    tempoMedioMin: 35,
    nivelAmeaca: "Médio",
    canalDominante: "Loja Física (88%) · WhatsApp (12%)",
    pontosFortes: [
      "Preferência dos produtores rurais de Tangará para camisaria de algodão",
      "Atendimento focado em moda masculina executiva"
    ],
    vulnerabilidades: [
      "Pouca inovação em coleções casuais e moda feminina contemporânea",
      "Comunicação visual tradicional e sem presença no TikTok ou Reels"
    ],
    gapTecnologico: "Sem CRM ou inteligência de dados de recompra.",
    planoAtaqueZuma: "Atrair o público agro com alfaiataria contemporânea e combos executivos.",
    categoriaNegocio: "roupas"
  },
  {
    id: "kytto_agro_proprio",
    nome: "KYTTO AGRO & CORPORATIVO B2B",
    fantasia: "Kytto Agro & Corporativo B2B (Você)",
    cnpj: "36.296.848/0001-57",
    bairro: "Distrito Agroindustrial / Centro · Tangará da Serra",
    distanciaZumaKm: 0,
    modelo: "Soluções Corporativas, Catering Executivo, Eventos de Safra & Camarote VIP",
    porte: "Empresa de Pequeno Porte (EPP)",
    faturamentoEst: 215000,
    share: 17.2,
    ticketMedio: 2450,
    googleRating: 4.9,
    googleReviews: 180,
    tempoMedioMin: 60,
    nivelAmeaca: "Líder",
    canalDominante: "Contratos Corporativos B2B (85%) · Convênios (15%)",
    pontosFortes: [
      "Integração com a infraestrutura nobre do restaurante Zuma e boutique",
      "Emissão de faturamento corporativo com boleto Sicredi a 30 dias",
      "Experiência gastronômica de alto padrão para reuniões de diretoria"
    ],
    vulnerabilidades: [
      "Sazonalidade do calendário de safra no Mato Grosso",
      "Necessidade de equipe dedicada para relacionamento com tradings"
    ],
    gapTecnologico: "Portal do cliente B2B integrado ao ERP Zuma Pilot.",
    planoAtaqueZuma: "Expandir contratos anuais com tradings e usinas da região com garantia de disponibilidade.",
    categoriaNegocio: "agro",
    destaque: true
  },
  {
    id: "amaggi_tangara",
    nome: "AMAGGI EXPORTAÇÃO E IMPORTAÇÃO S.A.",
    fantasia: "Amaggi Grãos & Logística (Demanda Corporativa)",
    cnpj: "03.007.331/0001-41",
    bairro: "Distrito Industrial · Tangará da Serra",
    distanciaZumaKm: 4.2,
    modelo: "Trading Multinacional de Grãos e Fertilizantes",
    porte: "Grande Empresa",
    faturamentoEst: 420000,
    share: 33.6,
    ticketMedio: 3800,
    googleRating: 4.8,
    googleReviews: 450,
    tempoMedioMin: 90,
    nivelAmeaca: "Alto",
    canalDominante: "Eventos Corporativos & Reuniões de Liderança",
    pontosFortes: [
      "Maior orçamento corporativo da região para confraternizações",
      "Equipe de 180 colaboradores administrativos e técnicos em Tangará"
    ],
    vulnerabilidades: [
      "Processo de compras corporativo rigoroso que exige conformidade fiscal"
    ],
    gapTecnologico: "Uso de sistemas SAP corporativos que exigem integração fiscal transparente.",
    planoAtaqueZuma: "Apresentar convênio direto de faturamento a 30 dias com pacote exclusivo para diretoria.",
    categoriaNegocio: "agro"
  },
  {
    id: "slc_agricola",
    nome: "SLC AGRÍCOLA S.A. - FAZENDA PAIAGUÁS",
    fantasia: "SLC Agrícola Fazenda Paiaguás",
    cnpj: "89.096.457/0001-55",
    bairro: "Zona Rural / Rodovia MT-358 · Tangará da Serra",
    distanciaZumaKm: 28.0,
    modelo: "Megaprodutora de Grãos, Soja e Algodão",
    porte: "Grande Empresa",
    faturamentoEst: 350000,
    share: 28.0,
    ticketMedio: 3200,
    googleRating: 4.7,
    googleReviews: 160,
    tempoMedioMin: 120,
    nivelAmeaca: "Médio",
    canalDominante: "Eventos de Abertura e Encerramento de Safra",
    pontosFortes: [
      "Altíssimo poder de compra institucional e demanda por catering in-loco",
      "Visitas constantes de investidores e executivos de São Paulo e exterior"
    ],
    vulnerabilidades: [
      "Distância geográfica da sede da fazenda exige logística térmica rigorosa"
    ],
    gapTecnologico: "Demanda logística de catering móvel com padrão Anvisa.",
    planoAtaqueZuma: "Oferecer serviço 'Zuma Móvel Chef na Fazenda' para recepção de acionistas.",
    categoriaNegocio: "agro"
  },
  {
    id: "coprodia_bioenergia",
    nome: "COPRODIA - COOPERATIVA DE PRODUTORES DE CANA",
    fantasia: "Coprodia Bioenergia & Etanol",
    cnpj: "01.218.441/0001-90",
    bairro: "Complexo Agroindustrial · Tangará da Serra",
    distanciaZumaKm: 18.5,
    modelo: "Cooperativa Agroindustrial de Cana-de-Açúcar e Bioenergia",
    porte: "Grande Empresa",
    faturamentoEst: 280000,
    share: 22.4,
    ticketMedio: 2600,
    googleRating: 4.6,
    googleReviews: 290,
    tempoMedioMin: 90,
    nivelAmeaca: "Médio",
    canalDominante: "Confraternizações de Safra e Reuniões de Cooperados",
    pontosFortes: [
      "Mais de 60 cooperados de alta renda e centenas de funcionários",
      "Forte tradição de confraternizações de safra na cidade"
    ],
    vulnerabilidades: [
      "Costumam alternar entre churrascarias tradicionais por falta de proposta oriental"
    ],
    gapTecnologico: "Sem catálogo corporativo digitalizado.",
    planoAtaqueZuma: "Montar camarote privativo Zuma para os cooperados com menu degustação harmonizado.",
    categoriaNegocio: "agro"
'''

if 'zuma_roupas_proprio' not in code:
    code = re.sub(
        r'(Smash Burger Duplo com Cheddar.*?\n\s*\}\s*\]\s*\}\n\s*)(\];)',
        r'\1' + novos_concorrentes + r'\n  \2',
        code,
        flags=re.DOTALL
    )

# 4. Atualizar default de negocioAtivo para "consolidado"
code = re.sub(
    r'const \[negocioAtivo, setNegocioAtivo\] = useState<string>\("zuma"\);',
    r'const [negocioAtivo, setNegocioAtivo] = useState<string>("consolidado");',
    code
)

# 5. Atualizar filtro de concorrentes
code = re.sub(
    r'(const concorrentesFiltrados = CONCORRENTES_TANGARA\.filter\(c => \{)',
    r'''\1
    // Filtro por Categoria de Negócio baseado no negócio ativo
    if (negocioAtivo === "zuma" && c.categoriaNegocio && c.categoriaNegocio !== "gastronomia") return false;
    if (negocioAtivo === "zuma_roupas" && c.categoriaNegocio !== "roupas") return false;
    if (negocioAtivo === "kytto_agro" && c.categoriaNegocio !== "agro") return false;''',
    code
)

# 6. Atualizar o bloco de seleção de operações e os 6 KPIs
novo_seletor_e_kpis = '''      {/* ===================================================================== */}
      {/* ARQUITETURA MULTINEGÓCIOS: HOLDING CONSOLIDADA & EMPRESAS INDEPENDENTES */}
      {/* ===================================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-4">
        {/* NÍVEL 1: EMPRESA CONSOLIDADA DE TUDO (DESTAQUE SUPERIOR HOLDING) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black shrink-0 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black text-[var(--ink)] flex items-center gap-2 flex-wrap">
                <span>Holding Empresarial &amp; Portfólio de Negócios</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Visão Consolidada
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tangará da Serra · MT
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                Visão executiva integrada de todas as empresas do empresário: Gaps, Oportunidades cruzadas e Redes Sociais integradas.
              </div>
            </div>
          </div>

          {/* Botão de Destaque da Empresa Consolidada */}
          <button
            onClick={() => {
              setNegocioAtivo("consolidado");
              toast.success("Visão Consolidada Ativada! Monitorando Gaps, Oportunidades e Tráfego Social de todo o grupo.");
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
              negocioAtivo === "consolidado"
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white ring-2 ring-purple-400/50 shadow-md scale-102"
                : "bg-[var(--surface2)] text-[var(--ink)] hover:bg-purple-600/10 hover:border-purple-500/30 border border-[var(--line)]"
            }`}
          >
            <span className="text-base">🌐</span>
            <span>EMPRESA CONSOLIDADA (TUDO)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 uppercase font-mono">
              Holding + Redes
            </span>
          </button>
        </div>

        {/* NÍVEL 2: EMPRESAS INDEPENDENTES DO EMPRESÁRIO (ABAIXO DO CONSOLIDADO) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
            <span className="uppercase tracking-wider text-[10px]">Empresas Independentes do Portfólio:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* 1. Zuma Gastronomia (Principal) */}
            <button
              onClick={() => {
                setNegocioAtivo("zuma");
                toast.info("Calibrado para Zuma Gastronomia Oriental (Negócio Principal)!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "zuma"
                  ? "bg-[var(--salmon)] text-white shadow-xs ring-2 ring-[var(--salmon)]/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>🥢</span>
              <span>Zuma Gastronomia</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Principal
              </span>
            </button>

            {/* 2. Zuma Loja de Roupas */}
            <button
              onClick={() => {
                setNegocioAtivo("zuma_roupas");
                toast.info("Calibrado para Zuma Loja de Roupas & Moda!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "zuma_roupas"
                  ? "bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>👗</span>
              <span>Zuma Loja de Roupas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Moda
              </span>
            </button>

            {/* 3. Kytto Agro & B2B */}
            <button
              onClick={() => {
                setNegocioAtivo("kytto_agro");
                toast.info("Calibrado para Kytto Agro & Corporativo B2B!");
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                negocioAtivo === "kytto_agro"
                  ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/40"
                  : "bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]"
              }`}
            >
              <span>🌾</span>
              <span>Kytto Agro &amp; B2B</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 uppercase font-mono">
                Grandes Contas
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6 KPIS DINÂMICOS CONFORME EMPRESA OU HOLDING SELECIONADA             */}
      {/* ===================================================================== */}
      {(() => {
        const isConsolidado = negocioAtivo === "consolidado";
        const isRoupas = negocioAtivo === "zuma_roupas";
        const isAgro = negocioAtivo === "kytto_agro";

        const tamLabel = isConsolidado ? "TAM Multissetorial Holding" : isRoupas ? "TAM Moda Tangará" : isAgro ? "TAM Demanda Agro B2B" : "TAM Gastronomia Noturna";
        const tamVal = isConsolidado ? "R$ 4.01M" : isRoupas ? "R$ 940k" : isAgro ? "R$ 1.25M" : "R$ 1.82M";
        const tamSub = isConsolidado ? "Gastronomia + Moda + Agro" : isRoupas ? "Boutiques e Vestuário" : isAgro ? "Contratos Corporativos" : "12 concorrentes noite";

        const empLabel = isConsolidado ? "Holding Consolidada (Você)" : isRoupas ? "Zuma Loja Roupas (Você)" : isAgro ? "Kytto Agro & B2B (Você)" : "Zuma (Você)";
        const empVal = isConsolidado ? "R$ 728k" : isRoupas ? "R$ 168k" : isAgro ? "R$ 215k" : "R$ 345k";
        const empSub = isConsolidado ? "Líder Multinegócios" : isRoupas ? "Boutique & Moda Premium" : isAgro ? "Grandes Contas & Eventos" : "Líder High-End & Sushi";

        const concLabel = isConsolidado ? "Mercado Competidor" : isRoupas ? "Boutiques Rivalizantes" : isAgro ? "Demanda Mapeada" : "11 Concorrentes";
        const concVal = isConsolidado ? "R$ 3.28M" : isRoupas ? "R$ 772k" : isAgro ? "R$ 1.03M" : "R$ 1.47M";
        const concSub = isConsolidado ? "Soma de todos os setores" : isRoupas ? "Centro e Av. Brasil" : isAgro ? "Tradings e Fazendas" : "Burger, Pizza, Chopp";

        const captVal = isConsolidado ? "+R$ 320k" : isRoupas ? "+R$ 85k" : isAgro ? "+R$ 132k" : "+R$ 185k";
        const captSub = isConsolidado ? "Gaps dos 3 negócios" : isRoupas ? "Social Commerce & Mala" : isAgro ? "Contratos Anuais Safra" : "Gargalos mapeados";

        const acoesVal = isConsolidado ? "8 / 11" : isRoupas ? "3 / 4" : isAgro ? "2 / 3" : `${acoesAtivasCont} / ${acoes.length}`;
        const roiVal = isConsolidado ? "5.4x" : isRoupas ? "5.8x" : isAgro ? "7.4x" : "5.4x";
        const roiSub = isConsolidado ? "Meta Ads + TikTok + Google" : isRoupas ? "Retorno em Vendas" : isAgro ? "LTV Grandes Contas" : "Retorno sobre disparo";

        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span className="truncate">{tamLabel}</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-[var(--ink)]">
                {tamVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {tamSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border-2 border-purple-500/40 shadow-xs space-y-0.5 bg-purple-500/5">
              <div className="flex items-center justify-between text-xs text-purple-400 font-bold">
                <span className="truncate">{empLabel}</span>
                <Trophy className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-purple-400">
                {empVal}
              </div>
              <p className="text-[10px] text-emerald-500 font-bold leading-tight truncate">
                {empSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span className="truncate">{concLabel}</span>
                <PieChart className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-[var(--ink)]">
                {concVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {concSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Captura Multissetorial</span>
                <Target className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-blue-600">
                {captVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {captSub}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>Ações Ativas</span>
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-amber-600">
                {acoesVal}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold leading-tight truncate">
                Contra-ataques ativos
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-xs space-y-0.5">
              <div className="flex items-center justify-between text-xs text-[var(--muted)] font-bold">
                <span>ROI das Ações</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black font-mono text-emerald-600">
                {roiVal}
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-tight truncate">
                {roiSub}
              </p>
            </div>
          </div>
        );
      })()}

      {/* SEÇÃO DA HOLDING CONSOLIDADA (GAPS, OPORTUNIDADES E REDES SOCIAIS) */}
      {negocioAtivo === "consolidado" && (
        <HoldingConsolidadaWarRoom onSelectBusiness={(id) => setNegocioAtivo(id)} />
      )}
'''

# Substitui o bloco entre a linha de abertura do seletor e o fim dos 6 KPIs
pattern_seletor_kpis = r'\{\/\* ===================================================================== \*\/\}\s*\{\/\* SELETOR OFICIAL DE OPERAÇÕES ZUMA.*?\{\/\* ===================================================================== \*\/\}\s*\{\/\* NAVEGAÇÃO ESTRUTURADA EM 3 PILARES ESTRATÉGICOS'

code = re.sub(
    pattern_seletor_kpis,
    novo_seletor_e_kpis + '\n      {/* ===================================================================== */}\n      {/* NAVEGAÇÃO ESTRUTURADA EM 3 PILARES ESTRATÉGICOS',
    code,
    flags=re.DOTALL
)

with open(target_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Patch aplicado com sucesso em MercadoBenchmark.tsx!")
