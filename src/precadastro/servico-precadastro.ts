import { createHash, randomUUID } from "node:crypto";
import { obterClientePorCpf } from "../clientes/clientes-prequalificados.js";
import {
  CriarPreCadastroSchema,
  type ItemPendenciaDocumental,
  type RegistroPreCadastroBancoFe,
  type SimulacaoCreditoPreCadastro,
  type StatusPreCadastro,
  type ProdutoPretendidoBancoFe,
  type CertificadoAprovacaoAutonoma,
} from "./tipos-precadastro.js";
import {
  executarAnaliseMesaCredito,
  type ParecerMesaCreditoAlgoritmica,
} from "../credito/mesa-credito-algoritmica.js";

export class ServicoPreCadastroBancoFe {
  private registros: Map<string, RegistroPreCadastroBancoFe> = new Map();

  constructor() {
    this.inicializarBasePreCadastros();
  }

  /**
   * Inicializa a esteira com todos os cadastros reais e potenciais do ecossistema
   * Casa Nova Imóveis (casanova.kytto.com.br), centralizados e geridos sob o módulo
   * operacional do BancoFé Operações Financeiras.
   */
  private inicializarBasePreCadastros() {
    const dadosIniciais = [
      {
        id: "pre-001",
        codigoProtocolo: "BFE-PRE-2026-08491",
        dataCriacao: "2026-11-20T10:15:00.000Z",
        dataAtualizacao: "2026-11-22T14:30:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "DR. CARLOS EDUARDO MENDONÇA",
          cpfOuCnpj: "000.000.009-49",
          cpfLimpo: "00000000949",
          email: "dr.carloseduardo.med@gmail.com",
          telefone: "(65) 99812-4411",
          rendaMensalDeclarada: 38500,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Avenida Brasil, 1420-W",
          cep: "78300-112",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 890,
        valorPretendido: 850000,
        prazoMeses: 360,
      },
      {
        id: "pre-002",
        codigoProtocolo: "BFE-PRE-2026-08492",
        dataCriacao: "2026-11-21T09:00:00.000Z",
        dataAtualizacao: "2026-11-22T16:45:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "credito_rural_agro" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "RODRIGO RIBEIRO GONCALVES",
          cpfOuCnpj: "305.871.628-13",
          cpfLimpo: "30587162813",
          email: "rodrigo.goncalves@kytto.com.br",
          telefone: "(18) 99712-4411",
          rendaMensalDeclarada: 85000,
          cidade: "Mirante do Paranapanema",
          uf: "SP",
          logradouro: "Rua Elias Barbosa da Silva, 833",
          cep: "19.262-070",
        },
        empresaParceira: "Casa Nova Imóveis & Estância Gonçalves",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 960,
        valorPretendido: 1500000,
        prazoMeses: 60,
      },
      {
        id: "pre-003",
        codigoProtocolo: "BFE-PRE-2026-08493",
        dataCriacao: "2026-11-21T14:20:00.000Z",
        dataAtualizacao: "2026-11-22T11:10:00.000Z",
        status: "pendente_documentos" as StatusPreCadastro,
        produtoPretendido: "mcmv_habitacional_popular" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "Juliana Camargo Diniz",
          cpfOuCnpj: "740.***.***-61",
          cpfLimpo: "74000000061",
          email: "juliana.diniz@jbs.com.br",
          telefone: "(65) 99611-3320",
          rendaMensalDeclarada: 7400,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Bairro Morada do Sol",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis (MCMV)",
        canalOrigem: "meta-leads",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 780,
        valorPretendido: 280000,
        prazoMeses: 360,
      },
      {
        id: "pre-004",
        codigoProtocolo: "BFE-PRE-2026-08494",
        dataCriacao: "2026-11-22T08:10:00.000Z",
        dataAtualizacao: "2026-11-22T15:20:00.000Z",
        status: "em_qualificacao" as StatusPreCadastro,
        produtoPretendido: "capital_giro_pj" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "DINO BARBEARIA & PERFUMARIA",
          cpfOuCnpj: "24.891.044/0001-12",
          cpfLimpo: "24891044000112",
          email: "contato@dinobarbearia.com.br",
          telefone: "(65) 3326-4400",
          rendaMensalDeclarada: 45000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua Antonio Hortolani, Centro",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis (Ponto Comercial)",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 850,
        valorPretendido: 80000,
        prazoMeses: 24,
      },
      {
        id: "pre-005",
        codigoProtocolo: "BFE-PRE-2026-08495",
        dataCriacao: "2026-11-22T10:45:00.000Z",
        dataAtualizacao: "2026-11-22T17:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "emprestimo_consignado" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "Carlos Eduardo Nogueira",
          cpfOuCnpj: "831.***.***-52",
          cpfLimpo: "83100000052",
          email: "carlos.nogueira@uisa.com.br",
          telefone: "(65) 99912-8811",
          rendaMensalDeclarada: 6200,
          cidade: "Nova Olímpia",
          uf: "MT",
          logradouro: "Centro",
          cep: "78370-000",
        },
        empresaParceira: "Casa Nova Imóveis & UISA",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 760,
        valorPretendido: 45000,
        prazoMeses: 48,
      },
      {
        id: "pre-006",
        codigoProtocolo: "BFE-PRE-2026-08496",
        dataCriacao: "2026-11-22T11:30:00.000Z",
        dataAtualizacao: "2026-11-22T18:15:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_lotes_ultra" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "ENG. MARCOS AURELIO PRADO",
          cpfOuCnpj: "000.000.006-04",
          cpfLimpo: "00000000604",
          email: "marcos.prado@construtoraultra.com.br",
          telefone: "(65) 99841-5522",
          rendaMensalDeclarada: 42000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Jardim Europa",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis & Construtora Ultra",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 920,
        valorPretendido: 350000,
        prazoMeses: 144,
      },
      {
        id: "pre-007",
        codigoProtocolo: "BFE-PRE-2026-08497",
        dataCriacao: "2026-11-22T13:00:00.000Z",
        dataAtualizacao: "2026-11-22T19:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "home_equity_garantia_imovel" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "PATRÍCIA FERRARI PAULINO GONÇALVES",
          cpfOuCnpj: "322.855.228-43",
          cpfLimpo: "32285522843",
          email: "patricia.goncalves@kytto.com.br",
          telefone: "(18) 3991-1145",
          rendaMensalDeclarada: 42000,
          cidade: "Mirante do Paranapanema",
          uf: "SP",
          logradouro: "Rua Elias Barbosa da Silva, 833",
          cep: "19.262-070",
        },
        empresaParceira: "Casa Nova Imóveis (Alto Padrão)",
        canalOrigem: "corban_multibancos",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 940,
        valorPretendido: 450000,
        prazoMeses: 120,
      },
      {
        id: "pre-008",
        codigoProtocolo: "BFE-PRE-2026-08498",
        dataCriacao: "2026-11-22T14:30:00.000Z",
        dataAtualizacao: "2026-11-22T19:40:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "cpr_digital_agro_barter" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "AILTON CESAR ZANATTA",
          cpfOuCnpj: "000.000.012-44",
          cpfLimpo: "00000001244",
          email: "ailton.zanatta@fazendaparecis.com.br",
          telefone: "(65) 99941-8822",
          rendaMensalDeclarada: 120000,
          cidade: "Campo Novo do Parecis",
          uf: "MT",
          logradouro: "Zona Rural / Rodovia MT-235",
          cep: "78360-000",
        },
        empresaParceira: "Casa Nova Imóveis & BancoFé Agro",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 950,
        valorPretendido: 2500000,
        prazoMeses: 36,
      },
      // --- CADASTROS INTEGRADOS DA BASE VIVA CASA NOVA IMÓVEIS (casanova.kytto.com.br) ---
      {
        id: "pre-cnv-009",
        codigoProtocolo: "BFE-PRE-2026-08499",
        dataCriacao: "2026-11-22T15:00:00.000Z",
        dataAtualizacao: "2026-11-23T09:10:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "MARIANA ALENCAR VIEIRA",
          cpfOuCnpj: "000.000.010-82",
          cpfLimpo: "00000001082",
          email: "mariana.alencar@clinicavieira.com.br",
          telefone: "(65) 99654-2201",
          rendaMensalDeclarada: 22000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua Sebastião Barreto, Jardim Europa",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 840,
        valorPretendido: 420000,
        prazoMeses: 360,
      },
      {
        id: "pre-cnv-010",
        codigoProtocolo: "BFE-PRE-2026-08500",
        dataCriacao: "2026-11-22T16:15:00.000Z",
        dataAtualizacao: "2026-11-23T10:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_lotes_ultra" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "ROBERTO MENDES DE OLIVEIRA",
          cpfOuCnpj: "000.000.006-04",
          cpfLimpo: "00000000604",
          email: "roberto.mendes@mendesengenharia.com.br",
          telefone: "(65) 99988-3322",
          rendaMensalDeclarada: 54000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Avenida Tancredo Neves, Centro",
          cep: "78300-050",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "imobiliaria",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 915,
        valorPretendido: 680000,
        prazoMeses: 180,
      },
      {
        id: "pre-cnv-011",
        codigoProtocolo: "BFE-PRE-2026-08501",
        dataCriacao: "2026-11-22T17:20:00.000Z",
        dataAtualizacao: "2026-11-23T10:30:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "LUCAS DIAS DA SILVA",
          cpfOuCnpj: "000.000.002-72",
          cpfLimpo: "00000000272",
          email: "lucas.dias@silvaadvocacia.com.br",
          telefone: "(65) 99822-1100",
          rendaMensalDeclarada: 35000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua José Corsino, Tarumã",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 880,
        valorPretendido: 580000,
        prazoMeses: 360,
      },
      {
        id: "pre-cnv-012",
        codigoProtocolo: "BFE-PRE-2026-08502",
        dataCriacao: "2026-11-22T18:00:00.000Z",
        dataAtualizacao: "2026-11-23T11:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "mcmv_habitacional_popular" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "FERNANDO SILVEIRA",
          cpfOuCnpj: "000.000.012-44",
          cpfLimpo: "00000001244",
          email: "fernando.silveira@agropecuariamt.com.br",
          telefone: "(65) 99733-4411",
          rendaMensalDeclarada: 8500,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Bairro Alto da Boa Vista",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "imobiliaria",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 750,
        valorPretendido: 195000,
        prazoMeses: 360,
      },
      {
        id: "pre-cnv-013",
        codigoProtocolo: "BFE-PRE-2026-08503",
        dataCriacao: "2026-11-22T19:30:00.000Z",
        dataAtualizacao: "2026-11-23T11:30:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "DRA. PATRICIA MENDES",
          cpfOuCnpj: "000.000.014-06",
          cpfLimpo: "00000001406",
          email: "patricia.mendes@odontotangara.com.br",
          telefone: "(65) 99612-8877",
          rendaMensalDeclarada: 18200,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua Celso Rosa Lima, Centro",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 820,
        valorPretendido: 390000,
        prazoMeses: 240,
      },
      {
        id: "pre-cnv-014",
        codigoProtocolo: "BFE-PRE-2026-08504",
        dataCriacao: "2026-11-22T20:10:00.000Z",
        dataAtualizacao: "2026-11-23T12:00:00.000Z",
        status: "em_qualificacao" as StatusPreCadastro,
        produtoPretendido: "mcmv_habitacional_popular" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "CAUÃ ANGELOTTI GONÇALVES",
          cpfOuCnpj: "000.000.005-15",
          cpfLimpo: "00000000515",
          email: "caua.goncalves@estudante.ufmt.br",
          telefone: "(65) 99933-2211",
          rendaMensalDeclarada: 3500,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Bairro Vila Alta",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "meta-leads",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 710,
        valorPretendido: 140000,
        prazoMeses: 360,
      },
      {
        id: "pre-cnv-015",
        codigoProtocolo: "BFE-PRE-2026-08505",
        dataCriacao: "2026-11-22T21:00:00.000Z",
        dataAtualizacao: "2026-11-23T12:15:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "JOISE CRISTIANE ANGELOTTI",
          cpfOuCnpj: "000.000.003-53",
          cpfLimpo: "00000000353",
          email: "joise.angelotti@tangaraeduc.gov.br",
          telefone: "(65) 99877-5544",
          rendaMensalDeclarada: 14500,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua Manoel Dionísio Sobrinho",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 810,
        valorPretendido: 260000,
        prazoMeses: 240,
      },
      {
        id: "pre-cnv-016",
        codigoProtocolo: "BFE-PRE-2026-08506",
        dataCriacao: "2026-11-22T22:00:00.000Z",
        dataAtualizacao: "2026-11-23T13:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "LUCAS DOS PASSOS SILVA",
          cpfOuCnpj: "069.887.226-61",
          cpfLimpo: "06988722661",
          email: "lucas.passos@consultoriams.com.br",
          telefone: "(65) 99911-7788",
          rendaMensalDeclarada: 45000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Rua Lions Internacional, Centro",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "corban_multibancos",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 930,
        valorPretendido: 620000,
        prazoMeses: 360,
      },
      {
        id: "pre-cnv-017",
        codigoProtocolo: "BFE-PRE-2026-08507",
        dataCriacao: "2026-11-23T07:45:00.000Z",
        dataAtualizacao: "2026-11-23T13:30:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_lotes_ultra" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "MARCOS VINÍCIUS DE ALMEIDA",
          cpfOuCnpj: "234.567.890-12",
          cpfLimpo: "23456789012",
          email: "marcos.almeida@transnorte.com.br",
          telefone: "(65) 99833-4455",
          rendaMensalDeclarada: 16800,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Bairro Jardim dos Ipês",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "imobiliaria",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 835,
        valorPretendido: 320000,
        prazoMeses: 180,
      },
      {
        id: "pre-cnv-018",
        codigoProtocolo: "BFE-PRE-2026-08508",
        dataCriacao: "2026-11-23T08:15:00.000Z",
        dataAtualizacao: "2026-11-23T14:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "financiamento_imobiliario" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "JULIANA FERREIRA LIMA",
          cpfOuCnpj: "567.890.123-45",
          cpfLimpo: "56789012345",
          email: "juliana.lima@arquiteturamt.com.br",
          telefone: "(65) 99622-3344",
          rendaMensalDeclarada: 12500,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Residencial Manacá",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 815,
        valorPretendido: 295000,
        prazoMeses: 300,
      },
      {
        id: "pre-cnv-019",
        codigoProtocolo: "BFE-PRE-2026-08509",
        dataCriacao: "2026-11-23T08:45:00.000Z",
        dataAtualizacao: "2026-11-23T14:30:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "capital_giro_pj" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "CASANOVA EMPREENDIMENTOS IMOBILIÁRIOS LTDA",
          cpfOuCnpj: "18.987.654/0001-99",
          cpfLimpo: "18987654000199",
          email: "diretoria@casanova.kytto.com.br",
          telefone: "(65) 99988-1001",
          rendaMensalDeclarada: 4500000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Avenida Brasil, Centro",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "crm_casanova",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 920,
        valorPretendido: 4500000,
        prazoMeses: 36,
      },
      {
        id: "pre-cnv-020",
        codigoProtocolo: "BFE-PRE-2026-08510",
        dataCriacao: "2026-11-23T09:10:00.000Z",
        dataAtualizacao: "2026-11-23T15:00:00.000Z",
        status: "aprovado_autonomo" as StatusPreCadastro,
        produtoPretendido: "capital_giro_pj" as ProdutoPretendidoBancoFe,
        titular: {
          nomeCompleto: "CONSTRUTORA CASA NOVA IMÓVEIS LTDA",
          cpfOuCnpj: "03.456.789/0001-88",
          cpfLimpo: "03456789000188",
          email: "contato@casanovaimoveis.com.br",
          telefone: "(65) 3326-1020",
          rendaMensalDeclarada: 3200000,
          cidade: "Tangará da Serra",
          uf: "MT",
          logradouro: "Avenida Brasil, Centro",
          cep: "78300-000",
        },
        empresaParceira: "Casa Nova Imóveis",
        canalOrigem: "corban_multibancos",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 890,
        valorPretendido: 3200000,
        prazoMeses: 48,
      },
    ];

    for (const d of dadosIniciais) {
      const pendencias = this.gerarPendenciasPadrao(d.produtoPretendido, d.status);
      const simulacao = this.calcularSimulacaoCredito(
        d.valorPretendido,
        d.prazoMeses,
        "SAC",
        d.titular.rendaMensalDeclarada,
        d.scoreSerasaEstimado,
        d.id,
        d.titular.nomeCompleto,
        d.produtoPretendido
      );

      const parecerMesa = executarAnaliseMesaCredito({
        cpfCnpj: d.titular.cpfLimpo,
        nomeCliente: d.titular.nomeCompleto,
        rendaMensalDeclarada: d.titular.rendaMensalDeclarada,
        scoreBureauReferencia: d.scoreSerasaEstimado,
      });

      const item: RegistroPreCadastroBancoFe = {
        id: d.id,
        codigoProtocolo: d.codigoProtocolo,
        dataCriacao: d.dataCriacao,
        dataAtualizacao: d.dataAtualizacao,
        status: d.status,
        produtoPretendido: d.produtoPretendido,
        titular: d.titular,
        empresaParceira: d.empresaParceira,
        empresaGestora: "BancoFé Operações Financeiras",
        moduloGestor: "Módulo de Operações Financeiras BancoFé",
        canalOrigem: (d as any).canalOrigem || "crm_casanova",
        autorizacaoLgpd: d.autorizacaoLgpd,
        scoreSerasaEstimado: d.scoreSerasaEstimado,
        dados360Enriquecidos: obterClientePorCpf(d.titular.cpfLimpo) || undefined,
        simulacao,
        parecerMesaCredito: parecerMesa,
        pendencias,
        historicoNotas: [
          {
            data: d.dataCriacao,
            autor: "BancoFé Operações Financeiras • Motor de Crédito",
            nota: `Pré-cadastro importado e consolidado da base Casa Nova Imóveis (${(d as any).canalOrigem || "crm_casanova"}). Gestão direta sob a vertical BancoFé Operações Financeiras.`,
          },
        ],
      };

      this.registros.set(item.id, item);
    }
  }

  private gerarPendenciasPadrao(produto: ProdutoPretendidoBancoFe, status: StatusPreCadastro): ItemPendenciaDocumental[] {
    const docs: ItemPendenciaDocumental[] = [
      { id: "doc-01", descricao: "Documento de Identificação Oficial (RG ou CNH)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" },
      { id: "doc-02", descricao: "Comprovante de Residência Atualizado (< 90 dias)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" },
      { id: "doc-03", descricao: "Comprovante de Renda / IRPF / Holerite / DECORE", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : (status === "pendente_documentos" ? "pendente" : "anexado") },
      { id: "doc-04", descricao: "Autorização de Consulta SCR Bacen e LGPD", obrigatorio: true, status: "aprovado" },
    ];

    if (produto === "financiamento_imobiliario" || produto === "mcmv_habitacional_popular") {
      docs.push({ id: "doc-05", descricao: "Certidão de Estado Civil Notarial (Nascimento/Casamento)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "pendente" });
      docs.push({ id: "doc-06", descricao: "Extrato Atualizado do FGTS com Carimbo Caixa", obrigatorio: false, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
    } else if (produto === "credito_rural_agro" || produto === "cpr_digital_agro_barter") {
      docs.push({ id: "doc-07", descricao: "Certificado de Cadastro de Imóvel Rural (CCIR / INCRA)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
      docs.push({ id: "doc-08", descricao: "Recibo de Inscrição no CAR (SICAR / Sema-MT) & Desmatamento Zero", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
      docs.push({ id: "doc-11", descricao: "Laudo de Estimativa de Produtividade da Safra (Barter/CPR)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
    } else if (produto === "capital_giro_pj") {
      docs.push({ id: "doc-09", descricao: "Contrato Social Consolidado & Cartão CNPJ RFB", obrigatorio: true, status: "aprovado" });
      docs.push({ id: "doc-10", descricao: "Faturamento dos Últimos 12 Meses Assinado por Contador", obrigatorio: true, status: "pendente" });
    } else if (produto === "home_equity_garantia_imovel") {
      docs.push({ id: "doc-12", descricao: "Certidão de Inteiro Teor da Matrícula do Imóvel com Negativa de Ônus (< 30 dias)", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
      docs.push({ id: "doc-13", descricao: "Laudo de Avaliação Mercadológica de Engenharia", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
    } else if (produto === "financiamento_lotes_ultra") {
      docs.push({ id: "doc-14", descricao: "Certidão de Regularidade Urbanística e Matrícula Individualizada do Lote", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
      docs.push({ id: "doc-15", descricao: "Memorial Descritivo do Loteamento e Termo de Vistoria", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
    }

    return docs;
  }

  /**
   * Cálculo de amortização SAC ou Price com enquadramento de margem de 30% da renda líquida
   */
  public calcularSimulacaoCredito(
    valorSolicitado: number,
    prazoMeses: number,
    sistemaAmortizacao: "SAC" | "PRICE" = "SAC",
    rendaMensal: number,
    scoreSerasaEstimado: number = 750,
    preCadastroId?: string,
    nomeTitular?: string,
    produtoPretendido: ProdutoPretendidoBancoFe = "financiamento_imobiliario"
  ): SimulacaoCreditoPreCadastro {
    let taxaMensal = 0.0095; // 0.95% a.m. padrão
    if (produtoPretendido === "mcmv_habitacional_popular") {
      taxaMensal = 0.0058;
    } else if (produtoPretendido === "credito_rural_agro" || produtoPretendido === "cpr_digital_agro_barter") {
      taxaMensal = 0.0075;
    } else if (produtoPretendido === "capital_giro_pj") {
      taxaMensal = 0.0125;
    } else if (produtoPretendido === "emprestimo_consignado") {
      taxaMensal = 0.0155;
    } else if (produtoPretendido === "cartao_credito_black") {
      taxaMensal = 0.0195;
    } else if (produtoPretendido === "home_equity_garantia_imovel") {
      taxaMensal = 0.0085;
    } else if (produtoPretendido === "financiamento_lotes_ultra") {
      taxaMensal = 0.0095;
    }
    let primeiraParcela = 0;

    if (sistemaAmortizacao === "SAC") {
      const amortizacaoConstante = valorSolicitado / prazoMeses;
      const jurosPrimeiroMes = valorSolicitado * taxaMensal;
      primeiraParcela = Math.round((amortizacaoConstante + jurosPrimeiroMes) * 100) / 100;
    } else {
      const fator = Math.pow(1 + taxaMensal, prazoMeses);
      primeiraParcela = Math.round((valorSolicitado * ((taxaMensal * fator) / (fator - 1))) * 100) / 100;
    }

    const capacidade30 = Math.round(rendaMensal * 0.3 * 100) / 100;
    const comprometimento = Math.round((primeiraParcela / rendaMensal) * 1000) / 10;
    const aprovado = primeiraParcela <= capacidade30 && scoreSerasaEstimado >= 650;

    let certificado: CertificadoAprovacaoAutonoma | undefined = undefined;
    if (aprovado) {
      const payloadCertificado = `${nomeTitular || "TITULAR"}|${valorSolicitado}|${prazoMeses}|${sistemaAmortizacao}|${new Date().toISOString()}`;
      const hash = `SHA256:${createHash("sha256").update(payloadCertificado).digest("hex")}`;
      const codCert = `CERT-BFE-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      certificado = {
        codigoCertificado: codCert,
        emitidoEm: new Date().toISOString(),
        hashSha256: hash,
        limiteAprovado: valorSolicitado,
        prazoMesesAprovado: prazoMeses,
        sistema: sistemaAmortizacao,
        taxaJurosMensal: Math.round(taxaMensal * 10000) / 100,
        validadeDias: 60,
        instituicaoEmissora: "BancoFé Operações Financeiras & Correspondente Bacen",
        produtoNome: produtoPretendido.replace(/_/g, " ").toUpperCase(),
        qrCodeValidacao: `https://erp-bancofe-5xsi5uyoda-rj.a.run.app/validar-certificado?cod=${codCert}&hash=${hash.slice(7, 23)}`,
      };
    }

    return {
      valorSolicitado,
      prazoMeses,
      sistemaAmortizacao,
      taxaJurosMensal: Math.round(taxaMensal * 10000) / 100,
      valorPrimeiraParcela: primeiraParcela,
      capacidadeParcela30Pct: capacidade30,
      comprometimentoRendaPct: comprometimento,
      aprovadoAutomaticamente: aprovado,
      motivoStatus: aprovado
        ? `Parcela inicial de R$ ${primeiraParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} enquadrada na margem prudencial de 30% da renda líquida.`
        : `Parcela inicial de R$ ${primeiraParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} excede a margem de 30% da renda declarada (R$ ${capacidade30.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}). Requer co-proponente ou ampliação de prazo.`,
      certificado,
    };
  }

  public listar(filtros?: {
    status?: StatusPreCadastro;
    produto?: ProdutoPretendidoBancoFe;
    termo?: string;
    origem?: string;
  }): RegistroPreCadastroBancoFe[] {
    let lista = Array.from(this.registros.values());
    if (!filtros) return lista;

    if (filtros.status) {
      lista = lista.filter((r) => r.status === filtros.status);
    }
    if (filtros.produto) {
      lista = lista.filter((r) => r.produtoPretendido === filtros.produto);
    }
    if (filtros.origem) {
      const o = filtros.origem.toLowerCase().trim();
      lista = lista.filter(
        (r) =>
          (r.empresaParceira && r.empresaParceira.toLowerCase().includes(o)) ||
          (r.canalOrigem && r.canalOrigem.toLowerCase().includes(o))
      );
    }
    if (filtros.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(
        (r) =>
          r.titular.nomeCompleto.toLowerCase().includes(t) ||
          r.titular.cpfOuCnpj.includes(t) ||
          r.codigoProtocolo.toLowerCase().includes(t) ||
          r.titular.cidade.toLowerCase().includes(t) ||
          (r.empresaParceira && r.empresaParceira.toLowerCase().includes(t)) ||
          (r.canalOrigem && r.canalOrigem.toLowerCase().includes(t))
      );
    }

    return lista.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
  }

  public obterPorId(id: string): RegistroPreCadastroBancoFe | null {
    return this.registros.get(id) || null;
  }

  public obterPorCpf(cpf: string): RegistroPreCadastroBancoFe | null {
    const limpo = cpf.replace(/\D/g, "");
    return (
      Array.from(this.registros.values()).find(
        (r) => r.titular.cpfLimpo === limpo || r.titular.cpfOuCnpj.replace(/\D/g, "") === limpo
      ) || null
    );
  }

  public criar(dados: any): RegistroPreCadastroBancoFe {
    const validado = CriarPreCadastroSchema.parse(dados);
    const cpfLimpo = validado.cpfOuCnpj.replace(/\D/g, "");
    const id = `pre-${Date.now().toString(36)}`;
    const seq = Math.floor(1000 + Math.random() * 9000);
    const codigoProtocolo = `BFE-PRE-${new Date().getFullYear()}-${seq}`;

    // Buscar dossiê 360 existente
    const dossie360 = obterClientePorCpf(cpfLimpo);
    const scoreSerasa = dossie360?.scoreCredito || 800;
    const rendaReal = validado.rendaMensalDeclarada || dossie360?.rendaPresumidaMensal || 5000;

    const simulacao = this.calcularSimulacaoCredito(
      validado.valorPretendido,
      validado.prazoMeses,
      validado.sistemaAmortizacao,
      rendaReal,
      scoreSerasa,
      id,
      validado.nomeCompleto,
      validado.produtoPretendido
    );

    const parecerMesa = executarAnaliseMesaCredito({
      cpfCnpj: cpfLimpo,
      nomeCliente: validado.nomeCompleto,
      rendaMensalDeclarada: rendaReal,
      scoreBureauReferencia: scoreSerasa,
    });

    const status: StatusPreCadastro = simulacao.aprovadoAutomaticamente
      ? "aprovado_autonomo"
      : "mesa_credito";

    const pendencias = this.gerarPendenciasPadrao(validado.produtoPretendido, status);

    const item: RegistroPreCadastroBancoFe = {
      id,
      codigoProtocolo,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      status,
      produtoPretendido: validado.produtoPretendido,
      titular: {
        nomeCompleto: validado.nomeCompleto,
        cpfOuCnpj: validado.cpfOuCnpj,
        cpfLimpo,
        email: validado.email,
        telefone: validado.telefone,
        rendaMensalDeclarada: rendaReal,
        cidade: validado.cidade,
        uf: validado.uf,
      },
      empresaParceira: validado.empresaParceira || "Casa Nova Imóveis",
      empresaGestora: "BancoFé Operações Financeiras",
      moduloGestor: "Módulo de Operações Financeiras BancoFé",
      canalOrigem: validado.canalOrigem || "crm_casanova",
      autorizacaoLgpd: validado.autorizacaoLgpd,
      scoreSerasaEstimado: scoreSerasa,
      dados360Enriquecidos: dossie360 || undefined,
      simulacao,
      parecerMesaCredito: parecerMesa,
      pendencias,
      historicoNotas: [
        {
          data: new Date().toISOString(),
          autor: "BancoFé Operações Financeiras • Motor de Crédito",
          nota: `Proponente cadastrado na esteira operacional de BancoFé Operações Financeiras (origem: ${validado.empresaParceira || "Casa Nova Imóveis"}). Dossiê 360, SCR Bacen e motor de scoring ativados.`,
        },
      ],
    };

    this.registros.set(id, item);
    return item;
  }

  public atualizarStatus(id: string, novoStatus: StatusPreCadastro, nota?: string): RegistroPreCadastroBancoFe | null {
    const r = this.registros.get(id);
    if (!r) return null;

    r.status = novoStatus;
    r.dataAtualizacao = new Date().toISOString();
    if (nota) {
      r.historicoNotas.push({
        data: new Date().toISOString(),
        autor: "BancoFé Operações Financeiras • Comitê de Crédito",
        nota,
      });
    }

    return r;
  }

  public resolverPendencia(
    id: string,
    pendenciaId: string,
    novoStatus: "pendente" | "anexado" | "aprovado"
  ): RegistroPreCadastroBancoFe | null {
    const r = this.registros.get(id);
    if (!r) return null;

    const pend = r.pendencias.find((p) => p.id === pendenciaId);
    if (pend) {
      pend.status = novoStatus;
      r.dataAtualizacao = new Date().toISOString();
    }

    return r;
  }

  public obterMetricas() {
    const todos = Array.from(this.registros.values());
    const total = todos.length;
    const aprovados = todos.filter((r) => r.status === "aprovado_autonomo").length;
    const emQualificacao = todos.filter((r) => r.status === "em_qualificacao" || r.status === "novo").length;
    const pendentes = todos.filter((r) => r.status === "pendente_documentos").length;
    const volumeTotalSolicitado = todos.reduce((acc, r) => acc + (r.simulacao?.valorSolicitado || 0), 0);
    const volumeTotalAprovado = todos
      .filter((r) => r.status === "aprovado_autonomo")
      .reduce((acc, r) => acc + (r.simulacao?.certificado?.limiteAprovado || 0), 0);

    const cadastrosCasaNova = todos.filter(
      (r) => (r.empresaParceira && r.empresaParceira.includes("Casa Nova")) || (r.canalOrigem && r.canalOrigem.includes("casanova"))
    ).length;

    const volumeCasaNova = todos
      .filter((r) => (r.empresaParceira && r.empresaParceira.includes("Casa Nova")) || (r.canalOrigem && r.canalOrigem.includes("casanova")))
      .reduce((acc, r) => acc + (r.simulacao?.valorSolicitado || 0), 0);

    return {
      totalCadastrados: total,
      totalPreCadastros: total,
      totalCasaNova: cadastrosCasaNova,
      volumeTotalSolicitado,
      volumeTotalAprovado,
      volumeCasaNova,
      aprovados,
      emQualificacao,
      pendentesDocumentos: pendentes,
      taxaAprovacao: total > 0 ? Math.round((aprovados / total) * 100) : 0,
      empresaGestora: "BancoFé Operações Financeiras",
      moduloGestor: "Módulo de Operações Financeiras BancoFé",
    };
  }
}

export const servicoPreCadastroBancoFe = new ServicoPreCadastroBancoFe();
