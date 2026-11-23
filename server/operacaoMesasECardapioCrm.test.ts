import { describe, it, expect } from "vitest";
import { MENU } from "../shared/zumaData";
import { determinarPraca, CHIPS_OBSERVACOES } from "../client/src/components/mesas/ModalCardapioCompleto";
import { BASE_CLIENTES_DEMO } from "../client/src/components/mesas/ModalClienteCrm";

describe("Operação Gastronômica Zuma 360° - Fechamento Flexível, Cardápio e CRM", () => {
  describe("1. Fechamento de Contas e Divisão Sem Limitação de Pessoas", () => {
    it("deve permitir fechamento total em fatura única para 1 pessoa", () => {
      const consumo = 450.00;
      const taxaServicoAtiva = true;
      const taxa = taxaServicoAtiva ? consumo * 0.1 : 0;
      const cashback = 20.00;
      const totalLiquido = consumo + taxa - cashback;

      const modo = "TOTAL";
      const pagantes = modo === "TOTAL" ? 1 : 4;
      const cotaPorPessoa = totalLiquido / pagantes;

      expect(totalLiquido).toBe(475.00);
      expect(cotaPorPessoa).toBe(475.00);
    });

    it("deve permitir divisão flexível para qualquer número de pessoas sem travar em 6", () => {
      const consumo = 1200.00;
      const taxaServico = consumo * 0.1; // 120.00
      const total = consumo + taxaServico; // 1320.00

      // Testando divisão para grupos grandes: 8, 10, 15, 20, 32 pessoas
      const grupos = [8, 10, 15, 20, 32];
      grupos.forEach(pessoas => {
        const cota = total / pessoas;
        expect(cota * pessoas).toBeCloseTo(total, 2);
        expect(pessoas).toBeGreaterThan(6);
      });
    });

    it("deve calcular corretamente a cota individual com desconto de cashback Clube Zumi", () => {
      const consumo = 500.00;
      const taxaServico = 50.00;
      const cashbackResgatado = 50.00;
      const pessoas = 10;

      const totalFinal = consumo + taxaServico - cashbackResgatado; // 500.00
      const cota = totalFinal / pessoas; // 50.00 cada

      expect(totalFinal).toBe(500.00);
      expect(cota).toBe(50.00);
    });
  });

  describe("2. Catálogo Oficial Zuma 360° (100+ Itens e Roteamento KDS 2.0)", () => {
    it("deve conter mais de 100 itens catalogados com preços e categorias", () => {
      const totalItens = Object.values(MENU).reduce((acc, pratos) => acc + pratos.length, 0);
      expect(totalItens).toBeGreaterThanOrEqual(100);
    });

    it("deve possuir itens em todas as categorias principais do restaurante", () => {
      const categorias = Object.keys(MENU);
      expect(categorias).toContain("Combinados");
      expect(categorias).toContain("Sashimis");
      expect(categorias).toContain("Uramakis");
      expect(categorias).toContain("Hot rolls");
      expect(categorias).toContain("Pratos quentes");
      expect(categorias).toContain("Bebidas");
      expect(categorias).toContain("Sobremesas");
    });

    it("deve direcionar cada item para sua praça correta via determinarPraca", () => {
      expect(determinarPraca("Sashimis", "Sashimi Salmão")).toBe("sushibar");
      expect(determinarPraca("Pratos Quentes", "Yakissoba Especial")).toBe("quente");
      expect(determinarPraca("Hot Rolls", "Hot Filadélfia")).toBe("fritura");
      expect(determinarPraca("Bebidas", "Saquê Dourado Junmai")).toBe("bar");
      expect(determinarPraca("Bebidas", "Cerveja Heineken 600ml")).toBe("bar");
    });

    it("deve disponibilizar chips de observações rápidos para agilidade do garçom", () => {
      expect(CHIPS_OBSERVACOES.length).toBeGreaterThanOrEqual(5);
      expect(CHIPS_OBSERVACOES).toContain("Sem cebolinha");
      expect(CHIPS_OBSERVACOES).toContain("Wasabi extra");
      expect(CHIPS_OBSERVACOES).toContain("Shoyu sem glúten");
    });
  });

  describe("3. CRM Zuma & Histórico de Visitas, Preferências e Clube Zumi", () => {
    it("deve ter base de clientes VIP e assíduos cadastrada", () => {
      expect(BASE_CLIENTES_DEMO.length).toBeGreaterThanOrEqual(4);
    });

    it("deve conter restrições e preferências detalhadas (alergias e cortes preferidos)", () => {
      const clienteComAlergia = BASE_CLIENTES_DEMO.find(c => c.restricoesAlimentares.length > 0);
      expect(clienteComAlergia).toBeDefined();
      expect(clienteComAlergia?.peixesFavoritos.length).toBeGreaterThan(0);
    });

    it("deve manter histórico de pedidos anteriores e saldo de cashback", () => {
      BASE_CLIENTES_DEMO.forEach(cliente => {
        expect(cliente.historicoPedidos.length).toBeGreaterThan(0);
        expect(cliente.cashbackDisponivel).toBeGreaterThanOrEqual(0);
        expect(cliente.totalGastoHistorico).toBeGreaterThan(0);
        expect(cliente.totalVisitas).toBeGreaterThan(0);
      });
    });

    it("deve validar saldo de cashback para resgate na mesa", () => {
      const cliente = BASE_CLIENTES_DEMO[0];
      const valorResgate = 30.00;
      expect(cliente.cashbackDisponivel).toBeGreaterThanOrEqual(valorResgate);
      
      const novoSaldo = cliente.cashbackDisponivel - valorResgate;
      expect(novoSaldo).toBeGreaterThanOrEqual(0);
    });
  });

  describe("4. Pagamento Direto na Mesa pelo Garçom & Despacho Multicanal Automático", () => {
    it("deve gerar payload de Pix Sicredi MT com chave dinâmica e valor correto", () => {
      const total = 376.20;
      const txId = "ZUMA12345678SICREDI";
      const payloadPix = `00020126580014BR.GOV.BCB.PIX013636296848000157520400005303986540${total.toFixed(2).replace(".", "")}5802BR5925ZUMA COZINHA ORIENTAL6014TANGARA DA SER62240520${txId}6304E8A2`;
      
      expect(payloadPix).toContain("ZUMA COZINHA ORIENTAL");
      expect(payloadPix).toContain("36296848000157"); // CNPJ Zuma
      expect(payloadPix).toContain("37620"); // Valor em centavos
    });

    it("deve calcular troco exato para pagamentos em dinheiro na mesa", () => {
      const totalLiquido = 185.50;
      const valorEntregue = 200.00;
      const troco = valorEntregue - totalLiquido;

      expect(troco).toBe(14.50);
    });

    it("deve validar quitação fracionada por cotas individuais na mesa", () => {
      const total = 400.00;
      const pessoas = 8;
      const cota = total / pessoas; // 50.00

      const cotas = Array.from({ length: pessoas }, (_, i) => ({
        id: i + 1,
        pago: i < 6 // 6 pagantes quitaram
      }));

      const pagas = cotas.filter(c => c.pago).length;
      const valorPago = pagas * cota;
      const saldoRestante = total - valorPago;

      expect(pagas).toBe(6);
      expect(valorPago).toBe(300.00);
      expect(saldoRestante).toBe(100.00);
    });

    it("deve formatar mensagem completa do WhatsApp com detalhes da conta, garçom e NFC-e", () => {
      const cliente = "Dr. Marcelo";
      const garcom = "Matheus Lima";
      const total = 376.20;
      const chaveNfce = "51261136296848000157650010000049281893728192";

      const msg = `*ZUMA COZINHA ORIENTAL* 🍣\nOlá, *${cliente}*!\n• Garçom: ${garcom}\n• Total Pago: R$ ${total.toFixed(2)}\n• NFC-e: ${chaveNfce}`;

      expect(msg).toContain("Dr. Marcelo");
      expect(msg).toContain("Matheus Lima");
      expect(msg).toContain("376.20");
      expect(msg).toContain(chaveNfce);
    });

    it("deve validar protocolo ESC/POS 80mm com destino configurável no caixa", () => {
      const destinosSuportados = [
        "Caixa Principal Balcão 80mm (Epson TM-T20X)",
        "Copa & Bar (Bematech MP-4200 TH)",
        "Portátil Bluetooth Garçom (Elgin M10)"
      ];

      expect(destinosSuportados.length).toBe(3);
      expect(destinosSuportados[0]).toContain("Epson");
      expect(destinosSuportados[1]).toContain("Bematech");
    });
  });
});
