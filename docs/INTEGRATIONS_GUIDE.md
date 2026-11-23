# Guia de Integrações • Git Abertos & Padrões Financeiros

Este documento orienta desenvolvedores e engenheiros financeiros na utilização e extensão dos adaptadores de código aberto integrados ao BancoFe.

---

## 1. Pix BACEN & DICT / MED

O adaptador Pix (`src/integrations/git-abertos/pix/`) implementa:

### 1.1. Geração de BR Code (EMVCo)
Conforme a especificação EMVCo QRCPS-MPM (Merchant-Presented Mode) e o Manual do Pix do BACEN:
```typescript
import { PixBRCodeGenerator } from './brcode.generator';

const pix = PixBRCodeGenerator.generate({
  pixKey: 'financeiro@bancofe.com.br',
  amount: 250.75,
  merchantName: 'BancoFe Pagamentos',
  merchantCity: 'SAO PAULO',
  txid: 'PEDIDO123456',
  infoAdicional: 'Pagamento Safra Milho',
});

console.log(pix.payload); // Código Pix Copia e Cola com CRC16
```

### 1.2. Resolução de Chaves DICT & Reivindicações MED
```typescript
import { DictDirectoryAdapter, MedSpecialRefundAdapter } from './dict.adapter';

// Resolução de chave
const keyInfo = await DictDirectoryAdapter.resolveKey('06988722661');

// Abertura de caso MED (Resolução BACEN 103)
const medCase = MedSpecialRefundAdapter.createClaim(
  'E12345678202611221500ABCD1234',
  50000, // R$ 500,00
  'SUSPECT_FRAUD'
);
```

---

## 2. FEBRABAN Boletos & Remessa CNAB 240

O adaptador FEBRABAN (`src/integrations/git-abertos/boletos-cnab/`) implementa a emissão completa de boletos com linha digitável e arquivos de lote:

### 2.1. Emissão de Boleto Registrado
```typescript
import { FebrabanBoletoEngine } from './febraban.engine';

const boleto = FebrabanBoletoEngine.generateBoleto({
  bankCode: '799', // BancoFe
  beneficiaryBranch: '0001',
  beneficiaryAccount: '0012345',
  beneficiaryDocument: '12.345.678/0001-90',
  beneficiaryName: 'BANCOFE AGRO TECH S.A.',
  payerName: 'Agropecuária Rio Verde Ltda',
  payerDocument: '98.765.432/0001-10',
  ourNumber: '0000000123',
  amountCentavos: 125000, // R$ 1.250,00
  dueDate: new Date('2026-12-20T00:00:00Z'),
});

console.log(boleto.barcode); // 44 posições
console.log(boleto.formattedDigitableLine); // 47 posições formatadas (XXXXX.XXXXX XXXXX.XXXXXX ...)
```

### 2.2. Geração de Arquivo CNAB 240
```typescript
import { CNAB240Engine } from './cnab240.parser';

const remessa = CNAB240Engine.generateRemessa240(
  'EMPRESA PAGADORA LTDA',
  '12345678000190',
  [
    {
      id: '1',
      favoredName: 'FORNECEDOR DE SEMENTES',
      favoredDocument: '98765432000100',
      favoredBank: '001',
      favoredBranch: '0001',
      favoredAccount: '123456',
      amountCentavos: 5000000, // R$ 50.000,00
      paymentDate: '20261215',
      referenceId: 'NF10928',
    },
  ]
);
```

---

## 3. Open Finance Brasil (FAPI)

O adaptador Open Finance (`src/integrations/git-abertos/open-finance/`) implementa:
- **Ciclo de Consentimentos:** `AWAITING_AUTHORISATION`, `AUTHORISED`, `REJECTED`, `REVOKED`.
- **Iniciação de Pagamentos (ITP):** Geração de payload padronizado com mTLS e assinatura digital JWT.
- **Compartilhamento de Dados Cadastrais e Saldos:** Compatível com os esquemas da Estrutura de Governança do Open Finance Brasil.

---

## 4. Hub de Gateways Integrados

O BancoFe disponibiliza roteamento inteligente e conciliação para 7 gateways de mercado:
- **Asaas:** Cobrança recorrente e carnês.
- **Efí Bank:** Especialista em Pix Cobrança e webhooks com certificados mTLS.
- **Mercado Pago:** Pagamentos presenciais (Point) e checkout transparente.
- **Stripe:** Pagamentos internacionais em cartões e moedas estrangeiras.
- **OpenPix:** Automação em tempo real de cashback e pagamentos instantâneos.
- **Celcoin:** Banking as a Service, recargas e pagamento de contas de concessionárias.
- **Stark Bank:** Liquidação corporativa de alto volume.

---

## 5. Agro Finance & Barter Digital

Módulo especializado no agronegócio brasileiro:
- **Cédula de Produto Rural (CPR):** Emissão digital com assinatura eletrônica e custódia em câmara registradora autorizada (B3/Cerc).
- **Operação de Barter:** Indexação de financiamentos à cotação da saca de soja (60kg) ou milho na data de liquidação da safra.

---

## 6. Web3 & Drex (Piloto BACEN)

- **Liquidação DvP (Delivery versus Payment):** Troca simultânea de Real Digital (moeda do atacado) ou Real Tokenizado (moeda do varejo) por títulos públicos federais (TPFt) ou CPRs tokenizadas.
- **Padrão ERC-1155:** Smart contracts para ativos fracionáveis agrícolas.
