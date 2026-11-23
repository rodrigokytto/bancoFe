with open("client/src/components/ia/HoldingConsolidadaWarRoom.tsx", "r", encoding="utf-8") as f:
    content = f.read()

target_start = """      {/* ===================================================================== */}
      {/* BANNER EXECUTIVO: HOLDING CONSOLIDADA & VISÃO MULTINEGÓCIOS            */}"""

target_end = """      {/* ===================================================================== */}
      {/* SUB-ABA 1: MATRIZ DE GAPS & OPORTUNIDADES POR NEGÓCIO                 */}"""

start_pos = content.find(target_start)
end_pos = content.find(target_end)

if start_pos == -1 or end_pos == -1:
    print(f"Error finding markers: start={start_pos}, end={end_pos}")
    exit(1)

new_code = """      {/* ===================================================================== */}
      {/* PAINEL EXECUTIVO SERENO: HOLDING CONSOLIDADA & VISÃO MULTINEGÓCIOS    */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--surface2)] text-[var(--ink)] border border-[var(--line)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Holding Consolidada
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                3 Negócios Ativos em Produção
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                Tangará da Serra · MT
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--ink)]">
              Visão Consolidada de Negócios &amp; Inteligência Multissetorial
            </h2>

            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Zuma Cozinha Oriental opera como o negócio âncora do grupo em sinergia com a Zuma Loja de Roupas &amp; Boutique e o braço Corporativo/Agro. Este painel monitora <b>gaps, oportunidades de expansão, integrações operacionais (iFood, Keeto POS) e tráfego multicanal unificado</b> em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setModalSimuladorAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-[var(--ink)] text-[var(--surface)] hover:opacity-90 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Campanha Multicanal &amp; Tráfego</span>
            </button>
            <button
              onClick={() => toast.success("Dados da Holding e integrações sincronizados em tempo real!")}
              className="p-2.5 rounded-xl bg-[var(--surface2)] hover:bg-[var(--line)] text-[var(--ink)] border border-[var(--line)] transition-all cursor-pointer"
              title="Sincronizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Indicadores Estruturais Complementares da Holding (Sem Redundância com os KPIs do Topo) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[var(--line)]">
          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              EBITDA Médio Consolidado
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              29.4%
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Margem operacional com compras unificadas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Base de Clientes CRM Unificada
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              18.450
            </div>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block leading-tight">
              42% da base consome em 2+ empresas
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              ROAS Médio de Mídia Paga
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400">
              5.4x
            </div>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">
              Meta Ads + TikTok + Google Ads
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface2)]/50 border border-[var(--line)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
              Custo por Lead (CPL) WhatsApp
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-[var(--ink)]">
              R$ 1,78
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block leading-tight">
              WhatsApp Business Cloud API
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ABAS DA VISÃO CONSOLIDADA: GAPS, INTEGRAÇÕES E CANAIS, SINERGIAS      */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-[var(--surface2)] border border-[var(--line)]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubAbaConsolidada("gaps")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "gaps"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Matriz de Gaps &amp; Oportunidades por Negócio</span>
          </button>

          <button
            onClick={() => setSubAbaConsolidada("redes")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "redes"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Integrações &amp; Canais: iFood, Keeto POS, Redes &amp; Bancos</span>
          </button>

          <button
            onClick={() => setSubAbaConsolidada("sinergias")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              subAbaConsolidada === "sinergias"
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-xs ring-1 ring-[var(--line)]"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Sinergias Cruzadas &amp; LTV do Grupo</span>
          </button>
        </div>

        {/* Filtro Rápido de Negócio na visualização de Gaps */}
        {subAbaConsolidada === "gaps" && (
          <div className="flex items-center gap-1 text-xs px-1">
            <span className="text-[10px] text-[var(--muted)] font-bold uppercase mr-1">Filtrar:</span>
            {["todos", "zuma_gastronomia", "zuma_roupas", "kytto_agro"].map((key) => {
              const label =
                key === "todos"
                  ? "Todas as Empresas"
                  : key === "zuma_gastronomia"
                  ? "🥢 Gastronomia"
                  : key === "zuma_roupas"
                  ? "👗 Roupas"
                  : "🌾 Agro B2B";
              return (
                <button
                  key={key}
                  onClick={() => setNegocioFoco(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    negocioFoco === key
                      ? "bg-[var(--surface)] text-[var(--ink)] shadow-2xs ring-1 ring-[var(--line)] font-black"
                      : "text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>\n\n"""

new_content = content[:start_pos] + new_code + content[end_pos:]
with open("client/src/components/ia/HoldingConsolidadaWarRoom.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCESSO: HoldingConsolidadaWarRoom atualizado com design sereno!")
