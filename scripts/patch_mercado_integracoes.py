import re

target_path = "/home/ubuntu/zuma/client/src/pages/MercadoBenchmark.tsx"

with open(target_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Adicionar imports de integrações se não existirem
imports_needed = """import { IfoodHubV2 } from "../components/integrations/IfoodHubV2";
import { KeetoPosHub } from "../components/integrations/KeetoPosHub";
import { OpenDeliveryHub } from "../components/integrations/OpenDeliveryHub";
import { BancosTefHub } from "../components/integrations/BancosTefHub";
import { GoogleEcosystemHub } from "../components/integrations/GoogleEcosystemHub";
"""

if "IfoodHubV2" not in code:
    code = re.sub(
        r'(import { HoldingConsolidadaWarRoom } from "\.\./components/ia/HoldingConsolidadaWarRoom";)',
        r'\1\n' + imports_needed,
        code
    )

# 2. Atualizar tipo de abaAtiva
old_aba_type = '    "apis-reais" | "dr-clima" | "concorrentes" | "war-room" | "projecao-ia" | "reativacao-ia" | "buracos-agenda" | "radar-vivo" | "ia-estrategista" | "reputacao" | "precos" | "simulador" | "softwares"'
new_aba_type = '    "apis-reais" | "ifood" | "keeto" | "opendelivery" | "bancos-tef" | "google-eco" | "dr-clima" | "concorrentes" | "war-room" | "projecao-ia" | "reativacao-ia" | "buracos-agenda" | "radar-vivo" | "ia-estrategista" | "reputacao" | "precos" | "simulador" | "softwares"'

code = code.replace(old_aba_type, new_aba_type)

# 3. Atualizar mudarAba para incluir as novas abas no pilar "apis"
old_mudar_aba = 'else if (["apis-reais", "dr-clima", "softwares"].includes(tab)) {'
new_mudar_aba = 'else if (["apis-reais", "ifood", "keeto", "opendelivery", "bancos-tef", "google-eco", "dr-clima", "softwares"].includes(tab)) {'

code = code.replace(old_mudar_aba, new_mudar_aba)

# 4. Adicionar botões no pilar "apis"
old_botoes_apis = """          {pilarAtivo === "apis" && (
            <>
              <button
                onClick={() => mudarAba("apis-reais")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "apis-reais"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>⚡ Hub APIs Oficiais (Receita, PTAX, Gemini)</span>
              </button>"""

new_botoes_apis = """          {pilarAtivo === "apis" && (
            <>
              <button
                onClick={() => mudarAba("apis-reais")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "apis-reais"
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>⚡ Hub APIs (Receita, PTAX, Gemini)</span>
              </button>
              <button
                onClick={() => mudarAba("ifood")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "ifood"
                    ? "bg-red-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-red-600 dark:text-red-400 hover:text-red-500 border border-red-500/30"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>🛍️ iFood Merchant v2</span>
              </button>
              <button
                onClick={() => mudarAba("keeto")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "keeto"
                    ? "bg-orange-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-orange-600 dark:text-orange-400 hover:text-orange-500 border border-orange-500/30"
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>🖥️ Keeto POS &amp; Mesas (27 Mesas)</span>
              </button>
              <button
                onClick={() => mudarAba("opendelivery")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "opendelivery"
                    ? "bg-blue-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-blue-600 dark:text-blue-400 hover:text-blue-500 border border-blue-500/30"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>🛵 Open Delivery Abrasel</span>
              </button>
              <button
                onClick={() => mudarAba("bancos-tef")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "bancos-tef"
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 border border-emerald-500/30"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>💳 Sicredi Pix &amp; TEF Stone</span>
              </button>
              <button
                onClick={() => mudarAba("google-eco")}
                className={`px-3 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  abaAtiva === "google-eco"
                    ? "bg-teal-600 text-white shadow-xs font-black"
                    : "bg-[var(--surface)] text-teal-600 dark:text-teal-400 hover:text-teal-500 border border-teal-500/30"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>🌐 Google Maps &amp; Reviews</span>
              </button>"""

code = code.replace(old_botoes_apis, new_botoes_apis)

# 5. Adicionar renderização dos componentes de integração antes de {abaAtiva === "apis-reais"
render_integracoes = """      {/* RENDERIZAÇÃO DAS INTEGRAÇÕES COMPLETAS IFOOD, KEETO POS, OPEN DELIVERY, BANCOS E GOOGLE */}
      {abaAtiva === "ifood" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-red-500" />
              <span className="font-bold text-[var(--ink)]">
                Conexão Ativa: iFood Merchant API v2 Oficial · Tangará da Serra (MT)
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
              Pooling 4s Sincronizado
            </span>
          </div>
          <IfoodHubV2 />
        </div>
      )}

      {abaAtiva === "keeto" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-[var(--ink)]">
                Conexão Ativa: Keeto POS &amp; Comandas de Salão · 27 Mesas Sincronizadas
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
              KDS Cozinha Instantâneo
            </span>
          </div>
          <KeetoPosHub />
        </div>
      )}

      {abaAtiva === "opendelivery" && (
        <div className="space-y-4 animate-fadeIn">
          <OpenDeliveryHub />
        </div>
      )}

      {abaAtiva === "bancos-tef" && (
        <div className="space-y-4 animate-fadeIn">
          <BancosTefHub />
        </div>
      )}

      {abaAtiva === "google-eco" && (
        <div className="space-y-4 animate-fadeIn">
          <GoogleEcosystemHub />
        </div>
      )}
"""

if 'abaAtiva === "ifood"' not in code:
    code = code.replace(
        '{/* ===================================================================== */}\n      {/* ABA ESPECIAL: APIS & DADOS REAIS AO VIVO (RECEITA, DÓLAR, GEMINI)     */}\n      {/* ===================================================================== */}\n      {abaAtiva === "apis-reais"',
        render_integracoes + '\n      {/* ===================================================================== */}\n      {/* ABA ESPECIAL: APIS & DADOS REAIS AO VIVO (RECEITA, DÓLAR, GEMINI)     */}\n      {/* ===================================================================== */}\n      {abaAtiva === "apis-reais"'
    )

with open(target_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Patch aplicado com sucesso em MercadoBenchmark.tsx!")
