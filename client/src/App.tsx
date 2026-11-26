import TabelaEntregasTangara from "./pages/TabelaEntregasTangara";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BusinessProvider } from "./contexts/BusinessContext";
import { AppLayout } from "./components/shell/AppLayout";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/LoginPage";

// As Páginas Modulares do Zuma Pilot & BancoFe
import { Cockpit } from "./pages/Cockpit";
import { LojaNova } from "./pages/LojaNova";
import { ZumaModaRoupas } from "./pages/ZumaModaRoupas";
import { WhatsAppZumi } from "./pages/WhatsAppZumi";
import { AdminWaha } from "./pages/AdminWaha";
import { AdminModulosPage } from "./pages/AdminModulosPage";
import { CrmFinanceiraPage } from "./pages/CrmFinanceiraPage";
import Cadastro360BancoFePage from "./pages/Cadastro360BancoFePage";
import { EngenhariaCardapio } from "./pages/EngenhariaCardapio";
import { Reputacao } from "./pages/Reputacao";
import { Campanhas } from "./pages/Campanhas";
import { CaptacaoLeads } from "./pages/CaptacaoLeads";
import { HorariosVazios } from "./pages/HorariosVazios";
import { CapacidadeLotacao } from "./pages/CapacidadeLotacao";
import { ClubeZumi } from "./pages/ClubeZumi";
import { BaseClientes } from "./pages/BaseClientes";
import { RecuperacaoClientes } from "./pages/RecuperacaoClientes";
import { ReservasFila } from "./pages/ReservasFila";
import { PdvCaixa } from "./pages/PdvCaixa";
import { CozinhaKds } from "./pages/CozinhaKds";
import { EstoqueInsumos } from "./pages/EstoqueInsumos";
import { FiscalNotas } from "./pages/FiscalNotas";
import { FinanceiroDre } from "./pages/FinanceiroDre";
import { MercadoBenchmark } from "./pages/MercadoBenchmark";
import { Integracoes } from "./pages/Integracoes";
import { AtendimentoCockpit } from "./pages/AtendimentoCockpit";

// Novos Módulos de Produção Especializados & Alta Demanda
import { AppEntregador } from "./pages/AppEntregador";
import { AppGarcom } from "./pages/AppGarcom";
import { CentralApps } from "./pages/CentralApps";
import { Operacao360 } from "./pages/Operacao360";
import { CockpitProprietario } from "./pages/CockpitProprietario";
import { ZumaAgro } from "./pages/ZumaAgro";
import { MonteBarca } from "./pages/MonteBarca";
import { AppPagamentos } from "./pages/AppPagamentos";
import { HubConexoes } from "./pages/HubConexoes";
import { MapaCalor } from "./pages/MapaCalor";
import { ErpMaster } from "./pages/ErpMaster";
import { AppMesaCliente } from "./pages/AppMesaCliente";
import { CozinhaKds2 } from "./pages/CozinhaKds2";
import { TelemetriaIot } from "./pages/TelemetriaIot";
import { PrevisaoComprasSalmao } from "./pages/PrevisaoComprasSalmao";
import { FechamentoContabilMensal } from "./pages/FechamentoContabilMensal";
import { ComparativoSaipos } from "./pages/ComparativoSaipos";
import { UltraVisionAi } from "./pages/UltraVisionAi";
import { DrClimaSimulador } from "./pages/DrClimaSimulador";
import { Ultra } from "./pages/Ultra";
import { NossaGenteRh } from "./pages/NossaGenteRh";
import { PassaporteSalmaoPublico } from "./pages/PassaporteSalmaoPublico";
import { MapaMesasSalao } from "./pages/MapaMesasSalao";
import { BancoFeHub } from "./pages/BancoFeHub";
import ConsultaCpfPage from "./pages/hub/ConsultaCpfPage";
import IntegracoesHubPage from "./pages/hub/IntegracoesHubPage";
import { EcommerceAdminPage } from "./pages/EcommerceAdminPage";
import PortalClientePage from "./pages/PortalClientePage";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff6b4a] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-mono tracking-wider">Verificando credenciais BancoFe...</span>
        </div>
      </div>
    );
  }

  // Rota explícita de login
  if (location === "/login") {
    return <LoginPage />;
  }

  // Rotas públicas e institucionais que não bloqueiam navegação direta
  const isPublicClientRoute = 
    location === "/loja" || 
    location === "/entregador" || 
    location === "/" ||
    location === "/bancofe" ||
    location === "/cockpit" ||
    location === "/pdv" ||
    location === "/caixa" ||
    location === "/mesas" ||
    location === "/mesa" ||
    location === "/cozinha" ||
    location === "/erp" ||
    location === "/zumi" ||
    location === "/suprimentos" ||
    location === "/estoque" ||
    location === "/financeiro" ||
    location === "/fiscal" ||
    location === "/fechamento-contabil" ||
    location === "/nossa-gente" ||
    location === "/patrimonio" ||
    location === "/integracoes" ||
    location === "/conexoes" ||
    location === "/apps" ||
    location === "/telemetria" ||
    location === "/moda" ||
    location === "/roupas" ||
    location === "/agro" ||
    location.startsWith("/garcom") || 
    location.startsWith("/kds") || 
    location.startsWith("/kds-v2") || 
    location.startsWith("/mesa") || 
    location.startsWith("/cardapio-mesa") || 
    location.startsWith("/passaporte-salmao") ||
    location.startsWith("/admin") ||
    location.startsWith("/administracao") ||
    location.startsWith("/bancofe") ||
    location.startsWith("/consulta") ||
    location.startsWith("/ecommerce") ||
    location.startsWith("/operacoes") ||
    location.startsWith("/crm-financeira") ||
    location.startsWith("/pre-cadastro") ||
    location.startsWith("/precadastro") ||
    location.startsWith("/cadastro") ||
    location.startsWith("/termos") ||
    location.startsWith("/documentos") ||
    location.startsWith("/portal") ||
    location.startsWith("/minha-conta") ||
    location.startsWith("/gestao-emprestimos") ||
    location.startsWith("/fechamento") ||
    location.startsWith("/mesa-credito") ||
    location.startsWith("/credito") ||
    location.startsWith("/operacoes-financeiras") ||
    location.startsWith("/investimentos");

  if (!isAuthenticated && !isPublicClientRoute) {
    return <LoginPage />;
  }

  return (
    <Switch>
      {/* Rota explícita de Login */}
      <Route path="/login" component={LoginPage} />

      {/* Auto-Atendimento do Cliente na Mesa (QR Code Mobile First) */}
      <Route path="/mesa" component={AppMesaCliente} />
      <Route path="/mesa/:id" component={AppMesaCliente} />
      <Route path="/cardapio-mesa" component={AppMesaCliente} />

      {/* Passaporte do Salmão Público (Acesso via QR Code nas barcas e mesas) */}
      <Route path="/passaporte-salmao" component={PassaporteSalmaoPublico} />
      <Route path="/passaporte-salmao/:lote" component={PassaporteSalmaoPublico} />

      {/* App do Entregador Mobile First PWA (Full-screen sem sidebar para pilotos) */}
      <Route path="/entregador" component={AppEntregador} />

      {/* App do Garçom Mobile First (Full-screen sem sidebar no celular/tablet) */}
      <Route path="/garcom" component={AppGarcom} />

      {/* KDS Cozinha 2.0 Fire-on-Demand (Full-screen para monitores/TVs da cozinha) */}
      <Route path="/kds-v2" component={CozinhaKds2} />
      <Route path="/kds" component={CozinhaKds} />

      {/* Cockpit de Atendimento Dedicado em Janela Separada */}
      <Route path="/atendimento" component={AtendimentoCockpit} />
      <Route path="/zumi/cockpit" component={AtendimentoCockpit} />

      {/* Aplicação Principal com Layout e Menu Lateral */}
      <Route>
        <AppLayout>
          <Switch>
            {/* E-Commerce & Omnichannel Holding */}
            <Route path="/admin/ecommerce" component={EcommerceAdminPage} />
            <Route path="/admin/e-commerce" component={EcommerceAdminPage} />
            <Route path="/admin/lojas" component={EcommerceAdminPage} />
            <Route path="/admin/catalogo" component={EcommerceAdminPage} />
            <Route path="/admin/pedidos" component={EcommerceAdminPage} />
            <Route path="/ecommerce" component={EcommerceAdminPage} />

            {/* Atalhos Rápidos Contabilidade, Fechamento e Termos (Prevenção 404) */}
            <Route path="/admin/cont" component={FechamentoContabilMensal} />
            <Route path="/admin/contabilidade" component={FechamentoContabilMensal} />
            <Route path="/admin/fech" component={FechamentoContabilMensal} />
            <Route path="/admin/fechamento" component={FechamentoContabilMensal} />
            <Route path="/admin/term" component={Cadastro360BancoFePage} />
            <Route path="/admin/termos" component={Cadastro360BancoFePage} />
            <Route path="/termos" component={Cadastro360BancoFePage} />
            <Route path="/documentos" component={Cadastro360BancoFePage} />

            {/* Administração de Módulos por Negócio (BancoFe) */}
            <Route path="/admin" component={AdminModulosPage} />
            <Route path="/admin/modulos" component={AdminModulosPage} />
            <Route path="/administracao" component={AdminModulosPage} />
            <Route path="/administracao/modulos" component={AdminModulosPage} />
            <Route path="/admin-modulos" component={AdminModulosPage} />
            <Route path="/admin/empresas" component={AdminModulosPage} />
            <Route path="/empresas" component={AdminModulosPage} />
            {/* BancoFe — Mesa de Crédito (5 Etapas & Rating AAA) & Operações Financeiras */}
            <Route path="/admin/mesa-credito" component={CrmFinanceiraPage} />
            <Route path="/admin/credito" component={CrmFinanceiraPage} />
            <Route path="/mesa-credito" component={CrmFinanceiraPage} />
            <Route path="/credito" component={CrmFinanceiraPage} />
            <Route path="/admin/mesa-operacoes" component={CrmFinanceiraPage} />
            <Route path="/mesa-operacoes" component={CrmFinanceiraPage} />
            <Route path="/admin/investimentos" component={CrmFinanceiraPage} />
            <Route path="/investimentos" component={CrmFinanceiraPage} />
            <Route path="/admin/barramento" component={Integracoes} />
            <Route path="/barramento" component={Integracoes} />

            {/* BancoFe — Operações Financeiras & CRM 360° */}
            <Route path="/admin/operacoes" component={CrmFinanceiraPage} />
            <Route path="/admin/crm-financeira" component={CrmFinanceiraPage} />
            <Route path="/admin/operacoes-financeiras" component={CrmFinanceiraPage} />
            <Route path="/admin/mesa-operacoes" component={CrmFinanceiraPage} />
            <Route path="/admin/mesa-credito" component={CrmFinanceiraPage} />
            <Route path="/admin/mesa" component={CrmFinanceiraPage} />
            <Route path="/mesa-operacoes" component={CrmFinanceiraPage} />
            <Route path="/mesa-credito" component={CrmFinanceiraPage} />
            <Route path="/operacoes" component={CrmFinanceiraPage} />
            <Route path="/crm-financeira" component={CrmFinanceiraPage} />
            <Route path="/operacoes-financeiras" component={CrmFinanceiraPage} />
            <Route path="/admin/gestao-emprestimos" component={CrmFinanceiraPage} />
            <Route path="/gestao-emprestimos" component={CrmFinanceiraPage} />

            {/* BancoFe — Portal do Cliente (Autoatendimento, Pix, Boletos & Quitação) */}
            <Route path="/portal/cliente" component={PortalClientePage} />
            <Route path="/portal/autoatendimento" component={PortalClientePage} />
            <Route path="/portal-cliente" component={PortalClientePage} />
            <Route path="/portal" component={PortalClientePage} />
            <Route path="/minha-conta" component={PortalClientePage} />
            <Route path="/admin/portal-cliente" component={PortalClientePage} />

            {/* BancoFe — Cadastro 360°, Pré-Cadastro & Central de Termos */}
            <Route path="/admin/cadastro-360" component={Cadastro360BancoFePage} />
            <Route path="/admin/pre-cadastro" component={Cadastro360BancoFePage} />
            <Route path="/admin/precadastro" component={Cadastro360BancoFePage} />
            <Route path="/plataforma/precadastro" component={Cadastro360BancoFePage} />
            <Route path="/plataforma/clientes-potenciais" component={Cadastro360BancoFePage} />
            <Route path="/admin/documentos" component={Cadastro360BancoFePage} />
            <Route path="/admin/termos" component={Cadastro360BancoFePage} />
            <Route path="/cadastro-360" component={Cadastro360BancoFePage} />
            <Route path="/pre-cadastro" component={Cadastro360BancoFePage} />
            <Route path="/precadastro" component={Cadastro360BancoFePage} />
            <Route path="/cadastro360" component={Cadastro360BancoFePage} />
            <Route path="/documentos" component={Cadastro360BancoFePage} />
            <Route path="/termos" component={Cadastro360BancoFePage} />

            {/* Consulta CPF completa (dossiê com 10 abas) e Módulo Único de Integrações */}
            <Route path="/consulta-cpf" component={ConsultaCpfPage} />
            <Route path="/admin/consulta-cpf" component={ConsultaCpfPage} />
            <Route path="/plataforma/consulta-cpf" component={ConsultaCpfPage} />
            <Route path="/admin/hub-integracoes" component={IntegracoesHubPage} />
            <Route path="/hub-integracoes" component={IntegracoesHubPage} />
            <Route path="/admin/integracoes-hub" component={IntegracoesHubPage} />
            <Route path="/admin/integracoes-corporativas" component={IntegracoesHubPage} />
            <Route path="/admin/open-finance" component={IntegracoesHubPage} />
            <Route path="/open-finance" component={IntegracoesHubPage} />
            <Route path="/openfinance" component={IntegracoesHubPage} />
            <Route path="/admin/openfinance" component={IntegracoesHubPage} />
            {/* Consulta 360° CPF & CNPJ Completa */}
            <Route path="/consulta-360" component={BancoFeHub} />
            <Route path="/consulta360" component={BancoFeHub} />
            <Route path="/consulta-cnpj" component={BancoFeHub} />
            <Route path="/admin/consulta-360" component={BancoFeHub} />
            <Route path="/admin/consulta-cnpj" component={BancoFeHub} />

            {/* Vendas & Apps */}
            <Route path="/" component={Cockpit} />
            <Route path="/cockpit" component={Cockpit} />
            <Route path="/proprietario" component={CockpitProprietario} />
            <Route path="/mapa-de-calor" component={MapaCalor} />
            <Route path="/mapa-calor" component={MapaCalor} />
            <Route path="/heatmap" component={MapaCalor} />
            <Route path="/previsao-compras" component={PrevisaoComprasSalmao} />
            <Route path="/previsao-compras-salmao" component={PrevisaoComprasSalmao} />
            <Route path="/motor-compras" component={PrevisaoComprasSalmao} />
            <Route path="/ultra" component={Ultra} />
            <Route path="/passaporte-salmao" component={PassaporteSalmaoPublico} />
            <Route path="/mesas" component={MapaMesasSalao} />
            <Route path="/mapa-mesas" component={MapaMesasSalao} />
            <Route path="/salao" component={MapaMesasSalao} />
            <Route path="/salao-360" component={MapaMesasSalao} />
            <Route path="/operacao" component={Operacao360} />
            <Route path="/entregador" component={AppEntregador} />
            <Route path="/tabela-entregas" component={TabelaEntregasTangara} />
            <Route path="/entregas" component={TabelaEntregasTangara} />
            <Route path="/ceps-tangara" component={TabelaEntregasTangara} />
            <Route path="/taxas-entrega" component={TabelaEntregasTangara} />
            <Route path="/garcom" component={AppGarcom} />
            <Route path="/apps" component={CentralApps} />
            <Route path="/pagamentos" component={AppPagamentos} />
            <Route path="/pagamentos.html" component={AppPagamentos} />
            <Route path="/conexoes" component={HubConexoes} />
            <Route path="/hub-conexoes" component={HubConexoes} />
            <Route path="/loja" component={LojaNova} />
            <Route path="/barca" component={MonteBarca} />
            <Route path="/agro" component={ZumaAgro} />
            <Route path="/zumi" component={WhatsAppZumi} />
            <Route path="/admin/waha" component={AdminWaha} />
            <Route path="/waha" component={AdminWaha} />
            <Route path="/administracao-whats" component={AdminWaha} />
            <Route path="/admin/whatsapp" component={AdminWaha} />
            <Route path="/administracao/whats" component={AdminWaha} />
            <Route path="/cardapio" component={EngenhariaCardapio} />
            <Route path="/reputacao" component={Reputacao} />
            <Route path="/campanhas" component={Campanhas} />
            <Route path="/leads" component={CaptacaoLeads} />
            <Route path="/horarios" component={HorariosVazios} />
            <Route path="/capacidade" component={CapacidadeLotacao} />
            <Route path="/clube" component={ClubeZumi} />

            {/* Clientes */}
            <Route path="/clientes" component={BaseClientes} />
            <Route path="/recuperacao" component={RecuperacaoClientes} />
            <Route path="/reservas" component={ReservasFila} />

            {/* ERP */}
            <Route path="/erp" component={ErpMaster} />
            <Route path="/erp-master" component={ErpMaster} />
            <Route path="/erp-360" component={ErpMaster} />
            <Route path="/erpmaster" component={ErpMaster} />
            <Route path="/patrimonio" component={ErpMaster} />
            <Route path="/suprimentos" component={ErpMaster} />
            <Route path="/compras" component={ErpMaster} />
            <Route path="/fechamento-contabil" component={FechamentoContabilMensal} />
            <Route path="/pacote-fiscal" component={FechamentoContabilMensal} />
            <Route path="/telemetria" component={TelemetriaIot} />
            <Route path="/telemetria-iot" component={TelemetriaIot} />
            <Route path="/iot" component={TelemetriaIot} />
            <Route path="/kds-v2" component={CozinhaKds2} />
            <Route path="/kds-2" component={CozinhaKds2} />
            <Route path="/pdv" component={PdvCaixa} />
            <Route path="/caixa" component={PdvCaixa} />
            <Route path="/moda" component={ZumaModaRoupas} />
            <Route path="/roupas" component={ZumaModaRoupas} />
            <Route path="/zuma-moda" component={ZumaModaRoupas} />
            <Route path="/zuma-moda-roupas" component={ZumaModaRoupas} />
            <Route path="/cozinha" component={CozinhaKds} />
            <Route path="/kds" component={CozinhaKds} />
            <Route path="/estoque" component={EstoqueInsumos} />
            <Route path="/fiscal" component={FiscalNotas} />
            <Route path="/financeiro" component={FinanceiroDre} />

            {/* Estratégia */}
            <Route path="/mercado" component={MercadoBenchmark} />
            <Route path="/ia-mercado" component={MercadoBenchmark} />
            <Route path="/ia-e-mercado" component={MercadoBenchmark} />
            <Route path="/integracoes" component={Integracoes} />
            <Route path="/bancofe" component={BancoFeHub} />
            <Route path="/banking" component={BancoFeHub} />
            <Route path="/bancofe-core" component={BancoFeHub} />
            <Route path="/comparativo-saipos" component={ComparativoSaipos} />
            <Route path="/saipos" component={ComparativoSaipos} />
            <Route path="/ultra-vision" component={UltraVisionAi} />
            <Route path="/dr-clima" component={DrClimaSimulador} />
            <Route path="/clima" component={DrClimaSimulador} />
            <Route path="/simulador-clima" component={DrClimaSimulador} />
            <Route path="/vision-ai" component={UltraVisionAi} />
            <Route path="/cameras" component={UltraVisionAi} />
            <Route path="/nossa-gente" component={NossaGenteRh} />
            <Route path="/rh" component={NossaGenteRh} />
            <Route path="/gestao-pessoas" component={NossaGenteRh} />

            {/* Fallback */}
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <AuthProvider>
          <BusinessProvider>
            <TooltipProvider>
              <Toaster position="bottom-right" richColors />
              <Router />
            </TooltipProvider>
          </BusinessProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
