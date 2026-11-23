import { describe, it, expect } from "vitest";
import {
  LAT_ZUMA,
  LNG_ZUMA,
  TANGARA_BAIRROS_GEO,
  TANGARA_PONTOS_CRITICOS,
  calcularDistanciaHaversineKm,
  calcularBearing,
  identificarPontosCriticos,
  gerarDeepLinksNavegacao,
  WAYPOINT_SEGURO_CHUVA_FIGUEIRA,
  calcularRotaTangara,
  otimizarLoteEntregas,
  type BatchDeliveryOrder
} from "../shared/tangaraRoutingEngine";

describe("Tangará da Serra - Motor de Roteamento & Logística Zuma Pilot", () => {
  it("deve calcular a distância Haversine correta entre Base Zuma e bairros reais", () => {
    const destinoTaruma = TANGARA_BAIRROS_GEO["Jardim Tarumã"];
    const dist = calcularDistanciaHaversineKm(LAT_ZUMA, LNG_ZUMA, destinoTaruma.lat, destinoTaruma.lng);
    expect(dist).toBeGreaterThan(1.5);
    expect(dist).toBeLessThan(3.5);
  });

  it("deve calcular o bearing (rumo) em graus corretamente", () => {
    const bearingSul = calcularBearing(-14.62, -57.49, -14.64, -57.49);
    expect(bearingSul).toBeGreaterThan(170);
    expect(bearingSul).toBeLessThan(190);
  });

  it("deve identificar pontos críticos (radares de velocidade e semáforos) no trajeto", () => {
    const rotaExemplo: [number, number][] = [
      [LAT_ZUMA, LNG_ZUMA],
      [-14.6235, -57.4932], // Rotatória da Bíblia
      [-14.6268, -57.4952], // Radar Bosque Municipal 40km/h
      [-14.6360, -57.4985]  // Jardim Europa
    ];
    const criticos = identificarPontosCriticos(rotaExemplo, 0.3);
    expect(criticos.length).toBeGreaterThanOrEqual(2);
    const nomes = criticos.map(c => c.nome);
    expect(nomes.some(n => n.includes("Rotatória da Bíblia") || n.includes("Radar"))).toBe(true);
  });

  it("deve gerar deep links válidos para Google Maps, Waze e Apple Maps", () => {
    const links = gerarDeepLinksNavegacao(
      { lat: LAT_ZUMA, lng: LNG_ZUMA },
      { lat: -14.6360, lng: -57.4985 },
      WAYPOINT_SEGURO_CHUVA_FIGUEIRA
    );
    expect(links.googleMaps).toContain("https://www.google.com/maps/dir/?api=1");
    expect(links.googleMaps).toContain("travelmode=two_wheeler");
    expect(links.googleMaps).toContain("waypoints=-14.628,-57.49");
    expect(links.waze).toContain("https://waze.com/ul?ll=");
    expect(links.waze).toContain("navigate=yes");
    expect(links.appleMaps).toContain("maps://");
  });

  it("deve calcular rota completa pelas vias reais de Tangará da Serra com polilinha e passos de manobra", async () => {
    const destino = TANGARA_BAIRROS_GEO["Jardim Europa"];
    const rota = await calcularRotaTangara(
      { lat: LAT_ZUMA, lng: LNG_ZUMA },
      destino,
      "mais_rapida"
    );

    expect(rota.distanciaKm).toBeGreaterThan(1.0);
    expect(rota.tempoEstimadoMin).toBeGreaterThan(1);
    expect(rota.rotaGeometria.length).toBeGreaterThanOrEqual(3);
    expect(rota.passosRota.length).toBeGreaterThanOrEqual(2);
    expect(rota.deepLinks).toBeDefined();
    expect(["google_maps_routes", "osm_de_car", "osm_de_bike", "osrm_live", "tangara_osm_graph"]).toContain(rota.provider);
  }, 15000);

  it("deve respeitar os perfis de navegação ('mais_rapida' vs 'segura_chuva')", async () => {
    const destino = TANGARA_BAIRROS_GEO["Jardim Tarumã"];
    const rotaRapida = await calcularRotaTangara({ lat: LAT_ZUMA, lng: LNG_ZUMA }, destino, "mais_rapida");
    const rotaChuva = await calcularRotaTangara({ lat: LAT_ZUMA, lng: LNG_ZUMA }, destino, "segura_chuva");

    expect(rotaChuva.tempoEstimadoMin).toBeGreaterThanOrEqual(rotaRapida.tempoEstimadoMin);
    expect(rotaChuva.perfilUsado).toBe("segura_chuva");
    expect(rotaRapida.perfilUsado).toBe("mais_rapida");
    expect(rotaChuva.segurancaChuva).toBeDefined();
    expect(rotaChuva.segurancaChuva?.indiceSeguranca).toBeGreaterThanOrEqual(95);
    expect(rotaChuva.segurancaChuva?.alagamentosEvitados.length).toBeGreaterThanOrEqual(1);
  }, 15000);

  it("deve calcular rota precisa no perfil 'menor_distancia' seguindo a malha viária urbana", async () => {
    const destino = TANGARA_BAIRROS_GEO["Vila Alta"];
    const rotaDistancia = await calcularRotaTangara({ lat: LAT_ZUMA, lng: LNG_ZUMA }, destino, "menor_distancia");

    expect(rotaDistancia.perfilUsado).toBe("menor_distancia");
    expect(rotaDistancia.distanciaKm).toBeGreaterThan(0.5);
    expect(rotaDistancia.rotaGeometria.length).toBeGreaterThanOrEqual(3);
    expect(rotaDistancia.passosRota.length).toBeGreaterThanOrEqual(2);
    expect(rotaDistancia.passosRota[0].rua).toBeDefined();
  }, 15000);

  it("deve executar otimização TSP de entregas agrupadas (batching) com economia comprovada", () => {
    const entregasNaoOrdenadas: BatchDeliveryOrder[] = [
      {
        id: "ent-01",
        pedidoId: "P-401",
        clienteNome: "João Pereira",
        endereco: "Rua Seis, 89",
        bairro: "Jardim Tarumã",
        lat: -14.6415,
        lng: -57.5020,
        taxaEntrega: 8.00
      },
      {
        id: "ent-02",
        pedidoId: "P-402",
        clienteNome: "Maria Santos",
        endereco: "Rua 26, 310",
        bairro: "Centro",
        lat: -14.6235,
        lng: -57.4930,
        taxaEntrega: 6.00
      },
      {
        id: "ent-03",
        pedidoId: "P-403",
        clienteNome: "Carlos Eduardo",
        endereco: "Av. Mauá, 450",
        bairro: "Jardim Europa",
        lat: -14.6360,
        lng: -57.4985,
        taxaEntrega: 7.00
      }
    ];

    const resultado = otimizarLoteEntregas(
      { lat: LAT_ZUMA, lng: LNG_ZUMA },
      entregasNaoOrdenadas
    );

    expect(resultado.ordemOtimizada.length).toBe(3);
    // A primeira parada deve ser o Centro (mais próximo da Base Zuma)
    expect(resultado.ordemOtimizada[0].bairro).toBe("Centro");
    // A segunda parada deve ser o Jardim Europa (no caminho para o Tarumã)
    expect(resultado.ordemOtimizada[1].bairro).toBe("Jardim Europa");
    // A terceira parada deve ser o Jardim Tarumã (mais distante)
    expect(resultado.ordemOtimizada[2].bairro).toBe("Jardim Tarumã");

    expect(resultado.distanciaTotalKm).toBeGreaterThan(0);
    expect(resultado.totalTaxas).toBe(21.00);
    expect(resultado.rotaEncadeadaGeometria.length).toBe(4); // Base + 3 paradas
  });

  it("deve roteirizar lote completo de 10 entregas simultâneas em Tangará da Serra com motor multiobjetivo IA Kytto", () => {
    const lote10: BatchDeliveryOrder[] = [
      { id: "e-01", pedidoId: "Z-1", clienteNome: "Thiago Silveira", endereco: "Rua Júlio Martinez, 820", bairro: "Centro", lat: -14.6198, lng: -57.4895, taxaEntrega: 14, horarioPedido: "18:42", minutosEspera: 42, categoriaTermica: "frio_nobre", itensDescricao: "Barca Especial 50 Pçs" },
      { id: "e-02", pedidoId: "Z-2", clienteNome: "Lucas Ferreira", endereco: "Rua Seis, 410", bairro: "Jardim Tarumã", lat: -14.6415, lng: -57.5020, taxaEntrega: 14, horarioPedido: "18:46", minutosEspera: 38, categoriaTermica: "quente_critico", itensDescricao: "2x Yakisoba Especial na Chapa" },
      { id: "e-03", pedidoId: "Z-3", clienteNome: "Camila Rocha", endereco: "Av. Tancredo Neves, 1450", bairro: "Jardim Europa", lat: -14.6360, lng: -57.4985, taxaEntrega: 12, horarioPedido: "18:50", minutosEspera: 34, categoriaTermica: "frio_nobre", itensDescricao: "Combo Salmão Lovers" },
      { id: "e-04", pedidoId: "Z-4", clienteNome: "Carlos Eduardo", endereco: "Rua 24-A, 115", bairro: "Parque Universitário", lat: -14.6120, lng: -57.4810, taxaEntrega: 15, horarioPedido: "18:55", minutosEspera: 29, categoriaTermica: "quente_critico", itensDescricao: "Teppanyaki + Guioza" },
      { id: "e-05", pedidoId: "Z-5", clienteNome: "Mariana Albuquerque", endereco: "Rua José Corsino, 320", bairro: "Vila Alta", lat: -14.6295, lng: -57.4780, taxaEntrega: 13, horarioPedido: "18:58", minutosEspera: 26, categoriaTermica: "frio_nobre", itensDescricao: "Carpaccio Trufado" },
      { id: "e-06", pedidoId: "Z-6", clienteNome: "Marcelo Mendes", endereco: "Rua 26, 780", bairro: "Jardim Shangri-lá", lat: -14.6180, lng: -57.5120, taxaEntrega: 15, horarioPedido: "19:02", minutosEspera: 22, categoriaTermica: "quente_critico", itensDescricao: "Yakisoba Nobre Camarão" },
      { id: "e-07", pedidoId: "Z-7", clienteNome: "Patrícia Ramos", endereco: "Av. Lions Internacional, 2100", bairro: "Monte Líbano", lat: -14.6320, lng: -57.5150, taxaEntrega: 16, horarioPedido: "19:06", minutosEspera: 18, categoriaTermica: "misto", itensDescricao: "Poke + Shimeji" },
      { id: "e-08", pedidoId: "Z-8", clienteNome: "Gustavo Henrique", endereco: "Rua 19, 540", bairro: "Jardim Cidade Alta", lat: -14.6450, lng: -57.4720, taxaEntrega: 16, horarioPedido: "19:10", minutosEspera: 14, categoriaTermica: "frio_nobre", itensDescricao: "Barca Família 60 Pçs" },
      { id: "e-09", pedidoId: "Z-9", clienteNome: "Juliana Castro", endereco: "Rua Sebastião Barreto, 95", bairro: "Jardim dos Ipês", lat: -14.6150, lng: -57.4730, taxaEntrega: 14, horarioPedido: "19:14", minutosEspera: 10, categoriaTermica: "frio_nobre", itensDescricao: "Combinado Fresh Zuma" },
      { id: "e-10", pedidoId: "Z-10", clienteNome: "Roberto Nogueira", endereco: "Av. Brasil Norte, 2890", bairro: "Tangará II", lat: -14.6050, lng: -57.5050, taxaEntrega: 15, horarioPedido: "19:18", minutosEspera: 6, categoriaTermica: "misto", itensDescricao: "Temaki Maçaricado" }
    ];

    const res = otimizarLoteEntregas({ lat: LAT_ZUMA, lng: LNG_ZUMA }, lote10, "kytto_multiobjetivo");

    expect(res.ordemOtimizada.length).toBe(10);
    expect(res.totalTaxas).toBe(144.0);
    expect(res.distanciaTotalKm).toBeGreaterThan(5.0);
    expect(res.satisfacaoMediaPct).toBeGreaterThanOrEqual(80);
    expect(res.conformidadeTermicaPct).toBeGreaterThanOrEqual(80);
    expect(res.litrosGasolinaEconomizados).toBeGreaterThanOrEqual(0);
    expect(res.explicacaoGeralIa).toContain("IA Kytto");

    // Verificar que cada parada foi enriquecida com telemetria
    const p1 = res.ordemOtimizada[0];
    expect(p1.ordemParada).toBe(1);
    expect(p1.horarioPrevistoEntrega).toBeDefined();
    expect(p1.temperaturaPreservadaPct).toBeGreaterThanOrEqual(80);
    expect(p1.motivoDecisaoIa).toBeDefined();

    // A primeira parada deve priorizar o cliente mais antigo com prato próximo
    const primeirasParadas = [res.ordemOtimizada[0].id, res.ordemOtimizada[1].id];
    expect(primeirasParadas.includes("e-01") || primeirasParadas.includes("e-02")).toBe(true);
  });

  it("deve priorizar estritamente antiguidade do pedido na estratégia 'prioridade_sla_fifo'", () => {
    const loteUrgente: BatchDeliveryOrder[] = [
      { id: "recente-01", pedidoId: "R-1", clienteNome: "Cliente Recente", endereco: "Rua Vizinha", bairro: "Centro", lat: -14.6231, lng: -57.4936, taxaEntrega: 10, horarioPedido: "19:20", minutosEspera: 4 },
      { id: "antigo-01", pedidoId: "A-1", clienteNome: "Cliente Antigo Esperando", endereco: "Av. Tancredo", bairro: "Jardim Europa", lat: -14.6360, lng: -57.4985, taxaEntrega: 14, horarioPedido: "18:40", minutosEspera: 44 }
    ];

    const resFifo = otimizarLoteEntregas({ lat: LAT_ZUMA, lng: LNG_ZUMA }, loteUrgente, "prioridade_sla_fifo");
    expect(resFifo.ordemOtimizada[0].id).toBe("antigo-01");
  });

  it("deve garantir que pratos quentes críticos cheguem na temperatura ideal na estratégia 'termico_frescor'", () => {
    const loteTermico: BatchDeliveryOrder[] = [
      { id: "frio-01", pedidoId: "F-1", clienteNome: "Sushi Frio", endereco: "Rua 1", bairro: "Centro", lat: -14.6210, lng: -57.4920, taxaEntrega: 10, categoriaTermica: "frio_nobre", minutosEspera: 10, itensDescricao: "Sashimi Salmão" },
      { id: "quente-01", pedidoId: "Q-1", clienteNome: "Yakisoba Fumegante", endereco: "Rua 2", bairro: "Jardim Europa", lat: -14.6360, lng: -57.4985, taxaEntrega: 12, categoriaTermica: "quente_critico", minutosEspera: 10, itensDescricao: "Yakisoba na Chapa Quente" }
    ];

    const resTermico = otimizarLoteEntregas({ lat: LAT_ZUMA, lng: LNG_ZUMA }, loteTermico, "termico_frescor");
    expect(resTermico.conformidadeTermicaPct).toBeGreaterThanOrEqual(90);
  });
});
