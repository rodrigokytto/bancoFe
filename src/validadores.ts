/**
 * Validadores Oficiais e Utilitários de Documentos Brasileiros
 * Algoritmos Oficiais Módulo 11 da Receita Federal do Brasil
 */

export interface ValidacaoDocumento {
  valido: boolean;
  tipo: "CPF" | "CNPJ" | "DESCONHECIDO";
  documentoLimpo: string;
  documentoFormatado: string;
  motivoInvalidez?: string;
  detalhes?: {
    d1Esperado?: number;
    d2Esperado?: number;
    regiaoFiscal?: {
      regiao: string;
      estados: string[];
      sedeFiscal: string;
    };
  };
}

/**
 * Valida CPF utilizando o algoritmo oficial Módulo 11
 */
export function validarCpfModulo11(cpfBruto: string): { valido: boolean; d1: number; d2: number } {
  const limpo = cpfBruto.replace(/\D/g, "");
  if (limpo.length !== 11) return { valido: false, d1: 0, d2: 0 };
  if (/^(\d)\1{10}$/.test(limpo)) return { valido: false, d1: 0, d2: 0 };

  let soma1 = 0;
  for (let i = 0; i < 9; i++) {
    soma1 += parseInt(limpo[i]!, 10) * (10 - i);
  }
  const resto1 = (soma1 * 10) % 11;
  const d1 = resto1 === 10 || resto1 === 11 ? 0 : resto1;

  let soma2 = 0;
  for (let i = 0; i < 10; i++) {
    soma2 += parseInt(limpo[i]!, 10) * (11 - i);
  }
  const resto2 = (soma2 * 10) % 11;
  const d2 = resto2 === 10 || resto2 === 11 ? 0 : resto2;

  const valido = d1 === parseInt(limpo[9]!, 10) && d2 === parseInt(limpo[10]!, 10);
  return { valido, d1, d2 };
}

/**
 * Valida CNPJ utilizando o algoritmo oficial Módulo 11
 */
export function validarCnpjModulo11(cnpjBruto: string): { valido: boolean; d1: number; d2: number } {
  const limpo = cnpjBruto.replace(/\D/g, "");
  if (limpo.length !== 14) return { valido: false, d1: 0, d2: 0 };
  if (/^(\d)\1{13}$/.test(limpo)) return { valido: false, d1: 0, d2: 0 };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma1 = 0;
  for (let i = 0; i < 12; i++) {
    soma1 += parseInt(limpo[i]!, 10) * pesos1[i]!;
  }
  const resto1 = soma1 % 11;
  const d1 = resto1 < 2 ? 0 : 11 - resto1;

  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma2 = 0;
  for (let i = 0; i < 13; i++) {
    soma2 += parseInt(limpo[i]!, 10) * pesos2[i]!;
  }
  const resto2 = soma2 % 11;
  const d2 = resto2 < 2 ? 0 : 11 - resto2;

  const valido = d1 === parseInt(limpo[12]!, 10) && d2 === parseInt(limpo[13]!, 10);
  return { valido, d1, d2 };
}

/**
 * Mapeamento oficial de Regiões Fiscais da Receita Federal (pelo 9º dígito do CPF)
 */
export function obterRegiaoFiscalRfb(cpfLimpo: string) {
  const nono = parseInt(cpfLimpo[8] || "0", 10);
  const mapa: Record<number, { regiao: string; estados: string[]; sedeFiscal: string }> = {
    0: { regiao: "10ª Região Fiscal", estados: ["RS"], sedeFiscal: "Porto Alegre/RS" },
    1: { regiao: "1ª Região Fiscal", estados: ["DF", "GO", "MS", "MT", "TO"], sedeFiscal: "Brasília/DF & Cuiabá/MT" },
    2: { regiao: "2ª Região Fiscal", estados: ["AC", "AM", "AP", "PA", "RO", "RR"], sedeFiscal: "Belém/PA" },
    3: { regiao: "3ª Região Fiscal", estados: ["CE", "MA", "PI"], sedeFiscal: "Fortaleza/CE" },
    4: { regiao: "4ª Região Fiscal", estados: ["AL", "PB", "PE", "RN"], sedeFiscal: "Recife/PE" },
    5: { regiao: "5ª Região Fiscal", estados: ["BA", "SE"], sedeFiscal: "Salvador/BA" },
    6: { regiao: "6ª Região Fiscal", estados: ["MG"], sedeFiscal: "Belo Horizonte/MG" },
    7: { regiao: "7ª Região Fiscal", estados: ["ES", "RJ"], sedeFiscal: "Rio de Janeiro/RJ" },
    8: { regiao: "8ª Região Fiscal", estados: ["SP"], sedeFiscal: "São Paulo/SP" },
    9: { regiao: "9ª Região Fiscal", estados: ["PR", "SC"], sedeFiscal: "Curitiba/PR" },
  };
  return mapa[nono] || mapa[1]!;
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatarCpf(cpfLimpo: string): string {
  const d = cpfLimpo.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 */
export function formatarCnpj(cnpjLimpo: string): string {
  const d = cnpjLimpo.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/**
 * Mascara CPF para proteção e conformidade LGPD: 123.***.***-45
 */
export function mascararCpfLgpd(cpf: string): string {
  const limpo = cpf.replace(/\D/g, "");
  if (limpo.length !== 11) return cpf;
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9)}`;
}

/**
 * Mascara CNPJ para proteção e conformidade LGPD: 12.345.*** / 0001-67
 */
export function mascararCnpjLgpd(cnpj: string): string {
  const limpo = cnpj.replace(/\D/g, "");
  if (limpo.length !== 14) return cnpj;
  return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.***${limpo.slice(8, 12)}-${limpo.slice(12)}`;
}

/**
 * Analisa e valida qualquer documento de entrada
 */
export function analisarDocumentoEntrada(entrada: string): ValidacaoDocumento {
  const limpo = entrada.replace(/\D/g, "");
  if (limpo.length === 11) {
    const check = validarCpfModulo11(limpo);
    const regiao = obterRegiaoFiscalRfb(limpo);
    return {
      valido: check.valido,
      tipo: "CPF",
      documentoLimpo: limpo,
      documentoFormatado: formatarCpf(limpo),
      motivoInvalidez: check.valido
        ? undefined
        : "Dígito verificador do CPF inválido pelo algoritmo oficial Módulo 11 da Receita Federal.",
      detalhes: {
        d1Esperado: check.d1,
        d2Esperado: check.d2,
        regiaoFiscal: regiao,
      },
    };
  }
  if (limpo.length === 14) {
    const check = validarCnpjModulo11(limpo);
    return {
      valido: check.valido,
      tipo: "CNPJ",
      documentoLimpo: limpo,
      documentoFormatado: formatarCnpj(limpo),
      motivoInvalidez: check.valido
        ? undefined
        : "Dígito verificador do CNPJ inválido pelo algoritmo oficial Módulo 11 da Receita Federal.",
      detalhes: {
        d1Esperado: check.d1,
        d2Esperado: check.d2,
      },
    };
  }
  return {
    valido: false,
    tipo: "DESCONHECIDO",
    documentoLimpo: limpo,
    documentoFormatado: entrada,
    motivoInvalidez: "Documento deve conter exatamente 11 dígitos para CPF ou 14 dígitos para CNPJ.",
  };
}

/**
 * Validação e normalização de data de nascimento (suporta DD/MM/AAAA ou AAAA-MM-DD)
 */
export function validarDataNascimento(dataBruta?: string): {
  valido: boolean;
  dataIso: string;
  dataFormatada: string;
  idadeAnos: number;
  maiorDeIdade: boolean;
  motivo?: string;
} {
  if (!dataBruta || typeof dataBruta !== "string") {
    return {
      valido: false,
      dataIso: "",
      dataFormatada: "",
      idadeAnos: 0,
      maiorDeIdade: false,
      motivo: "Data de nascimento não informada",
    };
  }

  const limpa = dataBruta.trim();
  let ano = 0;
  let mes = 0;
  let dia = 0;

  if (/^\d{4}-\d{2}-\d{2}$/.test(limpa)) {
    const partes = limpa.split("-");
    ano = parseInt(partes[0]!, 10);
    mes = parseInt(partes[1]!, 10);
    dia = parseInt(partes[2]!, 10);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(limpa)) {
    const partes = limpa.split("/");
    dia = parseInt(partes[0]!, 10);
    mes = parseInt(partes[1]!, 10);
    ano = parseInt(partes[2]!, 10);
  } else {
    return {
      valido: false,
      dataIso: "",
      dataFormatada: limpa,
      idadeAnos: 0,
      maiorDeIdade: false,
      motivo: "Formato inválido. Utilize DD/MM/AAAA ou AAAA-MM-DD",
    };
  }

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return {
      valido: false,
      dataIso: "",
      dataFormatada: limpa,
      idadeAnos: 0,
      maiorDeIdade: false,
      motivo: "Data com dia ou mês fora do intervalo do calendário",
    };
  }

  const dataObj = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  if (dataObj > hoje) {
    return {
      valido: false,
      dataIso: "",
      dataFormatada: limpa,
      idadeAnos: 0,
      maiorDeIdade: false,
      motivo: "Data de nascimento não pode estar no futuro",
    };
  }

  let idade = hoje.getFullYear() - ano;
  const m = hoje.getMonth() - (mes - 1);
  if (m < 0 || (m === 0 && hoje.getDate() < dia)) {
    idade--;
  }

  const diaStr = String(dia).padStart(2, "0");
  const mesStr = String(mes).padStart(2, "0");
  const anoStr = String(ano);

  return {
    valido: true,
    dataIso: `${anoStr}-${mesStr}-${diaStr}`,
    dataFormatada: `${diaStr}/${mesStr}/${anoStr}`,
    idadeAnos: idade,
    maiorDeIdade: idade >= 18,
  };
}

/**
 * Validação e normalização de nomes de filiação (Mãe e Pai)
 */
export function validarNomeFiliacao(
  nomeBruto?: string,
  tipo: "MAE" | "PAI" | "TITULAR" = "MAE",
): {
  valido: boolean;
  nomeNormalizado: string;
  declarada: boolean;
  motivo?: string;
} {
  if (!nomeBruto || typeof nomeBruto !== "string" || !nomeBruto.trim()) {
    return {
      valido: false,
      nomeNormalizado: "",
      declarada: false,
      motivo: `Nome de ${tipo === "MAE" ? "Mãe" : tipo === "PAI" ? "Pai" : "Titular"} não informado`,
    };
  }

  const limpo = nomeBruto
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ");

  const termosNaoDeclarados = ["NAO DECLARADO", "IGNORADO", "NAO CONSTA", "DESCONHECIDO", "SEM FILIACAO"];
  if (termosNaoDeclarados.includes(limpo)) {
    return {
      valido: true,
      nomeNormalizado: "NÃO CONSTA",
      declarada: false,
      motivo: "Filiação formalmente não declarada nos registros civis",
    };
  }

  const palavras = limpo.split(" ").filter((p) => p.length > 0);
  if (palavras.length < 2) {
    return {
      valido: false,
      nomeNormalizado: limpo,
      declarada: true,
      motivo: "Nome de filiação deve conter pelo menos nome e sobrenome",
    };
  }

  return {
    valido: true,
    nomeNormalizado: limpo,
    declarada: true,
  };
}

/**
 * Comparador de similaridade entre nomes de filiação
 */
export function compararNomesFiliacao(
  nome1: string,
  nome2: string,
): {
  similaridadePercentual: number;
  compativel: boolean;
} {
  const norm1 = nome1
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  const norm2 = nome2
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (norm1 === norm2) {
    return { similaridadePercentual: 100, compativel: true };
  }

  const palavras1 = new Set(norm1.split(/\s+/));
  const palavras2 = new Set(norm2.split(/\s+/));

  let intersecao = 0;
  for (const p of palavras1) {
    if (palavras2.has(p)) intersecao++;
  }

  const uniao = new Set([...palavras1, ...palavras2]).size;
  const similaridade = Math.round((intersecao / uniao) * 100);

  return {
    similaridadePercentual: similaridade,
    compativel: similaridade >= 60,
  };
}
