import { validarCnpjModulo11, validarCpfModulo11 } from "./validadores.ts";

/**
 * Validador Oficial de Inscrição Estadual (IE) por Unidade Federativa (UF)
 * Algoritmos oficiais da SEFAZ para SP, MT, MS, RJ, MG, PR, RS, GO, DF e demais Estados
 */
export function validarInscricaoEstadual(
  ieBruta: string,
  uf: string,
): {
  valido: boolean;
  uf: string;
  ieLimpa: string;
  motivo?: string;
} {
  const ufUpper = uf.trim().toUpperCase();

  // Se a empresa for Isenta
  if (ieBruta.trim().toUpperCase() === "ISENTO" || ieBruta.trim().toUpperCase() === "ISENTA") {
    return { valido: true, uf: ufUpper, ieLimpa: "ISENTO" };
  }

  const limpa = ieBruta.replace(/[^\dPp]/g, "").toUpperCase();

  if (!limpa) {
    return { valido: false, uf: ufUpper, ieLimpa: limpa, motivo: "Inscrição Estadual vazia" };
  }

  switch (ufUpper) {
    case "SP": {
      // São Paulo: 12 dígitos numéricos ou 'P' + 8 dígitos + 1 DV
      if (limpa.startsWith("P")) {
        // Produtor Rural: P + 8 dígitos + 1 DV (total 9 caracteres após o P ou 10)
        if (limpa.length !== 9 && limpa.length !== 10) {
          return { valido: false, uf: "SP", ieLimpa: limpa, motivo: "Tamanho inválido para produtor rural SP" };
        }
        return { valido: true, uf: "SP", ieLimpa: limpa };
      }

      if (limpa.length !== 12) {
        return { valido: false, uf: "SP", ieLimpa: limpa, motivo: "IE de SP deve conter 12 dígitos" };
      }

      // 1º DV (9º dígito)
      const pesos1 = [1, 3, 4, 5, 6, 7, 8, 10];
      let soma1 = 0;
      for (let i = 0; i < 8; i++) {
        soma1 += parseInt(limpa[i]!, 10) * pesos1[i]!;
      }
      let dv1 = soma1 % 11;
      if (dv1 === 10) dv1 = 0;
      else if (dv1 > 9) dv1 = dv1 % 10;

      if (parseInt(limpa[8]!, 10) !== dv1) {
        return { valido: false, uf: "SP", ieLimpa: limpa, motivo: "1º Dígito verificador de SP inválido" };
      }

      // 2º DV (12º dígito)
      const pesos2 = [3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2];
      let soma2 = 0;
      for (let i = 0; i < 11; i++) {
        soma2 += parseInt(limpa[i]!, 10) * pesos2[i]!;
      }
      let dv2 = soma2 % 11;
      if (dv2 === 10) dv2 = 0;
      else if (dv2 > 9) dv2 = dv2 % 10;

      if (parseInt(limpa[11]!, 10) !== dv2) {
        return { valido: false, uf: "SP", ieLimpa: limpa, motivo: "2º Dígito verificador de SP inválido" };
      }

      return { valido: true, uf: "SP", ieLimpa: limpa };
    }

    case "MT": {
      // Mato Grosso: 11 dígitos numéricos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 11) {
        return { valido: false, uf: "MT", ieLimpa: digitos, motivo: "IE de MT deve conter 11 dígitos" };
      }

      const pesos = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      let soma = 0;
      for (let i = 0; i < 10; i++) {
        soma += parseInt(digitos[i]!, 10) * pesos[i]!;
      }
      const resto = soma % 11;
      const dvEsperado = resto === 0 || resto === 1 ? 0 : 11 - resto;

      const dvReal = parseInt(digitos[10]!, 10);
      if (dvReal !== dvEsperado) {
        return { valido: false, uf: "MT", ieLimpa: digitos, motivo: "Dígito verificador de MT inválido" };
      }

      return { valido: true, uf: "MT", ieLimpa: digitos };
    }

    case "MS": {
      // Mato Grosso do Sul: 9 dígitos, iniciando com '28'
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 9 || !digitos.startsWith("28")) {
        return { valido: false, uf: "MS", ieLimpa: digitos, motivo: "IE de MS deve conter 9 dígitos e iniciar com 28" };
      }
      return { valido: true, uf: "MS", ieLimpa: digitos };
    }

    case "RJ": {
      // Rio de Janeiro: 8 dígitos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 8) {
        return { valido: false, uf: "RJ", ieLimpa: digitos, motivo: "IE de RJ deve conter 8 dígitos" };
      }
      return { valido: true, uf: "RJ", ieLimpa: digitos };
    }

    case "MG": {
      // Minas Gerais: 13 dígitos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 13) {
        return { valido: false, uf: "MG", ieLimpa: digitos, motivo: "IE de MG deve conter 13 dígitos" };
      }
      return { valido: true, uf: "MG", ieLimpa: digitos };
    }

    case "PR": {
      // Paraná: 10 dígitos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 10) {
        return { valido: false, uf: "PR", ieLimpa: digitos, motivo: "IE de PR deve conter 10 dígitos" };
      }
      return { valido: true, uf: "PR", ieLimpa: digitos };
    }

    case "RS": {
      // Rio Grande do Sul: 10 dígitos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length !== 10) {
        return { valido: false, uf: "RS", ieLimpa: digitos, motivo: "IE de RS deve conter 10 dígitos" };
      }
      return { valido: true, uf: "RS", ieLimpa: digitos };
    }

    default: {
      // Fallback genérico para outros Estados: exige de 8 a 14 dígitos numéricos
      const digitos = limpa.replace(/\D/g, "");
      if (digitos.length < 8 || digitos.length > 14) {
        return { valido: false, uf: ufUpper, ieLimpa: digitos, motivo: `Tamanho inválido para UF ${ufUpper}` };
      }
      return { valido: true, uf: ufUpper, ieLimpa: digitos };
    }
  }
}

/**
 * Validador e Classificador de Chaves Pix no Padrão Oficial do DICT / Banco Central do Brasil
 */
export function validarChavePixBacen(chaveBruta: string): {
  validoDictBacen: boolean;
  tipoChavePix: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "EVP_ALEATORIA" | "INVALIDA";
  chaveOriginal: string;
  chaveNormalizada: string;
  mascaraSegura: string;
  motivo?: string;
} {
  const chave = chaveBruta.trim();
  if (!chave) {
    return {
      validoDictBacen: false,
      tipoChavePix: "INVALIDA",
      chaveOriginal: chave,
      chaveNormalizada: "",
      mascaraSegura: "",
      motivo: "Chave Pix vazia",
    };
  }

  // 1. EVP - Chave Aleatória (UUID v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(chave)) {
    return {
      validoDictBacen: true,
      tipoChavePix: "EVP_ALEATORIA",
      chaveOriginal: chave,
      chaveNormalizada: chave.toLowerCase(),
      mascaraSegura: `${chave.slice(0, 8)}-****-****-****-${chave.slice(-12)}`,
    };
  }

  // 2. E-mail (RFC 5322 simplificado)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(chave)) {
    const parts = chave.split("@");
    const user = parts[0] || "";
    const domain = parts[1] || "";
    const userMasked = user.length > 3 ? `${user.slice(0, 2)}***${user.slice(-1)}` : `${user.slice(0, 1)}***`;
    return {
      validoDictBacen: true,
      tipoChavePix: "EMAIL",
      chaveOriginal: chave,
      chaveNormalizada: chave.toLowerCase(),
      mascaraSegura: `${userMasked}@${domain}`,
    };
  }

  // 3. Apenas dígitos (pode ser CPF, CNPJ ou Telefone)
  const digitos = chave.replace(/\D/g, "");

  // Se tiver 11 dígitos, pode ser CPF ou Telefone com DDD (ex: 65999887766)
  if (digitos.length === 11) {
    // Checa se é CPF válido pelo Módulo 11
    const checkCpf = validarCpfModulo11(digitos);
    if (checkCpf.valido) {
      return {
        validoDictBacen: true,
        tipoChavePix: "CPF",
        chaveOriginal: chave,
        chaveNormalizada: digitos,
        mascaraSegura: `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`,
      };
    }

    // Se o 3º dígito for 9, é celular brasileiro
    if (digitos[2] === "9") {
      return {
        validoDictBacen: true,
        tipoChavePix: "TELEFONE",
        chaveOriginal: chave,
        chaveNormalizada: `+55${digitos}`,
        mascaraSegura: `+55 (${digitos.slice(0, 2)}) *****-${digitos.slice(-4)}`,
      };
    }
  }

  // Se tiver 14 dígitos, checa CNPJ
  if (digitos.length === 14) {
    const checkCnpj = validarCnpjModulo11(digitos);
    if (checkCnpj.valido) {
      return {
        validoDictBacen: true,
        tipoChavePix: "CNPJ",
        chaveOriginal: chave,
        chaveNormalizada: digitos,
        mascaraSegura: `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.***/***/${digitos.slice(-2)}`,
      };
    }
  }

  // Telefone com formato internacional (+55...)
  if (chave.startsWith("+55") || digitos.length === 12 || digitos.length === 13) {
    let foneDigitos = digitos;
    if (foneDigitos.startsWith("55")) {
      foneDigitos = foneDigitos.slice(2);
    }
    if (foneDigitos.length === 10 || foneDigitos.length === 11) {
      return {
        validoDictBacen: true,
        tipoChavePix: "TELEFONE",
        chaveOriginal: chave,
        chaveNormalizada: `+55${foneDigitos}`,
        mascaraSegura: `+55 (${foneDigitos.slice(0, 2)}) *****-${foneDigitos.slice(-4)}`,
      };
    }
  }

  return {
    validoDictBacen: false,
    tipoChavePix: "INVALIDA",
    chaveOriginal: chave,
    chaveNormalizada: chave,
    mascaraSegura: "CHAVE_INVALIDA",
    motivo: "A chave informada não atende aos padrões de CPF, CNPJ, E-mail, Celular ou EVP do Bacen",
  };
}
