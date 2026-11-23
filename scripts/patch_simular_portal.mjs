import fs from 'fs';

// 1. Atualizar SimuladorSerendipidadeModal.tsx
const modalPaths = [
  '/home/ubuntu/zuma-repo/client/src/components/shell/SimuladorSerendipidadeModal.tsx',
  '/home/ubuntu/zumapilot/client/src/components/shell/SimuladorSerendipidadeModal.tsx'
];

modalPaths.forEach(modalPath => {
  if (!fs.existsSync(modalPath)) return;
  let code = fs.readFileSync(modalPath, 'utf8');

  // Adicionar import { createPortal } from "react-dom";
  if (!code.includes('createPortal')) {
    code = `import { createPortal } from "react-dom";\n` + code;
  }

  // Substituir z-50 por z-[99999] e portal
  const searchPattern = `  return (\n    <div className="fixed inset-0 z-50`;
  const replacement = `  if (typeof document === "undefined") return null;\n\n  return createPortal(\n    <div className="fixed inset-0 z-[99999]`;

  if (code.includes(searchPattern)) {
    code = code.replace(searchPattern, replacement);
    // fechar createPortal no final antes de export
    // Procurar o final do componente
    const lastCloseIndex = code.lastIndexOf('  );\n};');
    if (lastCloseIndex !== -1) {
      code = code.substring(0, lastCloseIndex) + `    </div>,\n    document.body\n  );\n};`;
    }
  }

  // Garantir bg-[#0e131f] no container principal do modal
  code = code.replace(
    'rounded-3xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] shadow-2xl flex flex-col',
    'rounded-3xl bg-[#0e131f] border border-white/10 text-white shadow-2xl flex flex-col'
  );
  code = code.replace(
    'bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)]',
    'bg-[#0e131f]/95 backdrop-blur-md border-b border-white/10'
  );

  fs.writeFileSync(modalPath, code, 'utf8');
  console.log(`✅ Modal atualizado com createPortal em: ${modalPath}`);
});

// 2. Atualizar Sidebar.tsx para botão "Simular" em destaque
const sidebarPaths = [
  '/home/ubuntu/zuma-repo/client/src/components/shell/Sidebar.tsx',
  '/home/ubuntu/zumapilot/client/src/components/shell/Sidebar.tsx'
];

sidebarPaths.forEach(sidebarPath => {
  if (!fs.existsSync(sidebarPath)) return;
  let code = fs.readFileSync(sidebarPath, 'utf8');

  // Importar Sliders de lucide-react se não estiver importado
  if (!code.includes('Sliders,')) {
    code = code.replace('RotateCcw,', 'RotateCcw,\n  Sliders,');
  }

  // Substituir a barra inferior do card de serendipidade
  const oldFooterPattern = `<div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08] text-[10px]" onClick={(e) => e.stopPropagation()}>
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
            </div>`;

  const newFooter = `<div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[10px]" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={proximaDica}
                className="text-white/60 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Ver próxima sugestão de Serendipidade (Dr. Clima, Concorrência, Dólar, iFood, Salão, CFTV)"
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
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-[9.5px] flex items-center gap-1 shadow-md shadow-purple-900/40 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Simular cenário preditivo interativo"
                >
                  <Sliders className="w-3 h-3 text-pink-200" />
                  <span>Simular</span>
                </button>
                <Link
                  href={dicaAtual.rota}
                  className="text-purple-300 hover:text-purple-100 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title={dicaAtual.acao}
                >
                  <span>{dicaAtual.acao}</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>`;

  if (code.includes(oldFooterPattern)) {
    code = code.replace(oldFooterPattern, newFooter);
    fs.writeFileSync(sidebarPath, code, 'utf8');
    console.log(`✅ Sidebar atualizado com botão 'Simular' em destaque em: ${sidebarPath}`);
  } else {
    console.warn(`⚠️ Padrão antigo não encontrado em ${sidebarPath}, verificando formato alternativo...`);
  }
});
