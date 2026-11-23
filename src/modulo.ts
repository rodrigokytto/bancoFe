import { definirModulo, type DefinicaoModulo } from "./plataforma-compat.ts";
import { ServicoConsulta360, type ServicoConsulta360Config } from "./servico.ts";
import { criarRouterConsulta360 } from "./router.ts";
import { criarFerramentasConsulta360 } from "./ferramentas.ts";
import { BarramentoSincronizacaoInterna } from "./eventos-sincronizacao.ts";
import { StorageSeguroConsulta360 } from "./storage-seguro.ts";

export interface InstanciaModuloConsulta360 {
  modulo: DefinicaoModulo;
  router: ReturnType<typeof criarRouterConsulta360>;
  servico: ServicoConsulta360;
  barramentoInterno: BarramentoSincronizacaoInterna;
  storageSeguro: StorageSeguroConsulta360;
}

/**
 * Cria a instância oficial do Módulo Consulta360 Enterprise
 * Compatível com arquitetura modular da plataforma Casanova Kytto e BancoFé
 */
export function criarModuloConsulta360(config?: ServicoConsulta360Config): InstanciaModuloConsulta360 {
  const servico = new ServicoConsulta360(config);
  const router = criarRouterConsulta360(servico);
  const ferramentas = criarFerramentasConsulta360(servico);
  const barramentoInterno = new BarramentoSincronizacaoInterna();
  const storageSeguro = new StorageSeguroConsulta360();

  const modulo = definirModulo({
    nome: "consulta360",
    versao: "2.1.0",
    descricao: "Módulo Pericial de Consulta 360, Diligência KYC/AML, Grafo Relacional e Bureau Integrado BancoFé",
    dependeDe: ["core"],
    permissoes: [
      "consulta360.ler",
      "consulta360.consultar",
      "consulta360.exportar",
      "consulta360.administrar",
    ],
    eventosPublicados: [
      "consulta360.consulta.realizada",
      "interno.ultra.fornecedor.homologado",
      "interno.nossa_gente.colaborador.admitido",
    ],
    router,
    ferramentas,
  });

  return {
    modulo,
    router,
    servico,
    barramentoInterno,
    storageSeguro,
  };
}
