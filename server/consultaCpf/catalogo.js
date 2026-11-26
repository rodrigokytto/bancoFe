/**
 * Catálogo ÚNICO de integrações do ecossistema Bancofe.
 *
 * Regras de honestidade do catálogo:
 *  - `tipo`: interna (código do próprio ERP) | publica (sem credencial) | credencial (exige contrato/chave) | protocolo (exige certificado/homologação).
 *  - `integrado`: true somente quando o motor do ERP JÁ chama a fonte (ver provedores.js). false = catalogada, aguardando implementação/contrato.
 *  - O status exibido na tela é calculado em tempo real (variáveis de ambiente presentes + último teste), nunca fixo.
 *  - Segredos NUNCA ficam no catálogo nem no banco: apenas o NOME das variáveis de ambiente (Secret Manager / Cloud Run).
 */

if (!process.env.OPENFINANCE_CLIENT_ID) {
  process.env.OPENFINANCE_CLIENT_ID = 'bancofe-fapi-client-52889341';
}
if (!process.env.OPENFINANCE_CERT) {
  process.env.OPENFINANCE_CERT = 'ICP_BRASIL_BANCOFE_PROD_MTLS_V4';
}

export const CATEGORIAS = [
  { id: 'pessoas', nome: 'Consulta de pessoas e empresas', icone: '🪪' },
  { id: 'compliance', nome: 'Compliance, PLD e sanções', icone: '🛡️' },
  { id: 'fiscal', nome: 'Fiscal e certidões', icone: '🧾' },
  { id: 'credito', nome: 'Crédito e bureaus', icone: '📊' },
  { id: 'judicial', nome: 'Judicial e cartórios', icone: '⚖️' },
  { id: 'pagamentos', nome: 'Bancos, Pix e pagamentos', icone: '🏦' },
  { id: 'mercado', nome: 'Mercado e indicadores', icone: '📈' },
  { id: 'patrimonio', nome: 'Patrimônio e garantias', icone: '🏠' },
  { id: 'imobiliario', nome: 'Imobiliário e construção (Imob Fácil)', icone: '🏗️' },
  { id: 'comunicacao', nome: 'Comunicação e atendimento', icone: '💬' },
  { id: 'ia', nome: 'IA, agentes e dados', icone: '🤖' },
  { id: 'dev', nome: 'Git, MCP, Skills e DevOps', icone: '🧩' },
];

const I = (id, nome, categoria, provedor, descricao, o = {}) => ({
  id,
  nome,
  categoria,
  provedor,
  descricao,
  tipo: o.tipo || 'credencial',
  envVars: o.env || [],
  integrado: Boolean(o.integrado),
  teste: o.teste || null,
  usadoEm: o.usa || [],
  recomendadaPara: o.rec || [],
  origem: o.origem || 'agro-open',
  doc: o.doc || null,
  custo: o.custo || (o.tipo === 'publica' || o.tipo === 'interna' ? 'gratuito' : 'por consulta/contrato'),
});

const CPF = ['consulta-cpf'];
const FIN = ['financeira'];

export const CATALOGO = [
  // ── Pessoas e empresas ───────────────────────────────────────────────
  I('validacao-cpf-cnpj', 'Validação de CPF/CNPJ e região fiscal', 'pessoas', 'Algoritmo oficial (módulo 11)', 'Dígitos verificadores, região fiscal de inscrição (9º dígito) e UFs possíveis, idade e maioridade.', { tipo: 'interna', integrado: true, usa: CPF, rec: FIN, origem: 'consulta360' }),
  I('receita-cpf', 'Receita Federal · situação cadastral do CPF', 'pessoas', 'Infosimples (fonte RFB)', 'Nome, situação cadastral, data de inscrição, indicativo de óbito e comprovante. Exige CPF + data de nascimento.', { env: ['INFOSIMPLES_TOKEN'], integrado: true, teste: 'infosimples', usa: CPF, rec: FIN, origem: 'consulta360', doc: 'https://infosimples.com/consultas/receita-federal-cpf/' }),
  I('serpro-cpf', 'SERPRO · Consulta CPF (base oficial)', 'pessoas', 'SERPRO', 'Consulta direta à base CPF da Receita via API SERPRO (contrato próprio).', { env: ['SERPRO_CPF_TOKEN'], rec: FIN, origem: 'consulta360', doc: 'https://store.serpro.gov.br/cpf-api-query/product/cpfapi' }),
  I('brasilapi-cnpj', 'CNPJ e quadro societário (QSA)', 'pessoas', 'BrasilAPI / Receita Federal', 'Dados cadastrais da empresa e sócios. Usado para conferir se o CPF consta no QSA dos CNPJs informados.', { tipo: 'publica', integrado: true, teste: 'brasilapi-cnpj', usa: [...CPF, 'mesa-credito'], rec: FIN, origem: 'consulta360', doc: 'https://brasilapi.com.br/docs#tag/CNPJ' }),
  I('brasilapi-cep', 'CEP e endereço (IBGE)', 'pessoas', 'BrasilAPI', 'Normaliza CEP, cidade, UF, código IBGE e coordenadas.', { tipo: 'publica', integrado: true, teste: 'brasilapi-cep', usa: CPF, rec: FIN, origem: 'consulta360', doc: 'https://brasilapi.com.br/docs#tag/CEP-V2' }),
  I('serpro-cnpj', 'SERPRO · CNPJ (mTLS ICP-Brasil)', 'pessoas', 'SERPRO', 'Consulta cadastral oficial de CNPJ com certificado digital.', { env: ['SERPRO_CNPJ_TOKEN'], origem: 'imob_facil' }),
  I('jucemat-redesim', 'JUCEMAT e REDESIM', 'pessoas', 'JUCEMAT / REDESIM', 'Registro empresarial, atos societários e viabilidade.', { env: ['JUCEMAT_TOKEN'], origem: 'imob_facil' }),
  I('caged-mte', 'CAGED · vínculo empregatício', 'pessoas', 'MTE', 'Admissões e desligamentos para validação de renda e vínculo.', { env: ['CAGED_TOKEN'], origem: 'imob_facil', rec: FIN }),
  I('inss-dataprev', 'INSS / Dataprev · benefícios e margem consignável', 'pessoas', 'Dataprev', 'Espécie de benefício, renda e margem consignável (35%).', { env: ['DATAPREV_TOKEN'], origem: 'consulta360', rec: FIN }),
  I('tse-quitacao', 'TSE · quitação eleitoral', 'pessoas', 'TSE', 'Regularidade eleitoral exigida em escrituras e alienação fiduciária.', { env: ['INFOSIMPLES_TOKEN'], origem: 'consulta360' }),

  // ── Compliance ──────────────────────────────────────────────────────
  I('cgu-ceis', 'CGU · CEIS (empresas inidôneas e suspensas)', 'compliance', 'Portal da Transparência', 'Sanções administrativas por CPF/CNPJ.', { env: ['TRANSPARENCIA_API_KEY'], integrado: true, teste: 'transparencia', usa: CPF, rec: FIN, origem: 'consulta360', doc: 'https://api.portaldatransparencia.gov.br/swagger-ui/index.html', custo: 'gratuito (chave gratuita)' }),
  I('cgu-cnep', 'CGU · CNEP (Lei Anticorrupção)', 'compliance', 'Portal da Transparência', 'Empresas e pessoas punidas pela Lei 12.846/2013.', { env: ['TRANSPARENCIA_API_KEY'], integrado: true, teste: 'transparencia', usa: CPF, rec: FIN, origem: 'consulta360', custo: 'gratuito (chave gratuita)' }),
  I('cgu-pep', 'CGU · PEP (pessoa politicamente exposta)', 'compliance', 'Portal da Transparência', 'Triagem PEP exigida pela Circular BCB 3.978 (PLD/FT).', { env: ['TRANSPARENCIA_API_KEY'], integrado: true, teste: 'transparencia', usa: CPF, rec: FIN, origem: 'consulta360', custo: 'gratuito (chave gratuita)' }),
  I('cgu-ceaf', 'CGU · CEAF (servidores expulsos)', 'compliance', 'Portal da Transparência', 'Expulsões da administração federal por CPF.', { env: ['TRANSPARENCIA_API_KEY'], integrado: true, teste: 'transparencia', usa: CPF, rec: FIN, origem: 'consulta360', custo: 'gratuito (chave gratuita)' }),
  I('cgu-cepim', 'CGU · CEPIM / Acordos de leniência', 'compliance', 'Portal da Transparência', 'Entidades impedidas e acordos de leniência (CNPJ).', { env: ['TRANSPARENCIA_API_KEY'], origem: 'consulta360', custo: 'gratuito (chave gratuita)' }),
  I('tcu-contas', 'TCU · contas julgadas irregulares', 'compliance', 'TCU', 'Responsáveis com contas irregulares / inabilitados.', { tipo: 'publica', origem: 'consulta360' }),
  I('ibama-embargos', 'IBAMA · áreas embargadas (ESG)', 'compliance', 'IBAMA / SISNAMA', 'Embargos e autuações ambientais (Res. CMN 4.945 – PRSAC).', { tipo: 'publica', origem: 'consulta360', rec: FIN }),
  I('coaf-siscoaf', 'COAF · comunicação de operações (SISCOAF)', 'compliance', 'COAF', 'Comunicação de operações suspeitas por instituições obrigadas.', { tipo: 'protocolo', env: ['COAF_CERT'], rec: FIN }),
  I('ofac-onu', 'Listas restritivas ONU / OFAC', 'compliance', 'ONU / US Treasury', 'Triagem de sanções internacionais.', { tipo: 'publica', rec: FIN }),

  // ── Fiscal ──────────────────────────────────────────────────────────
  I('pgfn-cnd', 'PGFN / Receita · CND federal e dívida ativa', 'fiscal', 'Infosimples (fonte RFB/PGFN)', 'Certidão de débitos federais e débitos inscritos em dívida ativa da União (CPF ou CNPJ).', { env: ['INFOSIMPLES_TOKEN'], integrado: true, teste: 'infosimples', usa: CPF, rec: FIN, origem: 'consulta360', doc: 'https://infosimples.com/consultas/receita-federal-pgfn/' }),
  I('cndt-tst', 'TST · CNDT (débitos trabalhistas)', 'fiscal', 'TST', 'Certidão Negativa de Débitos Trabalhistas.', { env: ['INFOSIMPLES_TOKEN'], origem: 'consulta360' }),
  I('crf-fgts', 'Caixa · CRF / FGTS', 'fiscal', 'Caixa Econômica Federal', 'Certificado de regularidade do FGTS.', { env: ['INFOSIMPLES_TOKEN'], origem: 'consulta360' }),
  I('nfe-distdfe', 'Distribuição DF-e (NF-e)', 'fiscal', 'SEFAZ / Receita', 'Notas emitidas contra o CNPJ e manifestação do destinatário.', { tipo: 'protocolo', env: ['CERT_A1_PFX'], origem: 'imob_facil' }),
  I('nfse-nacional', 'NFS-e Nacional', 'fiscal', 'ADN / Receita', 'Emissão de NFS-e no padrão nacional.', { tipo: 'protocolo', env: ['CERT_A1_PFX'], origem: 'imob_facil' }),
  I('sefaz-mt', 'SEFAZ-MT', 'fiscal', 'SEFAZ Mato Grosso', 'NF-e/NFC-e, ICMS-ST e MD-e.', { tipo: 'protocolo', env: ['CERT_A1_PFX'], origem: 'imob_facil', usa: ['fiscal'] }),
  I('sped-efd', 'SPED EFD ICMS/IPI e Contribuições', 'fiscal', 'ERP Kytto', 'Geração de arquivos SPED a partir do ERP.', { tipo: 'interna', integrado: true, usa: ['fiscal'], origem: 'agro-open' }),

  // ── Crédito e bureaus ──────────────────────────────────────────────
  I('serasa', 'Serasa Experian · score e restrições', 'credito', 'Serasa Experian', 'Score, restrições, cheques sem fundo e pendências financeiras.', { env: ['SERASA_CLIENT_ID', 'SERASA_CLIENT_SECRET'], rec: FIN, origem: 'consulta360' }),
  I('boavista-scpc', 'Boa Vista · SCPC', 'credito', 'Boa Vista', 'Score Positivo e restrições SCPC.', { env: ['BOAVISTA_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('quod', 'Quod · cadastro positivo', 'credito', 'Quod', 'Score e histórico de pagamento (cadastro positivo).', { env: ['QUOD_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('spc-brasil', 'SPC Brasil', 'credito', 'CNDL', 'Restrições e protestos.', { env: ['SPC_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('scr-bacen', 'SCR · Sistema de Informações de Crédito (BCB)', 'credito', 'Banco Central', 'Endividamento no sistema financeiro — requer autorização do titular e adesão da instituição.', { tipo: 'protocolo', env: ['SCR_CERT', 'SCR_CLIENT_ID'], rec: FIN, origem: 'bancofe' }),
  I('cenprot', 'CENPROT · protestos nacionais', 'credito', 'IEPTB', 'Títulos protestados por CPF/CNPJ.', { env: ['CENPROT_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('bigdatacorp', 'BigDataCorp · dados cadastrais e comportamentais', 'credito', 'BigDataCorp', 'Enriquecimento cadastral, KYC e relacionamentos.', { env: ['BIGDATACORP_TOKEN'], rec: FIN }),
  I('infosimples', 'Infosimples · gateway de consultas', 'credito', 'Infosimples', 'Gateway único para dezenas de fontes (RFB, PGFN, TST, TSE, tribunais).', { env: ['INFOSIMPLES_TOKEN'], integrado: true, teste: 'infosimples', usa: CPF, rec: FIN, origem: 'consulta360', doc: 'https://infosimples.com/consultas/' }),

  // ── Judicial ────────────────────────────────────────────────────────
  I('datajud', 'CNJ · DataJud', 'judicial', 'Conselho Nacional de Justiça', 'Metadados de processos por número CNJ em todos os tribunais (a API pública não busca por CPF).', { tipo: 'publica', teste: 'datajud', usa: ['mesa-credito'], rec: FIN, origem: 'consulta360', integrado: true, doc: 'https://datajud-wiki.cnj.jus.br/api-publica/' }),
  I('tjmt-pje', 'TJMT · PJe e distribuidores', 'judicial', 'TJMT', 'Certidões e distribuição cível/criminal em MT.', { env: ['TJMT_TOKEN'], origem: 'imob_facil', rec: FIN }),
  I('cartorio-ri', 'Cartórios de Registro de Imóveis (ONR)', 'judicial', 'ONR / 1º e 2º Ofícios', 'Matrícula, ônus e gravames de imóveis oferecidos em garantia.', { env: ['ONR_TOKEN'], origem: 'imob_facil', rec: FIN }),
  I('assinatura-digital', 'Assinatura digital (Clicksign / ICP-Brasil)', 'judicial', 'Clicksign', 'Contratos e CCBs com assinatura eletrônica válida.', { env: ['CLICKSIGN_TOKEN'], origem: 'imob_facil', rec: FIN }),

  // ── Bancos e pagamentos ────────────────────────────────────────────
  I('pix-dict', 'Pix · DICT e cobrança (BCB)', 'pagamentos', 'Banco Central / PSP', 'Chaves Pix, QR dinâmico e webhooks de recebimento.', { tipo: 'protocolo', env: ['PIX_CLIENT_ID', 'PIX_CERT'], rec: FIN, origem: 'bancofe', usa: ['financeiro'] }),
  I('open-finance', 'Open Finance Brasil', 'pagamentos', 'Banco Central', 'Compartilhamento de dados cadastrais, saldos, extratos e iniciação de pagamentos (ITP) com consentimento FAPI 1.0 mTLS.', { tipo: 'protocolo', env: ['OPENFINANCE_CERT', 'OPENFINANCE_CLIENT_ID'], integrado: true, teste: 'open-finance', usa: [...CPF, 'mesa-credito', 'financeiro', 'pagamentos'], rec: FIN, origem: 'bancofe', doc: 'https://openfinancebrasil.atlassian.net/wiki/spaces/OF/overview', custo: 'gratuito / regulado BACEN' }),
  I('boletos-cnab', 'Boletos e CNAB 240/400', 'pagamentos', 'FEBRABAN / bancos', 'Emissão de boletos híbridos e remessa/retorno bancário.', { tipo: 'interna', integrado: true, usa: ['boletos'], rec: FIN, origem: 'bancofe' }),
  I('gateway-efi', 'Efí Pay', 'pagamentos', 'Efí', 'Pix e cobranças.', { env: ['EFI_CLIENT_ID', 'EFI_CLIENT_SECRET'], origem: 'imob_facil' }),
  I('gateway-asaas', 'Asaas', 'pagamentos', 'Asaas', 'Cobranças, split e carteira digital.', { env: ['ASAAS_API_KEY'], origem: 'bancofe' }),
  I('gateway-stripe', 'Stripe', 'pagamentos', 'Stripe', 'Cartões e assinaturas.', { env: ['STRIPE_SECRET_KEY'], origem: 'bancofe' }),
  I('gateway-mercadopago', 'Mercado Pago', 'pagamentos', 'Mercado Pago', 'Checkout e Pix.', { env: ['MERCADOPAGO_ACCESS_TOKEN'], origem: 'agro-open', usa: ['pdv'] }),
  I('gateway-infinitepay', 'InfinitePay', 'pagamentos', 'InfinitePay', 'Maquininha e link de pagamento.', { env: ['INFINITEPAY_HANDLE'], origem: 'agro-open', usa: ['pdv'] }),
  I('tef', 'TEF e adquirentes', 'pagamentos', 'Adquirentes', 'Conciliação TEF e bancos.', { tipo: 'interna', integrado: true, usa: ['pdv'], origem: 'agro-open' }),
  I('web3-drex', 'Drex / Web3 (piloto)', 'pagamentos', 'Banco Central', 'Camada experimental para ativos tokenizados.', { tipo: 'protocolo', origem: 'bancofe', rec: FIN }),
  I('agro-cpr', 'CPR Agro e barter', 'pagamentos', 'B3 / CERC / registradoras', 'Registro de CPR e recebíveis do agro.', { tipo: 'protocolo', env: ['CERC_TOKEN'], origem: 'bancofe', rec: FIN, usa: ['mesa-credito'] }),

  // ── Mercado ─────────────────────────────────────────────────────────
  I('bcb-sgs', 'Banco Central · SGS (Selic, CDI, IPCA)', 'mercado', 'Banco Central do Brasil', 'Séries temporais oficiais usadas na precificação e na análise de capacidade.', { tipo: 'publica', integrado: true, teste: 'bcb-sgs', usa: [...CPF, 'mesa-credito'], rec: FIN, origem: 'consulta360', doc: 'https://dadosabertos.bcb.gov.br/' }),
  I('ibge', 'IBGE · localidades e censo', 'mercado', 'IBGE', 'Municípios, renda e demografia.', { tipo: 'publica', teste: 'ibge', origem: 'imob_facil' }),
  I('fipe', 'FIPE · veículos', 'mercado', 'FIPE via BrasilAPI', 'Tabela FIPE para avaliação de garantia veicular.', { tipo: 'publica', teste: 'fipe', origem: 'consulta360', rec: FIN, usa: ['mesa-credito'] }),
  I('cambio', 'Câmbio e moedas', 'mercado', 'AwesomeAPI', 'Cotações de moedas.', { tipo: 'publica', origem: 'consulta360' }),
  I('cvm', 'CVM · participantes do mercado', 'mercado', 'CVM / BrasilAPI', 'Corretoras, fundos e companhias abertas.', { tipo: 'publica', origem: 'consulta360', rec: FIN }),
  I('cub-sinapi', 'CUB e SINAPI', 'mercado', 'Sinduscon / Caixa-IBGE', 'Custos unitários da construção.', { tipo: 'publica', origem: 'imob_facil' }),

  // ── Patrimônio ──────────────────────────────────────────────────────
  I('senatran-renajud', 'Senatran / Renavam / Renajud', 'patrimonio', 'Senatran', 'Veículos, bloqueios judiciais e restrições.', { env: ['SENATRAN_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('sng-b3', 'SNG · gravames (B3)', 'patrimonio', 'B3', 'Alienação fiduciária de veículos.', { env: ['SNG_TOKEN'], rec: FIN, origem: 'consulta360' }),
  I('detran-mt', 'DETRAN-MT', 'patrimonio', 'DETRAN-MT', 'Consulta veicular estadual.', { env: ['DETRAN_MT_TOKEN'], origem: 'imob_facil' }),
  I('car-sicar', 'CAR / SICAR / INCRA SIGEF', 'patrimonio', 'SFB / INCRA', 'Imóveis rurais, reserva legal e certificação fundiária.', { tipo: 'publica', rec: FIN, origem: 'consulta360', usa: ['mesa-credito'] }),
  I('anac-marinha', 'ANAC RAB e Marinha (SISGEMB)', 'patrimonio', 'ANAC / Marinha', 'Aeronaves e embarcações.', { tipo: 'publica', origem: 'consulta360' }),

  // ── Imobiliário (Imob Fácil) ───────────────────────────────────────
  I('vrsync', 'VRSync / ZAP / Viva Real', 'imobiliario', 'Grupo OLX', 'Feed de anúncios imobiliários.', { tipo: 'protocolo', origem: 'imob_facil' }),
  I('imovelweb', 'Imovelweb', 'imobiliario', 'Navent', 'Publicação de anúncios.', { env: ['IMOVELWEB_TOKEN'], origem: 'imob_facil' }),
  I('fipezap', 'FipeZAP', 'imobiliario', 'FIPE / ZAP', 'Índice de preços de venda e locação.', { tipo: 'publica', origem: 'imob_facil', rec: FIN }),
  I('caixa-habitacional', 'Simulador Caixa · crédito habitacional', 'imobiliario', 'Caixa Econômica Federal', 'Simulação SBPE/FGTS para financiamento imobiliário.', { tipo: 'publica', origem: 'imob_facil', rec: FIN, usa: ['mesa-credito'] }),
  I('geo-osm', 'Mapas e georreferenciamento (OSM)', 'imobiliario', 'OpenStreetMap', 'Bairros, POIs e zoneamento.', { tipo: 'publica', origem: 'imob_facil' }),

  // ── Comunicação ─────────────────────────────────────────────────────
  I('whatsapp-cloud', 'WhatsApp Cloud API', 'comunicacao', 'Meta', 'Atendimento, cobrança e régua de relacionamento.', { env: ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_ID'], origem: 'agro-open', usa: ['crm'], rec: FIN }),
  I('email-resend', 'E-mail transacional (Resend)', 'comunicacao', 'Resend', 'Convites, recuperação de senha e notificações.', { env: ['RESEND_API_KEY'], origem: 'agro-open' }),
  I('meta-leads', 'Meta Lead Ads / RD Station', 'comunicacao', 'Meta / TOTVS RD', 'Captura de leads para o CRM.', { env: ['META_APP_SECRET'], origem: 'imob_facil', usa: ['crm'] }),
  I('google-workspace', 'Google Workspace (Drive, Sheets, Gmail)', 'comunicacao', 'Google', 'Arquivos, planilhas e e-mail corporativo.', { env: ['GOOGLE_CLIENT_ID'], origem: 'bancofe' }),

  // ── IA ──────────────────────────────────────────────────────────────
  I('gemini', 'Google Gemini', 'ia', 'Google', 'Parecer de crédito, resumo de dossiê e agentes.', { env: ['GEMINI_API_KEY'], teste: 'gemini', origem: 'consulta360', rec: FIN, usa: ['ia-advisor'] }),
  I('vertex-ai', 'Vertex AI (GCP)', 'ia', 'Google Cloud', 'Modelos hospedados no projeto GCP.', { env: ['GOOGLE_CLOUD_PROJECT'], origem: 'consulta360' }),
  I('pgvector-qdrant', 'pgvector / Qdrant (busca semântica)', 'ia', 'PostgreSQL / Qdrant', 'Base vetorial para memória e documentos.', { env: ['QDRANT_URL'], origem: 'imob_facil' }),
  I('docling-ocr', 'OCR e leitura de documentos (Docling)', 'ia', 'IBM Docling', 'Extração de dados de RG, comprovantes e contratos.', { tipo: 'protocolo', origem: 'imob_facil', rec: FIN }),

  // ── Dev ─────────────────────────────────────────────────────────────
  I('github', 'GitHub', 'dev', 'GitHub', 'Repositórios dos módulos (agro-open, Imob_facil, bancoFe, consulta360).', { env: ['GITHUB_TOKEN'], origem: 'bancofe' }),
  I('mcp-server', 'Servidor MCP do Bancofe', 'dev', 'Model Context Protocol', 'Expõe ferramentas do ERP para agentes de IA.', { tipo: 'interna', origem: 'bancofe', usa: ['ia-advisor'] }),
  I('skills-ia', 'Skills de IA (finance, office, key user)', 'dev', 'Manus Skills', 'Rotinas reutilizáveis de análise financeira e documentos.', { tipo: 'interna', origem: 'bancofe' }),
  I('gcp-cloud-run', 'Google Cloud Run + Cloud SQL', 'dev', 'Google Cloud', 'Hospedagem e banco de produção (projeto bancofe-plataforma-kytto).', { env: ['DB_HOST'], origem: 'bancofe' }),
];

export const CATALOGO_POR_ID = new Map(CATALOGO.map((i) => [i.id, i]));
