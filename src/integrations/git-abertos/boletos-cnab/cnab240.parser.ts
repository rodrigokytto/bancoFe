/**
 * Gerador e Processador de arquivos de remessa e retorno CNAB 240 (FEBRABAN).
 */

export interface CNABPaymentItem {
  id: string;
  favoredName: string;
  favoredDocument: string;
  favoredBank: string;
  favoredBranch: string;
  favoredAccount: string;
  amountCentavos: number;
  paymentDate: string; // YYYYMMDD
  referenceId: string;
}

export class CNAB240Engine {
  /**
   * Gera um arquivo de Remessa CNAB 240 para pagamentos em lote / fornecedores / salários
   */
  public static generateRemessa240(
    companyName: string,
    companyDocument: string,
    items: CNABPaymentItem[]
  ): string {
    const lines: string[] = [];
    const dateFormatted = new Date().toISOString().replace(/\D/g, '').substring(0, 8); // YYYYMMDD
    const timeFormatted = new Date().toISOString().replace(/\D/g, '').substring(8, 14); // HHMMSS

    // 1. Header de Arquivo (Registro 0)
    let header = '79900000'; // Banco 799 (BancoFe), Lote 0000, Tipo 0
    header += '         '; // 9 brancos
    header += companyDocument.length > 11 ? '2' : '1'; // Tipo inscricao (1=CPF, 2=CNPJ)
    header += companyDocument.replace(/\D/g, '').padStart(14, '0');
    header += '                    '; // 20 brancos (Convenio)
    header += '00010001234567'; // Agência e conta da empresa
    header += companyName.toUpperCase().padEnd(30, ' ').substring(0, 30);
    header += 'BANCOFE AGRO TECH             '; // Nome do Banco
    header += '1'; // Codigo Remessa
    header += dateFormatted;
    header += timeFormatted;
    header += '000001'; // Num sequencial do arquivo
    header += '103'; // Versao layout
    header = header.padEnd(240, ' ');
    lines.push(header);

    // 2. Header de Lote (Registro 1)
    let headerLote = '79900011'; // Banco 799, Lote 0001, Tipo 1
    headerLote += 'C20'; // Operação C (Crédito), Serviço 20 (Pagamento Fornecedores)
    headerLote += '01'; // Forma lançamento (01=Crédito em Conta, 45=Pix)
    headerLote += '045'; // Versao layout do lote
    headerLote += ' ';
    headerLote += companyDocument.length > 11 ? '2' : '1';
    headerLote += companyDocument.replace(/\D/g, '').padStart(14, '0');
    headerLote = headerLote.padEnd(240, ' ');
    lines.push(headerLote);

    let totalAmount = 0;
    let recordCount = 0;

    // 3. Detalhes (Segmento A e Segmento B)
    items.forEach((item, index) => {
      totalAmount += item.amountCentavos;
      recordCount += 2; // Segmento A + B

      // Segmento A: Dados do Favorecido e Valor
      let segA = '79900013'; // Banco, Lote 0001, Registro 3
      segA += (index * 2 + 1).toString().padStart(5, '0'); // Sequencial
      segA += 'A'; // Segmento A
      segA += '000'; // Tipo movimento
      segA += item.favoredBank.padStart(3, '0');
      segA += item.favoredBranch.padStart(5, '0');
      segA += item.favoredAccount.padStart(12, '0');
      segA += item.favoredName.toUpperCase().padEnd(30, ' ').substring(0, 30);
      segA += item.referenceId.padEnd(20, ' ').substring(0, 20);
      segA += item.paymentDate;
      segA += 'BRL';
      segA += item.amountCentavos.toString().padStart(15, '0');
      segA = segA.padEnd(240, ' ');
      lines.push(segA);

      // Segmento B: Dados Complementares e Documento
      let segB = '79900013';
      segB += (index * 2 + 2).toString().padStart(5, '0');
      segB += 'B';
      segB += '   ';
      segB += item.favoredDocument.length > 11 ? '2' : '1';
      segB += item.favoredDocument.replace(/\D/g, '').padStart(14, '0');
      segB = segB.padEnd(240, ' ');
      lines.push(segB);
    });

    // 4. Trailer de Lote (Registro 5)
    let trailerLote = '79900015'; // Banco 799, Lote 0001, Tipo 5
    trailerLote += '         ';
    trailerLote += (recordCount + 2).toString().padStart(6, '0'); // Qtd registros no lote
    trailerLote += totalAmount.toString().padStart(18, '0'); // Somatório dos valores
    trailerLote = trailerLote.padEnd(240, ' ');
    lines.push(trailerLote);

    // 5. Trailer de Arquivo (Registro 9)
    let trailerArquivo = '79999999';
    trailerArquivo += '         ';
    trailerArquivo += '000001'; // Qtd lotes
    trailerArquivo += (lines.length + 1).toString().padStart(6, '0'); // Total de linhas
    trailerArquivo = trailerArquivo.padEnd(240, ' ');
    lines.push(trailerArquivo);

    return lines.join('\r\n');
  }

  /**
   * Processa arquivo de Retorno CNAB 240
   */
  public static parseRetorno240(content: string): {
    bank: string;
    totalRecords: number;
    processedPayments: Array<{
      sequence: string;
      referenceId: string;
      amountCentavos: number;
      status: 'PAID' | 'REJECTED';
    }>;
  } {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length >= 200);
    const processed: any[] = [];

    for (const line of lines) {
      const recordType = line.substring(7, 8);
      const segmentType = line.substring(13, 14);

      if (recordType === '3' && segmentType === 'A') {
        const sequence = line.substring(8, 13).trim();
        const referenceId = line.substring(73, 93).trim();
        const amountCentavos = parseInt(line.substring(119, 134), 10) || 0;
        // Posição de ocorrência FEBRABAN
        const ocorrencia = line.substring(230, 232).trim();
        const status = (ocorrencia === '00' || ocorrencia === '') ? 'PAID' : 'REJECTED';

        processed.push({
          sequence,
          referenceId,
          amountCentavos,
          status,
        });
      }
    }

    return {
      bank: lines[0]?.substring(0, 3) || '799',
      totalRecords: lines.length,
      processedPayments: processed,
    };
  }
}
