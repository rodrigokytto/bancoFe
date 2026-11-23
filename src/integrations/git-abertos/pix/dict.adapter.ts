export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export interface DictKeyInfo {
  key: string;
  type: PixKeyType;
  ownerName: string;
  ownerDocument: string;
  bankName: string;
  bankIspb: string;
  accountType: 'CACC' | 'SLRY' | 'SVGS';
  accountNumber: string;
  branch: string;
  createdAt: string;
}

export class DictDirectoryAdapter {
  private static mockDirectory: Map<string, DictKeyInfo> = new Map([
    [
      'contato@bancofe.com.br',
      {
        key: 'contato@bancofe.com.br',
        type: 'EMAIL',
        ownerName: 'BANCOFE S.A. INSTITUICAO DE PAGAMENTO',
        ownerDocument: '12.345.678/0001-90',
        bankName: 'BancoFe',
        bankIspb: '12345678',
        accountType: 'CACC',
        accountNumber: '100234-5',
        branch: '0001',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ],
    [
      '06988722661',
      {
        key: '06988722661',
        type: 'CPF',
        ownerName: 'RODRIGO RIBEIRO GONCALVES',
        ownerDocument: '069.***.***-61',
        bankName: 'BancoFe Agro & Tech',
        bankIspb: '12345678',
        accountType: 'CACC',
        accountNumber: '998877-1',
        branch: '0001',
        createdAt: '2026-02-10T14:30:00Z',
      },
    ],
  ]);

  public static detectKeyType(key: string): PixKeyType {
    const cleanKey = key.trim();
    if (cleanKey.includes('@')) return 'EMAIL';
    const digitsOnly = cleanKey.replace(/\D/g, '');
    if (digitsOnly.length === 11 && !cleanKey.startsWith('+')) return 'CPF';
    if (digitsOnly.length === 14) return 'CNPJ';
    if (cleanKey.startsWith('+') || (digitsOnly.length >= 12 && digitsOnly.length <= 13)) return 'PHONE';
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanKey)) return 'EVP';
    return 'EVP';
  }

  public static async resolveKey(key: string): Promise<DictKeyInfo> {
    const type = this.detectKeyType(key);
    const existing = this.mockDirectory.get(key);
    if (existing) return existing;

    // Resolução dinâmica caso não esteja na base mock
    return {
      key,
      type,
      ownerName: 'CLIENTE HOMOLOGACAO BACEN',
      ownerDocument: type === 'CPF' ? '***.***.***-00' : '**.***.***/0001-00',
      bankName: 'BANCO PARTICIPANTE SPI BACEN',
      bankIspb: '99999999',
      accountType: 'CACC',
      accountNumber: '12345-6',
      branch: '0001',
      createdAt: new Date().toISOString(),
    };
  }
}

export interface MedClaim {
  id: string;
  originalEndToEndId: string;
  transactionAmountCentavos: number;
  reason: 'SUSPECT_FRAUD' | 'OPERATIONAL_ERROR';
  status: 'ANALYSIS' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  claimedAt: string;
  resolvedAt?: string;
}

export class MedSpecialRefundAdapter {
  private static claims: Map<string, MedClaim> = new Map();

  public static createClaim(originalEndToEndId: string, amountCentavos: number, reason: 'SUSPECT_FRAUD' | 'OPERATIONAL_ERROR'): MedClaim {
    const id = `MED_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const claim: MedClaim = {
      id,
      originalEndToEndId,
      transactionAmountCentavos: amountCentavos,
      reason,
      status: 'ANALYSIS',
      claimedAt: new Date().toISOString(),
    };
    this.claims.set(id, claim);
    return claim;
  }

  public static getClaim(id: string): MedClaim | undefined {
    return this.claims.get(id);
  }

  public static listClaims(): MedClaim[] {
    return Array.from(this.claims.values());
  }
}
