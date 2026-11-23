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
   * Inicializa a esteira com os cadastros iniciais reais do ecossistema BancoFé, Casanova e UISA
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
        empresaParceira: "Estância Gonçalves / UISA",
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
        empresaParceira: "Dino Barbearia / Kytto",
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
        empresaParceira: "UISA Biorrefinaria",
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
        empresaParceira: "Construtora Ultra",
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
        empresaParceira: "Kytto Tecnologia",
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
        empresaParceira: "UISA Barter & BancoFé Agro",
        autorizacaoLgpd: true,
        scoreSerasaEstimado: 950,
        valorPretendido: 2500000,
        prazoMeses: 36,
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
        autorizacaoLgpd: d.autorizacaoLgpd,
        scoreSerasaEstimado: d.scoreSerasaEstimado,
        dados360Enriquecidos: obterClientePorCpf(d.titular.cpfLimpo) || undefined,
        simulacao,
        parecerMesaCredito: parecerMesa,
        pendencias,
        historicoNotas: [
          {
            data: d.dataCriacao,
            autor: "Sistema Automático BancoFé",
            nota: `Pré-cadastro registrado via canal ${d.empresaParceira}. Enriquecimento cadastral 360, SCR Bacen e Mesa de Risco executados.`,
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
      docs.push({ id: "doc-14", descricao: "Quadro Resumo de Reserva do Lote / Construtora Ultra", obrigatorio: true, status: status === "aprovado_autonomo" ? "aprovado" : "anexado" });
    }

    return docs;
  }

  public calcularSimulacaoCredito(
    valor: number,
    prazoMeses: number,
    sistema: "SAC" | "PRICE",
    rendaMensal: number,
    score = 800,
    registroId = "pre-auto",
    nomeTitular = "Cliente BancoFé",
    produto: ProdutoPretendidoBancoFe = "financiamento_imobiliario"
  ): SimulacaoCreditoPreCadastro {
    // Taxa base adaptativa por produto e score
    let taxaMensal = 0.89; // padrão

    if (produto === "mcmv_habitacional_popular") {
      taxaMensal = 0.58; // MCMV subsidiado
    } else if (produto === "emprestimo_consignado") {
      taxaMensal = 0.79; // Consignado folha
    } else if (produto === "credito_rural_agro" || produto === "cpr_digital_agro_barter") {
      taxaMensal = 0.75; // Agro Custeio / CPR
    } else if (produto === "home_equity_garantia_imovel") {
      taxaMensal = 0.85; // Home Equity com garantia real
    } else if (produto === "financiamento_lotes_ultra") {
      taxaMensal = 0.95; // Lotes até 180 meses
    } else if (produto === "capital_giro_pj") {
      taxaMensal = 1.15; // Giro PJ
    } else {
      // Financiamento Imobiliário SBPE
      if (score >= 900) taxaMensal = 0.79;
      else if (score >= 800) taxaMensal = 0.85;
      else if (score >= 700) taxaMensal = 0.99;
      else taxaMensal = 1.15;
    }

    let primeiraParcela = 0;
    if (sistema === "SAC") {
      const amortizacao = valor / prazoMeses;
      const jurosInicial = valor * (taxaMensal / 100);
      primeiraParcela = amortizacao + jurosInicial;
    } else {
      // PRICE: P = V * (i * (1+i)^n) / ((1+i)^n - 1)
      const i = taxaMensal / 100;
      const n = prazoMeses;
      const fator = Math.pow(1 + i, n);
      primeiraParcela = valor * ((i * fator) / (fator - 1));
    }

    const capacidade30 = rendaMensal * 0.3;
    const comprometimento = Math.round((primeiraParcela / (rendaMensal || 1)) * 1000) / 10;
    const aprovado = primeiraParcela <= capacidade30 && score >= 700;

    let certificado: CertificadoAprovacaoAutonoma | undefined = undefined;
    if (aprovado) {
      const hash = createHash("sha256")
        .update(`${registroId}:${valor}:${prazoMeses}:${taxaMensal}:${produto}:BANCOFE_2026`)
        .digest("hex")
        .toUpperCase()
        .slice(0, 32);

      certificado = {
        codigoCertificado: `CERT-BFE-${new Date().getFullYear()}-${hash.slice(0, 8)}`,
        emitidoEm: new Date().toISOString(),
        hashSha256: `SHA256:${hash}`,
        limiteAprovado: valor,
        prazoMesesAprovado: prazoMeses,
        sistema,
        taxaJurosMensal: taxaMensal,
        validadeDias: 60,
        instituicaoEmissora: "BANCO FÉ - CRÉDITO INTELIGENTE 360",
        produtoNome: produto.replace(/_/g, " ").toUpperCase(),
        qrCodeValidacao: `https://bancofe.com.br/validar/${hash.slice(0, 12)}`,
      };
    }

    return {
      valorSolicitado: valor,
      prazoMeses,
      sistemaAmortizacao: sistema,
      taxaJurosMensal: taxaMensal,
      valorPrimeiraParcela: Math.round(primeiraParcela * 100) / 100,
      capacidadeParcela30Pct: Math.round(capacidade30 * 100) / 100,
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
  }): RegistroPreCadastroBancoFe[] {
    let lista = Array.from(this.registros.values());
    if (!filtros) return lista;

    if (filtros.status) {
      lista = lista.filter((r) => r.status === filtros.status);
    }
    if (filtros.produto) {
      lista = lista.filter((r) => r.produtoPretendido === filtros.produto);
    }
    if (filtros.termo) {
      const t = filtros.termo.toLowerCase().trim();
      lista = lista.filter(
        (r) =>
          r.titular.nomeCompleto.toLowerCase().includes(t) ||
          r.titular.cpfOuCnpj.includes(t) ||
          r.codigoProtocolo.toLowerCase().includes(t) ||
          r.titular.cidade.toLowerCase().includes(t)
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

    const statusInicial: StatusPreCadastro = simulacao.aprovadoAutomaticamente && parecerMesa.decisaoFinal !== "RECUSADO_POLITICA_RISCO" && parecerMesa.decisaoFinal !== "CONDICIONADO_AVALISTA_OU_GARANTIA"
      ? "aprovado_autonomo"
      : "em_qualificacao";

    const pendencias = this.gerarPendenciasPadrao(validado.produtoPretendido, statusInicial);

    const novo: RegistroPreCadastroBancoFe = {
      id,
      codigoProtocolo,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
      status: statusInicial,
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
      empresaParceira: validado.empresaParceira || "BancoFé Direto",
      autorizacaoLgpd: validado.autorizacaoLgpd,
      scoreSerasaEstimado: scoreSerasa,
      dados360Enriquecidos: dossie360 || undefined,
      simulacao,
      parecerMesaCredito: parecerMesa,
      pendencias,
      historicoNotas: [
        {
          data: new Date().toISOString(),
          autor: "Portal Pré-Cadastro BancoFé",
          nota: `Entrada de proposta registrada. Rating BancoFé ${parecerMesa.ratingBancoFe} (Score ${parecerMesa.scoreBancoFe}) com decisão: ${parecerMesa.decisaoFinal}.`,
        },
      ],
    };

    this.registros.set(id, novo);
    return novo;
  }

  public atualizarStatus(id: string, novoStatus: StatusPreCadastro, nota?: string): RegistroPreCadastroBancoFe | null {
    const r = this.registros.get(id);
    if (!r) return null;

    r.status = novoStatus;
    r.dataAtualizacao = new Date().toISOString();
    if (nota) {
      r.historicoNotas.push({
        data: new Date().toISOString(),
        autor: "Comitê de Crédito BancoFé",
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

    return {
      totalCadastrados: total,
      totalPreCadastros: total,
      aprovados,
      emQualificacao,
      pendentesDocumentos: pendentes,
      taxaAprovacao: total > 0 ? Math.round((aprovados / total) * 100) : 0,
      volumeTotalSolicitado,
      volumeTotalAprovado,
    };
  }
}

export const servicoPreCadastroBancoFe = new ServicoPreCadastroBancoFe();
