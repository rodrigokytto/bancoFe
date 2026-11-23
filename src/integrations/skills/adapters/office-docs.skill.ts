/**
 * Adaptador da Skill office-documents para o BancoFe.
 * Geração de Extratos Bancários estruturados (CSV/HTML), Comprovantes Pix e Relatórios Contábeis.
 */

export interface StatementTransaction {
  date: string;
  description: string;
  category: string;
  type: 'DEBIT' | 'CREDIT';
  amountBrl: number;
  balanceAfterBrl: number;
}

export class OfficeDocumentsSkillAdapter {
  /**
   * Gera extrato bancário em formato CSV compatível com Excel e ERPs
   */
  public static generateStatementCSV(
    accountNumber: string,
    holderName: string,
    transactions: StatementTransaction[]
  ): string {
    const lines: string[] = [];
    lines.push('BANCOFE S.A. - EXTRATO DE CONTA CORRENTE');
    lines.push(`Titular:;${holderName}`);
    lines.push(`Conta Corrente:;${accountNumber}`);
    lines.push(`Emitido em:;${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`);
    lines.push('');
    lines.push('Data;Historico;Categoria;Tipo;Valor (R$);Saldo (R$)');

    for (const t of transactions) {
      const valorStr = (t.type === 'DEBIT' ? -t.amountBrl : t.amountBrl).toFixed(2).replace('.', ',');
      const saldoStr = t.balanceAfterBrl.toFixed(2).replace('.', ',');
      lines.push(`${t.date};"${t.description}";${t.category};${t.type};${valorStr};${saldoStr}`);
    }

    return lines.join('\r\n');
  }

  /**
   * Gera Comprovante Oficial de Transferência Pix em Markdown/HTML formatado
   */
  public static generatePixReceipt(data: {
    endToEndId: string;
    amountBrl: number;
    payerName: string;
    payerDocument: string;
    favoredName: string;
    favoredDocument: string;
    favoredBank: string;
    pixKey: string;
    txid: string;
    timestamp: string;
  }): string {
    const amountStr = data.amountBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return `
======================================================
              BANCOFE AGRO TECH S.A.
           COMPROVANTE DE TRANSFERÊNCIA PIX
======================================================
VALOR: ${amountStr}
DATA E HORA: ${new Date(data.timestamp).toLocaleString('pt-BR')}
ID DA TRANSAÇÃO (E2E): ${data.endToEndId}
TXID: ${data.txid}
------------------------------------------------------
ORIGEM (PAGADOR):
Nome: ${data.payerName}
CPF/CNPJ: ${data.payerDocument}
Instituição: 799 - BancoFe S.A.

DESTINO (RECEBEDOR):
Nome: ${data.favoredName}
CPF/CNPJ: ${data.favoredDocument}
Instituição: ${data.favoredBank}
Chave Pix: ${data.pixKey}
------------------------------------------------------
Autenticação Digital:
${data.endToEndId.substring(0, 16)}.${data.endToEndId.substring(16, 32)}
Em conformidade com as regras do Sistema de Pagamentos
Instantâneos (SPI) do Banco Central do Brasil.
======================================================
`.trim();
  }
}
