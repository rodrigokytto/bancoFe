import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

export interface MetadadosArquivoSeguro {
  id: string;
  nomeOriginal: string;
  tipoMime: string;
  tamanhoBytes: number;
  hashSha256: string;
  armazenadoEm: string;
  tenantId: string;
  sistemaOrigem: "ULTRA" | "NOSSA_GENTE" | "CONSULTA360";
  caminhoLocal: string;
  uriGcpStorage?: string;
  finalidadeLgpd: string;
}

/**
 * Módulo de Armazenamento Seguro de Cópias de Imagens e Dados
 * Atende às diretrizes de conformidade, segurança criptográfica e auditoria
 */
export class StorageSeguroConsulta360 {
  private diretorioBase: string;
  private bucketGcpPadrao = "gs://consulta360-secure-vault";

  constructor(diretorioCustomizado?: string) {
    this.diretorioBase = diretorioCustomizado || resolve(process.cwd(), "storage", "secure_vault");
    if (!existsSync(this.diretorioBase)) {
      mkdirSync(this.diretorioBase, { recursive: true });
    }
  }

  /**
   * Armazena uma cópia segura de imagem ou arquivo com hash SHA-256 e metadados
   */
  async salvarArquivoSeguro(params: {
    buffer: Buffer;
    nomeOriginal: string;
    tipoMime: string;
    tenantId: string;
    sistemaOrigem: "ULTRA" | "NOSSA_GENTE" | "CONSULTA360";
    finalidadeLgpd?: string;
  }): Promise<MetadadosArquivoSeguro> {
    const id = randomUUID();
    const hashSha256 = createHash("sha256").update(params.buffer).digest("hex");
    const subdiretorioTenant = join(this.diretorioBase, params.tenantId);

    if (!existsSync(subdiretorioTenant)) {
      mkdirSync(subdiretorioTenant, { recursive: true });
    }

    const extensao = params.nomeOriginal.includes(".")
      ? params.nomeOriginal.slice(params.nomeOriginal.lastIndexOf("."))
      : ".bin";

    const nomeArquivoSeguro = `${params.sistemaOrigem.toLowerCase()}_${Date.now()}_${id.slice(0, 8)}${extensao}`;
    const caminhoLocal = join(subdiretorioTenant, nomeArquivoSeguro);

    // Grava arquivo físico
    writeFileSync(caminhoLocal, params.buffer);

    const metadados: MetadadosArquivoSeguro = {
      id,
      nomeOriginal: params.nomeOriginal,
      tipoMime: params.tipoMime,
      tamanhoBytes: params.buffer.length,
      hashSha256,
      armazenadoEm: new Date().toISOString(),
      tenantId: params.tenantId,
      sistemaOrigem: params.sistemaOrigem,
      caminhoLocal,
      uriGcpStorage: `${this.bucketGcpPadrao}/${params.tenantId}/${nomeArquivoSeguro}`,
      finalidadeLgpd:
        params.finalidadeLgpd ||
        "Armazenamento de evidência pericial e auditoria de conformidade (Art. 7º Lei 13.709/2018)",
    };

    // Salva arquivo de metadados correspondente (.meta.json)
    writeFileSync(`${caminhoLocal}.meta.json`, JSON.stringify(metadados, null, 2), "utf-8");

    return metadados;
  }

  /**
   * Recupera arquivo e valida integridade via SHA-256
   */
  recuperarArquivoSeguro(caminhoLocal: string): {
    buffer: Buffer;
    metadados?: MetadadosArquivoSeguro;
    integro: boolean;
  } {
    if (!existsSync(caminhoLocal)) {
      throw new Error(`Arquivo não encontrado no cofre seguro: ${caminhoLocal}`);
    }

    const buffer = readFileSync(caminhoLocal);
    const hashCalculado = createHash("sha256").update(buffer).digest("hex");

    let metadados: MetadadosArquivoSeguro | undefined;
    const caminhoMeta = `${caminhoLocal}.meta.json`;
    if (existsSync(caminhoMeta)) {
      metadados = JSON.parse(readFileSync(caminhoMeta, "utf-8"));
    }

    const integro = metadados ? metadados.hashSha256 === hashCalculado : true;

    return {
      buffer,
      metadados,
      integro,
    };
  }
}
