import type { Request } from "express";
import { normalizarEmpresaId } from "../shared/escopoEmpresa";

export * from "../shared/escopoEmpresa";

export function empresaAtivaDaRequisicao(req: Request): string {
  const header = req.headers["x-empresa-id"];
  const q = (req.query?.empresa as string) || (req.query?.empresaAtiva as string);
  const bruto = (Array.isArray(header) ? header[0] : header) || q || "";
  return normalizarEmpresaId(bruto);
}

