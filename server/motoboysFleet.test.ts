import { describe, it, expect } from "vitest";
import { dataStore } from "./dataStore";

describe("Gestão de Frota de Motoboys e Acerto de Turno Tangará da Serra", () => {
  it("deve listar motoboys iniciais cadastrados para Tangará da Serra", () => {
    const boys = dataStore.getMotoboys();
    expect(boys.length).toBeGreaterThanOrEqual(4);
    const tiago = boys.find(b => b.name.includes("Tiago"));
    expect(tiago).toBeDefined();
    expect(tiago?.plate).toContain("Honda Fan 160");
  });

  it("deve cadastrar um novo motoboy na frota", () => {
    const novo = dataStore.createMotoboy({
      name: "Rodrigo Piloto Tangará",
      phone: "(65) 99988-7766",
      plate: "MT-ZUM2026 (Honda Sahara 300)",
    });
    expect(novo.id).toBeDefined();
    expect(novo.status).toBe("disponivel");
    expect(novo.currentOrdersCount).toBe(0);

    const boys = dataStore.getMotoboys();
    expect(boys.some(b => b.id === novo.id)).toBe(true);
  });

  it("deve atualizar status e dados de um motoboy", () => {
    const boys = dataStore.getMotoboys();
    const boy = boys[0];
    const updated = dataStore.updateMotoboy(boy.id, {
      status: "pausa",
      phone: "(65) 99111-2233",
    });
    expect(updated?.status).toBe("pausa");
    expect(updated?.phone).toBe("(65) 99111-2233");
  });

  it("deve liquidar o turno de um motoboy zerando as taxas e marcando shiftSettled", () => {
    const boys = dataStore.getMotoboys();
    const boy = boys[0];
    boy.accumulatedDeliveryFees = 120.0;
    
    const result = dataStore.settleMotoboyShift(boy.id);
    expect(result.success).toBe(true);
    expect(result.settledAmount).toBe(120.0);
    expect(boy.accumulatedDeliveryFees).toBe(0);
    expect(boy.shiftSettled).toBe(true);
    expect(boy.status).toBe("disponivel");
  });
});
