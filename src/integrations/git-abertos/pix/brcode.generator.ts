/**
 * Gerador de BR Code / EMVCo QR Code para Pix do Banco Central do Brasil.
 * Implementação pura em TypeScript conforme Manual de Padrões para Iniciação do Pix do BACEN.
 */

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number; // Em reais, ex: 150.50
  txid?: string;   // Máximo 25 caracteres para QR estático ou UUID para dinâmico
  infoAdicional?: string;
  urlPayload?: string; // Para Pix dinâmico
}

export class PixBRCodeGenerator {
  /**
   * Calcula o CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF)
   */
  public static calculateCRC16(payload: string): string {
    const polynomial = 0x1021;
    let crc = 0xffff;

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let bit = 0; bit < 8; bit++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  /**
   * Formata uma tag TLV (Tag-Length-Value) no padrão EMVCo
   */
  private static formatTLV(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
  }

  /**
   * Normaliza textos removendo acentos e caracteres especiais para compatibilidade bancária
   */
  private static normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim();
  }

  /**
   * Gera o código Pix Copia e Cola / Payload EMVCo
   */
  public static generate(params: PixPayloadParams): { payload: string; qrCodeData: string; txid: string } {
    const txid = params.txid ? params.txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) : '***';
    const merchantName = this.normalizeText(params.merchantName || 'BANCOFE').substring(0, 25);
    const merchantCity = this.normalizeText(params.merchantCity || 'BRASILIA').substring(0, 15);

    // 00: Payload Format Indicator
    let payload = this.formatTLV('00', '01');

    // 01: Point of Initiation Method (12 = dinâmico, 11 = estático)
    const isDynamic = Boolean(params.urlPayload);
    payload += this.formatTLV('01', isDynamic ? '12' : '11');

    // 26: Merchant Account Information (Pix GUI + chave ou URL)
    let merchantAccountInfo = this.formatTLV('00', 'br.gov.bcb.pix');
    if (isDynamic && params.urlPayload) {
      merchantAccountInfo += this.formatTLV('25', params.urlPayload);
    } else {
      merchantAccountInfo += this.formatTLV('01', params.pixKey);
      if (params.infoAdicional) {
        merchantAccountInfo += this.formatTLV('02', this.normalizeText(params.infoAdicional).substring(0, 40));
      }
    }
    payload += this.formatTLV('26', merchantAccountInfo);

    // 52: Merchant Category Code (0000 = Geral)
    payload += this.formatTLV('52', '0000');

    // 53: Transaction Currency (986 = Real Brasileiro ISO 4217)
    payload += this.formatTLV('53', '986');

    // 54: Transaction Amount
    if (params.amount && params.amount > 0) {
      payload += this.formatTLV('54', params.amount.toFixed(2));
    }

    // 58: Country Code (BR)
    payload += this.formatTLV('58', 'BR');

    // 59: Merchant Name
    payload += this.formatTLV('59', merchantName);

    // 60: Merchant City
    payload += this.formatTLV('60', merchantCity);

    // 62: Additional Data Field Template (txid)
    const additionalData = this.formatTLV('05', txid);
    payload += this.formatTLV('62', additionalData);

    // 63: CRC16 (Tag 63 + tamanho 04 + valor calculado)
    const payloadBeforeCRC = payload + '6304';
    const crc = this.calculateCRC16(payloadBeforeCRC);
    const fullPayload = `${payloadBeforeCRC}${crc}`;

    return {
      payload: fullPayload,
      qrCodeData: fullPayload,
      txid,
    };
  }
}
