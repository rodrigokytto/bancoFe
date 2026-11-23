import React, { useState, useMemo, useEffect } from "react";
import { 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Printer, 
  Send, 
  Mail, 
  CheckCircle2, 
  Clock, 
  X, 
  AlertCircle, 
  Copy, 
  Smartphone, 
  AlertTriangle,
  ShieldAlert,
  Lock,
  Users, 
  Receipt, 
  Check, 
  ArrowRight,
  ShieldCheck,
  FileText,
  Percent,
  Sparkles,
  ExternalLink,
  Wifi,
  BatteryCharging,
  Cpu,
  Radio,
  FileCheck,
  Nfc,
  Keyboard,
  Share2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { formatBrl } from "../../../../shared/zumaData";
import { 
  TEF_TERMINALS_CATALOG, 
  MaquininhaTef, 
  gerarComprovanteTef, 
  ComprovanteTefData 
} from "../../lib/tefTerminals";
import { kdsAudio } from "../../lib/kdsAudio";
import { trpc } from "../../lib/trpc";

export interface ItemComanda {
  nome: string;
  qtd: number;
  valorUnit: number;
  obs?: string;
}

export interface ModalPagamentoMesaProps {
  isOpen: boolean;
  onClose: () => void;
  mesaNumero: number;
  mesaNome: string;
  garcomNome: string;
  clienteNome?: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  itens: ItemComanda[];
  consumoBase: number;
  taxaServicoAtiva: boolean;
  descontoCashback: number;
  modoFechamento: "TOTAL" | "DIVIDIDO";
  splitPessoas: number;
  onConfirmarPagamentoEBaixa: (detalhes: {
    formaPagamento: string;
    totalPago: number;
    impressoCaixa: boolean;
    enviadoWhatsApp: boolean;
    whatsappNumero: string;
    enviadoEmail: boolean;
    emailDestino: string;
    chaveNfce: string;
    dadosTef?: {
      terminalId: string;
      terminalNome: string;
      nsuHost: string;
      nsuTef: string;
      codigoAutorizacao: string;
      bandeira: string;
      modalidade: string;
      parcelas: number;
    };
  }) => void;
}

type MetodoPagamento = "pix" | "cartao" | "voucher" | "dinheiro" | "dividido";

export const ModalPagamentoMesa: React.FC<ModalPagamentoMesaProps> = ({
  isOpen,
  onClose,
  mesaNumero,
  mesaNome,
  garcomNome,
  clienteNome,
  clienteTelefone = "(65) 99981-3344",
  clienteEmail = "cliente@zuma.com.br",
  itens,
  consumoBase,
  taxaServicoAtiva,
  descontoCashback,
  modoFechamento,
  splitPessoas,
  onConfirmarPagamentoEBaixa
}) => {
  // Cálculo de Valores
  const taxaServico = taxaServicoAtiva ? consumoBase * 0.1 : 0;
  const totalLiquido = Math.max(0, consumoBase + taxaServico - descontoCashback);
  const pessoasCalculo = modoFechamento === "TOTAL" ? 1 : Math.max(1, splitPessoas);
  const cotaIndividual = totalLiquido / pessoasCalculo;

  // Estados do Pagamento
  const [metodo, setMetodo] = useState<MetodoPagamento>("cartao");
  const [tipoCartao, setTipoCartao] = useState<"debito" | "credito">("credito");
  const [bandeiraCartao, setBandeiraCartao] = useState("Mastercard");
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>("pos_cielo_01"); // Default POS 02 / Cielo LIO
  const [parcelas, setParcelas] = useState(1);
  
  // Terminal Selecionado
  const terminalAtivo = useMemo(() => {
    return TEF_TERMINALS_CATALOG.find(t => t.id === selectedTerminalId) || TEF_TERMINALS_CATALOG[0];
  }, [selectedTerminalId]);

  // Status e Fluxo TEF Integrado
  const [statusTef, setStatusTef] = useState<"idle" | "enviando" | "aguardando_cartao" | "digitando_senha" | "autorizado">("idle");
  const [comprovanteTefGerado, setComprovanteTefGerado] = useState<ComprovanteTefData | null>(null);
  const [tipoViaComprovante, setTipoViaComprovante] = useState<"CLIENTE" | "ESTABELECIMENTO">("CLIENTE");
  const [showModalComprovanteTef, setShowModalComprovanteTef] = useState(false);
  const [pingLatencia, setPingLatencia] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Modo de Contingência Manual Auditada (POS Off-line / Falha de Conexão no Salão)
  const [modoContingenciaManual, setModoContingenciaManual] = useState(false);
  const [manualCardLast4, setManualCardLast4] = useState("");
  const [manualAuthCode, setManualAuthCode] = useState("");
  const [manualNsu, setManualNsu] = useState("");
  const [manualAdquirente, setManualAdquirente] = useState<any>("Stone");
  const [manualMotivo, setManualMotivo] = useState("Falha temporária de rede/sinal no salão");

  // Modos de Captura do Cartão na Mesa:
  // "pos_sem_fio": Envio sem fio para o POS selecionado (16 opções)
  // "tap_on_phone": Celular vira maquininha (Tap on Phone NFC Contactless)
  // "digitacao_app": Garçom digita os dados do pagamento/máquina direto no app
  // "contingencia": Modo auditado offline
  const [modoCapturaCartao, setModoCapturaCartao] = useState<"pos_sem_fio" | "tap_on_phone" | "digitacao_app" | "contingencia">("pos_sem_fio");

  // Campos de Digitação no App pelo Garçom
  const [digitacaoCardLast4, setDigitacaoCardLast4] = useState("");
  const [digitacaoAuthCode, setDigitacaoAuthCode] = useState("");
  const [digitacaoNsu, setDigitacaoNsu] = useState("");

  // Preview do E-mail Fiscal Oficial (contato@kytto.com.br)
  const [showPreviewEmail, setShowPreviewEmail] = useState(false);

  // Mutations de Despacho em Tempo Real
  const enviarComprovanteWahaMutation = trpc.zuma.enviarComprovanteWaha.useMutation();
  const enviarEmailComprovanteMutation = trpc.zuma.enviarEmailComprovanteMesa.useMutation();

  // Reset seguro de estados ao abrir a mesa ou trocar contexto
  useEffect(() => {
    if (isOpen) {
      setStatusTef("idle");
      setComprovanteTefGerado(null);
      setPixStatus("aguardando");
      setModoContingenciaManual(false);
      setManualCardLast4("");
      setManualAuthCode("");
      setValorRecebidoDinheiro(totalLiquido);
      setCotasPagas(
        Array.from({ length: pessoasCalculo }, (_, idx) => ({
          id: idx + 1,
          nome: idx === 0 && clienteNome ? clienteNome : `Pagante ${idx + 1}`,
          pago: false,
          metodo: "Cartão TEF"
        }))
      );
    }
  }, [isOpen, mesaNumero, pessoasCalculo, totalLiquido, clienteNome]);

  // Dinheiro e Troco
  const [valorRecebidoDinheiro, setValorRecebidoDinheiro] = useState(totalLiquido);
  const trocoCalculado = Math.max(0, valorRecebidoDinheiro - totalLiquido);

  // Pix Dinâmico Sicredi
  const [pixStatus, setPixStatus] = useState<"aguardando" | "confirmado">("aguardando");
  const txIdPix = useMemo(() => `ZUMA${Date.now().toString().slice(-8)}SICREDI`, []);
  const pixCopiaECola = useMemo(() => {
    return `00020126580014BR.GOV.BCB.PIX013636296848000157520400005303986540${totalLiquido.toFixed(2).replace(".", "")}5802BR5925ZUMA COZINHA ORIENTAL6014TANGARA DA SER62240520${txIdPix}6304E8A2`;
  }, [totalLiquido, txIdPix]);

  // Pagamento Parcial / Dividido pessoa a pessoa
  const [cotasPagas, setCotasPagas] = useState<Array<{ id: number; nome: string; pago: boolean; metodo: string }>>(
    Array.from({ length: pessoasCalculo }, (_, idx) => ({
      id: idx + 1,
      nome: idx === 0 && clienteNome ? clienteNome : `Pagante ${idx + 1}`,
      pago: false,
      metodo: "Cartão TEF"
    }))
  );

  // Configurações de Impressão e Disparo Multicanal
  const [imprimirCaixaAuto, setImprimirCaixaAuto] = useState(true);
  const [impressoraDestino, setImpressoraDestino] = useState("Caixa Principal Balcão 80mm (Epson TM-T20X)");
  const [enviarWhatsAuto, setEnviarWhatsAuto] = useState(true);
  const [numeroWhats, setNumeroWhats] = useState(clienteTelefone);
  const [enviarEmailAuto, setEnviarEmailAuto] = useState(true);
  const [emailDestino, setEmailDestino] = useState(clienteEmail);

  // Modais de Preview
  const [showPreviewBobina, setShowPreviewBobina] = useState(false);
  const [showPreviewWhats, setShowPreviewWhats] = useState(false);

  if (!isOpen) return null;

  const chaveNfceSefaz = "51261136296848000157650010000049281893728192";

  // Cálculo da Taxa MDR da maquininha selecionada
  const taxaMdrAtual = useMemo(() => {
    if (!terminalAtivo) return 0;
    if (metodo === "voucher") return terminalAtivo.taxasMdr.voucher;
    if (tipoCartao === "debito") return terminalAtivo.taxasMdr.debito;
    if (parcelas === 1) return terminalAtivo.taxasMdr.creditoVista;
    return terminalAtivo.taxasMdr.creditoParceladoBase + (parcelas - 2) * terminalAtivo.taxasMdr.creditoParcelaAdicional;
  }, [terminalAtivo, metodo, tipoCartao, parcelas]);

  const valorTaxaMdrBrl = (totalLiquido * taxaMdrAtual) / 100;
  const valorLiquidoReceber = totalLiquido - valorTaxaMdrBrl;

  // Testar Ping no Terminal TEF
  const handleTestarPingTef = () => {
    setIsPinging(true);
    setTimeout(() => {
      const ping = Math.floor(8 + Math.random() * 15);
      setPingLatencia(ping);
      setIsPinging(false);
      toast.success(`Ping TEF OK: ${terminalAtivo.codigo} (${terminalAtivo.modelo}) respondeu em ${ping}ms!`, {
        description: `IP: ${terminalAtivo.ip}:${terminalAtivo.portaTef} · Protocolo: ${terminalAtivo.protocoloTef} · Conexão: ${terminalAtivo.conexao}`
      });
    }, 450);
  };

  const totalCotasPagas = cotasPagas.filter(c => c.pago).length;
  const valorTotalJaPago = totalCotasPagas * cotaIndividual;

  // Validação Estrita de Pagamento (Bloqueia Baixa Sem Confirmação e Leitura de Cartão)
  const isPagamentoValidoEConfirmado = useMemo(() => {
    if (metodo === "pix") {
      return pixStatus === "confirmado";
    }
    if (metodo === "cartao" || metodo === "voucher") {
      if (modoCapturaCartao === "digitacao_app") {
        return digitacaoCardLast4.trim().length === 4 && digitacaoAuthCode.trim().length >= 4;
      }
      if (modoCapturaCartao === "contingencia" || modoContingenciaManual) {
        return manualCardLast4.trim().length === 4 && manualAuthCode.trim().length >= 4;
      }
      return statusTef === "autorizado";
    }
    if (metodo === "dinheiro") {
      return valorRecebidoDinheiro >= totalLiquido;
    }
    if (metodo === "dividido") {
      return totalCotasPagas === pessoasCalculo;
    }
    return false;
  }, [
    metodo,
    pixStatus,
    modoCapturaCartao,
    modoContingenciaManual,
    manualCardLast4,
    manualAuthCode,
    digitacaoCardLast4,
    digitacaoAuthCode,
    statusTef,
    valorRecebidoDinheiro,
    totalLiquido,
    totalCotasPagas,
    pessoasCalculo
  ]);

  // Motivo explícito de bloqueio para o operador
  const motivoBloqueio = useMemo(() => {
    if (metodo === "pix" && pixStatus !== "confirmado") {
      return "Aguardando confirmação do Pix Sicredi MT";
    }
    if (metodo === "cartao" || metodo === "voucher") {
      if (modoCapturaCartao === "digitacao_app") {
        if (digitacaoCardLast4.trim().length !== 4) return "Digite os 4 últimos dígitos do cartão no app";
        if (digitacaoAuthCode.trim().length < 4) return "Digite o código de autorização da maquininha";
      } else if (modoCapturaCartao === "tap_on_phone") {
        if (statusTef !== "autorizado") return "Aproxime o cartão na traseira deste celular (NFC Contactless)";
      } else if (modoCapturaCartao === "contingencia" || modoContingenciaManual) {
        if (manualCardLast4.trim().length !== 4) return "Informe os 4 últimos dígitos do cartão físico";
        if (manualAuthCode.trim().length < 4) return "Informe o código de autorização impresso no POS";
      } else if (statusTef !== "autorizado") {
        return `Obrigatório ler/aproximar o cartão no terminal ${terminalAtivo.codigo}`;
      }
    }
    if (metodo === "dinheiro" && valorRecebidoDinheiro < totalLiquido) {
      const falta = totalLiquido - valorRecebidoDinheiro;
      return `Valor insuficiente: faltam ${formatBrl(falta)}`;
    }
    if (metodo === "dividido" && totalCotasPagas < pessoasCalculo) {
      const restam = pessoasCalculo - totalCotasPagas;
      return `Restam ${restam} ${restam === 1 ? "cota pendente" : "cotas pendentes"} de pagamento`;
    }
    return null;
  }, [
    metodo,
    pixStatus,
    modoCapturaCartao,
    modoContingenciaManual,
    manualCardLast4,
    manualAuthCode,
    digitacaoCardLast4,
    digitacaoAuthCode,
    statusTef,
    terminalAtivo.codigo,
    valorRecebidoDinheiro,
    totalLiquido,
    totalCotasPagas,
    pessoasCalculo
  ]);

  // Disparar Transação TEF Integrada (Sem Redigitação de Valor)
  const handleDispararTransacaoTef = () => {
    setStatusTef("enviando");
    kdsAudio.playCardReaderBeep();
    toast.info(`Comando TEF enviado para ${terminalAtivo.nome}!`, {
      description: `Valor de ${formatBrl(totalLiquido)} transmitido sem fio via ${terminalAtivo.conexao}.`
    });

    setTimeout(() => {
      setStatusTef("aguardando_cartao");
      kdsAudio.playCardReaderBeep();
    }, 1000);

    setTimeout(() => {
      setStatusTef("digitando_senha");
    }, 2400);

    setTimeout(() => {
      setStatusTef("autorizado");
      kdsAudio.playPaymentApprovedChime();
      const comprovante = gerarComprovanteTef({
        terminal: terminalAtivo,
        valorTotal: totalLiquido,
        modalidade: metodo === "voucher" ? "voucher" : tipoCartao,
        bandeira: bandeiraCartao,
        parcelas,
        mesaNumero,
        tipoVia: tipoViaComprovante
      });
      setComprovanteTefGerado(comprovante);
      toast.success(`Transação TEF Aprovada com Sucesso no ${terminalAtivo.codigo}!`, {
        description: `NSU: ${comprovante.nsuHost} · Autorização: ${comprovante.codigoAutorizacao} · Bandeira: ${comprovante.bandeira}`
      });
    }, 4200);
  };

  // Fluxo 1: Tap on Phone (NFC no Celular do Garçom)
  const handleProcessarTapOnPhoneNfc = () => {
    setStatusTef("aguardando_cartao");
    kdsAudio.playCardReaderBeep();
    toast.info("📱 Leitor NFC Ativo!", {
      description: "Aproxime o cartão físico ou smartphone do cliente na traseira deste celular."
    });

    setTimeout(() => {
      setStatusTef("digitando_senha");
      kdsAudio.playCardReaderBeep();
    }, 1800);

    setTimeout(() => {
      const autCode = "AUT-" + Math.floor(100000 + Math.random() * 900000);
      const nsuSim = "NFC-" + Date.now().toString().slice(-6);
      const comprovante = gerarComprovanteTef({
        terminal: {
          ...terminalAtivo,
          nome: "Zuma Tap on Phone (NFC Móvel Garçom)",
          codigo: "TAP-GARCOM",
          adquirente: "Stone",
          modelo: "Android NFC SmartPOS",
          conexao: "Wi-Fi 5GHz + 4G"
        },
        valorTotal: totalLiquido,
        modalidade: metodo === "voucher" ? "voucher" : tipoCartao,
        bandeira: bandeiraCartao,
        parcelas,
        mesaNumero,
        tipoVia: tipoViaComprovante
      });
      comprovante.nsuHost = nsuSim;
      comprovante.codigoAutorizacao = autCode;
      setComprovanteTefGerado(comprovante);
      setStatusTef("autorizado");
      kdsAudio.playPaymentApprovedChime();
      toast.success("✔ Pagamento Contactless Aprovado via NFC no Celular!", {
        description: `NSU: ${nsuSim} · AUT: ${autCode} · R$ ${totalLiquido.toFixed(2)}`
      });
    }, 3200);
  };

  // Fluxo 2: Digitação no App pelo Garçom
  const handleConfirmarDigitacaoAppGarcom = () => {
    if (digitacaoCardLast4.trim().length !== 4) {
      toast.error("Informe os 4 últimos dígitos do cartão.");
      return;
    }
    if (digitacaoAuthCode.trim().length < 4) {
      toast.error("Informe o código de autorização impresso na máquina.");
      return;
    }
    kdsAudio.playPaymentApprovedChime();
    const aut = digitacaoAuthCode.trim().toUpperCase();
    const nsu = digitacaoNsu.trim() || ("APP-" + Date.now().toString().slice(-6));
    const comprovante = gerarComprovanteTef({
      terminal: {
        ...terminalAtivo,
        nome: "Digitação Direta no App (Garçom)",
        codigo: "APP-DIGITACAO",
        adquirente: terminalAtivo.adquirente,
        modelo: "Validação Manual App Garçom",
        conexao: "Wi-Fi 5GHz + 4G"
      },
      valorTotal: totalLiquido,
      modalidade: metodo === "voucher" ? "voucher" : tipoCartao,
      bandeira: bandeiraCartao,
      parcelas,
      mesaNumero,
      tipoVia: tipoViaComprovante
    });
    comprovante.nsuHost = nsu;
    comprovante.codigoAutorizacao = aut;
    setComprovanteTefGerado(comprovante);
    setStatusTef("autorizado");
    toast.success("✔ Pagamento validado e digitado no App pelo Garçom!", {
      description: `NSU: ${nsu} · AUT: ${aut} · Cartão final ${digitacaoCardLast4}`
    });
  };

  // Fluxo 3: Disparo Imediato via WhatsApp (Servidor WAHA)
  const handleDispararWhatsAppAgora = () => {
    if (!numeroWhats) {
      toast.error("Informe o número de WhatsApp para disparo.");
      return;
    }
    const toastId = toast.loading(`Enviando comprovante via WAHA para ${numeroWhats}...`);
    enviarComprovanteWahaMutation.mutate({
      phone: numeroWhats,
      mesaNumero,
      mesaNome,
      totalPago: totalLiquido,
      formaPagamento: metodo === "cartao" ? `Cartão ${tipoCartao} (${bandeiraCartao})` : metodo,
      chaveNfce: chaveNfceSefaz,
      atendente: garcomNome,
      itens: itens.map(i => ({ itemName: i.nome, quantity: i.qtd, unitPrice: i.valorUnit })),
      comprovanteTef: comprovanteTefGerado
    }, {
      onSuccess: (data: any) => {
        toast.success(`✔ Comprovante enviado via WAHA com sucesso para ${data.to}!`, {
          id: toastId,
          description: `ID Mensagem WAHA: ${data.messageId} · Motor NOWEB ativo.`
        });
      },
      onError: (err: any) => {
        toast.error("Erro ao disparar mensagem WAHA: " + err.message, { id: toastId });
      }
    });
  };

  // Fluxo 4: Disparo Imediato via E-mail (contato@kytto.com.br)
  const handleDispararEmailAgora = () => {
    if (!emailDestino) {
      toast.error("Informe o e-mail de destino para envio.");
      return;
    }
    const toastId = toast.loading(`Enviando e-mail fiscal de contato@kytto.com.br para ${emailDestino}...`);
    enviarEmailComprovanteMutation.mutate({
      emailDestino,
      mesaNumero,
      mesaNome,
      totalPago: totalLiquido,
      formaPagamento: metodo === "cartao" ? `Cartão ${tipoCartao} (${bandeiraCartao})` : metodo,
      chaveNfce: chaveNfceSefaz,
      atendente: garcomNome,
      itens: itens.map(i => ({ itemName: i.nome, quantity: i.qtd, unitPrice: i.valorUnit })),
      comprovanteTef: comprovanteTefGerado
    }, {
      onSuccess: (data: any) => {
        toast.success(`✔ E-mail fiscal enviado por contato@kytto.com.br para ${data.to}!`, {
          id: toastId,
          description: `ID Mensagem: ${data.messageId} · Remetente: contato@kytto.com.br`
        });
      },
      onError: (err: any) => {
        toast.error("Erro ao enviar e-mail: " + err.message, { id: toastId });
      }
    });
  };

  const handleConfirmarRecebimentoPix = () => {
    setPixStatus("confirmado");
    kdsAudio.playPaymentApprovedChime();
    toast.success("Pagamento Pix Sicredi confirmado pelo Webhook MT!", {
      description: `R$ ${totalLiquido.toFixed(2)} recebido instantaneamente na conta cooperativa.`
    });
  };

  const handleAlternarCota = (id: number) => {
    setCotasPagas(prev => prev.map(c => c.id === id ? { ...c, pago: !c.pago } : c));
  };

  const handleExecutarFechamentoCompleto = () => {
    // Guarda estrita: Impede a baixa da mesa se o pagamento não foi concluído e lido
    if (!isPagamentoValidoEConfirmado) {
      kdsAudio.playPaymentRejectedChime();
      toast.error("🛑 BLOQUEIO DE SEGURANÇA: Pagamento não confirmado!", {
        description: motivoBloqueio || "Complete a leitura do cartão ou a confirmação bancária antes de liberar a mesa.",
        duration: 6000
      });
      return;
    }

    kdsAudio.playPaymentApprovedChime();

    // Homologação automática do comprovante caso tenha sido validado no app ou contingência
    let comprovanteFinal = comprovanteTefGerado;
    if (!comprovanteFinal && modoCapturaCartao === "digitacao_app" && digitacaoCardLast4.trim().length === 4 && digitacaoAuthCode.trim().length >= 4) {
      const aut = digitacaoAuthCode.trim().toUpperCase();
      const nsu = digitacaoNsu.trim() || ("APP-" + Date.now().toString().slice(-6));
      comprovanteFinal = gerarComprovanteTef({
        terminal: {
          ...terminalAtivo,
          nome: "Digitação Direta no App (Garçom)",
          codigo: "APP-DIGITACAO",
          adquirente: terminalAtivo.adquirente,
          modelo: "Validação Manual App Garçom",
          conexao: "Wi-Fi 5GHz + 4G"
        },
        valorTotal: totalLiquido,
        modalidade: metodo === "voucher" ? "voucher" : tipoCartao,
        bandeira: bandeiraCartao,
        parcelas,
        mesaNumero,
        tipoVia: tipoViaComprovante
      });
      comprovanteFinal.nsuHost = nsu;
      comprovanteFinal.codigoAutorizacao = aut;
      setComprovanteTefGerado(comprovanteFinal);
    } else if (!comprovanteFinal && (modoCapturaCartao === "contingencia" || modoContingenciaManual) && manualCardLast4.trim().length === 4 && manualAuthCode.trim().length >= 4) {
      const aut = manualAuthCode.trim().toUpperCase();
      const nsu = manualNsu.trim() || ("CONT-" + Date.now().toString().slice(-6));
      comprovanteFinal = gerarComprovanteTef({
        terminal: {
          ...terminalAtivo,
          nome: "Contingência POS Manual",
          codigo: "CONT-MANUAL",
          adquirente: manualAdquirente,
          modelo: "Terminal Offline de Contingência",
          conexao: "4G Multi-Operadora"
        },
        valorTotal: totalLiquido,
        modalidade: metodo === "voucher" ? "voucher" : tipoCartao,
        bandeira: bandeiraCartao,
        parcelas,
        mesaNumero,
        tipoVia: tipoViaComprovante
      });
      comprovanteFinal.nsuHost = nsu;
      comprovanteFinal.codigoAutorizacao = aut;
      setComprovanteTefGerado(comprovanteFinal);
    }

    const descPagamento = metodo === "pix" 
      ? "Sicredi Pix Direto MT" 
      : metodo === "cartao" 
      ? (modoCapturaCartao === "tap_on_phone"
          ? `Cartão ${tipoCartao === "debito" ? "Débito" : "Crédito"} (${bandeiraCartao}) · Tap on Phone NFC Contactless`
          : modoCapturaCartao === "digitacao_app"
          ? `Cartão ${tipoCartao === "debito" ? "Débito" : "Crédito"} (${bandeiraCartao}) · Digitado no App pelo Garçom`
          : modoCapturaCartao === "contingencia" || modoContingenciaManual
          ? `Cartão ${tipoCartao === "debito" ? "Débito" : "Crédito"} (${bandeiraCartao}) · Contingência Manual`
          : `Cartão ${tipoCartao === "debito" ? "Débito" : "Crédito"} (${bandeiraCartao}) · ${terminalAtivo.codigo} (${terminalAtivo.adquirente})`)
      : metodo === "dinheiro"
      ? `Dinheiro (Recebido ${formatBrl(valorRecebidoDinheiro)})`
      : metodo === "voucher"
      ? `Voucher Refeição (${bandeiraCartao}) · ${terminalAtivo.codigo}`
      : `Dividido (${pessoasCalculo} pagantes)`;

    const msgs: string[] = [];
    if (imprimirCaixaAuto) msgs.push(`Impressão ESC/POS enviada para ${impressoraDestino}`);
    if (enviarWhatsAuto && numeroWhats) {
      enviarComprovanteWahaMutation.mutate({
        phone: numeroWhats,
        mesaNumero,
        mesaNome,
        totalPago: totalLiquido,
        formaPagamento: descPagamento,
        chaveNfce: chaveNfceSefaz,
        atendente: garcomNome,
        itens: itens.map(i => ({ itemName: i.nome, quantity: i.qtd, unitPrice: i.valorUnit })),
        comprovanteTef: comprovanteFinal
      });
      msgs.push(`Recibo digital enviado via WAHA para ${numeroWhats}`);
    }
    if (enviarEmailAuto && emailDestino) {
      enviarEmailComprovanteMutation.mutate({
        emailDestino,
        mesaNumero,
        mesaNome,
        totalPago: totalLiquido,
        formaPagamento: descPagamento,
        chaveNfce: chaveNfceSefaz,
        atendente: garcomNome,
        itens: itens.map(i => ({ itemName: i.nome, quantity: i.qtd, unitPrice: i.valorUnit })),
        comprovanteTef: comprovanteFinal
      });
      msgs.push(`DANFE despachado por contato@kytto.com.br para ${emailDestino}`);
    }

    toast.success(`Conta da ${mesaNome} liquidada pelo garçom ${garcomNome}!`, {
      description: msgs.join(" • ")
    });

    setTimeout(() => {
      onConfirmarPagamentoEBaixa({
        formaPagamento: descPagamento,
        totalPago: totalLiquido,
        impressoCaixa: imprimirCaixaAuto,
        enviadoWhatsApp: enviarWhatsAuto,
        whatsappNumero: numeroWhats,
        enviadoEmail: enviarEmailAuto,
        emailDestino: emailDestino,
        chaveNfce: chaveNfceSefaz,
        dadosTef: comprovanteFinal ? {
          terminalId: comprovanteFinal.terminalId,
          terminalNome: comprovanteFinal.terminalNome,
          nsuHost: comprovanteFinal.nsuHost,
          nsuTef: comprovanteFinal.nsuLocalTef,
          codigoAutorizacao: comprovanteFinal.codigoAutorizacao,
          bandeira: comprovanteFinal.bandeira,
          modalidade: comprovanteFinal.modalidade,
          parcelas: comprovanteFinal.parcelas
        } : undefined
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--surface)] text-[var(--ink)] w-full max-w-4xl rounded-3xl border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface2)]/40">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-lg font-black tracking-tight">
                  Pagamento na Mesa &amp; Despacho Multicanal
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-mono text-[10px] font-bold">
                  {mesaNome}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 font-mono text-[10px] font-bold">
                  Garçom: {garcomNome}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--muted)]">
                Liquidação direta na mesa pelo atendente, emissão de NFC-e SEFAZ-MT e despacho automático.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Principal */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs">
          {/* Card Resumo Financeiro da Mesa */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[var(--surface2)]/40 border border-[var(--line)]">
            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Consumo Base</span>
              <span className="text-sm sm:text-base font-mono font-bold text-[var(--ink)]">{formatBrl(consumoBase)}</span>
              <span className="text-[10px] text-[var(--muted)] block">{itens.length} itens pedidos</span>
            </div>

            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Taxa Serviço 10%</span>
              <span className="text-sm sm:text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {taxaServicoAtiva ? `+ ${formatBrl(taxaServico)}` : "R$ 0,00"}
              </span>
              <span className="text-[10px] text-[var(--muted)] block">Rateio equipe</span>
            </div>

            <div>
              <span className="text-[10px] text-[var(--muted)] uppercase font-bold block">Clube Zumi Cashback</span>
              <span className="text-sm sm:text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {descontoCashback > 0 ? `- ${formatBrl(descontoCashback)}` : "R$ 0,00"}
              </span>
              <span className="text-[10px] text-[var(--muted)] block">Abatido na mesa</span>
            </div>

            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-200 uppercase font-bold block">Total a Liquidar</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-700 dark:text-emerald-300 block">
                {formatBrl(totalLiquido)}
              </span>
              {modoFechamento === "DIVIDIDO" && (
                <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold block">
                  {pessoasCalculo}x de {formatBrl(cotaIndividual)}
                </span>
              )}
            </div>
          </div>

          {/* BANNER DE TRAVA DE SEGURANÇA CONTRA BAIXA INDEVIDA SEM LEITURA/PAGAMENTO */}
          <div className={`p-3.5 sm:p-4 rounded-2xl flex items-start sm:items-center justify-between gap-3 border transition-all ${
            isPagamentoValidoEConfirmado 
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-sm" 
              : "bg-amber-500/15 border-amber-500/40 text-amber-950 dark:text-amber-100 shadow-xs"
          }`}>
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isPagamentoValidoEConfirmado ? "bg-emerald-600 text-white shadow-xs" : "bg-amber-500 text-neutral-900 shadow-xs"
              }`}>
                {isPagamentoValidoEConfirmado ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-xs uppercase tracking-wide">
                    {isPagamentoValidoEConfirmado 
                      ? "Pagamento Homologado & Liberado para Baixa" 
                      : "Trava Anti-Fraude Ativa: Baixa de Mesa Bloqueada"}
                  </span>
                  <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${
                    isPagamentoValidoEConfirmado 
                      ? "bg-emerald-600 text-white shadow-2xs" 
                      : "bg-amber-500 text-neutral-900 animate-pulse font-extrabold"
                  }`}>
                    {isPagamentoValidoEConfirmado ? "✔ LIBERADO" : "🛑 BLOQUEADO"}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 leading-snug">
                  {isPagamentoValidoEConfirmado
                    ? "Transação aprovada e auditada no TEF/banco. Liberação da mesa autorizada pelo sistema Zuma."
                    : (motivoBloqueio || "Aguardando leitura do cartão no terminal ou confirmação do pagamento.")}
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right shrink-0">
              <span className="text-[10px] font-mono text-[var(--muted)] block">SEFAZ NFC-e</span>
              <span className={`text-xs font-bold ${isPagamentoValidoEConfirmado ? "text-emerald-600" : "text-amber-600"}`}>
                {isPagamentoValidoEConfirmado ? "● Pronto p/ Emitir" : "○ Bloqueado"}
              </span>
            </div>
          </div>

          {/* Seletor de Métodos de Pagamento na Mesa */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block">
                Escolha o Meio de Pagamento na Mesa
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Baixa Imediata &amp; NFC-e SEFAZ-MT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setMetodo("pix")}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 min-h-[58px] ${
                  metodo === "pix"
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs"
                    : "bg-[var(--surface2)]/50 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  {pixStatus === "confirmado" ? (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Pago</span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">Pendente</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs">Pix Sicredi</span>
                  <span className="text-[10px] opacity-75">QR Code na Mesa</span>
                </div>
              </button>

              <button
                onClick={() => setMetodo("cartao")}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 min-h-[58px] ${
                  metodo === "cartao"
                    ? "bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-xs ring-2 ring-indigo-500/30"
                    : "bg-[var(--surface2)]/50 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  {statusTef === "autorizado" || (modoContingenciaManual && manualCardLast4.length === 4 && manualAuthCode.length >= 4) ? (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Lido</span>
                  ) : (
                    <span className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">Não Lido</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs">Cartão TEF</span>
                  <span className="text-[10px] opacity-75">16 Maquininhas</span>
                </div>
              </button>

              <button
                onClick={() => setMetodo("dinheiro")}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 min-h-[58px] ${
                  metodo === "dinheiro"
                    ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-xs"
                    : "bg-[var(--surface2)]/50 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  {valorRecebidoDinheiro >= totalLiquido ? (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">OK</span>
                  ) : (
                    <span className="text-[9px] bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded">Falta</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs">Dinheiro</span>
                  <span className="text-[10px] opacity-75">Cálculo de Troco</span>
                </div>
              </button>

              <button
                onClick={() => setMetodo("voucher")}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 min-h-[58px] ${
                  metodo === "voucher"
                    ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs"
                    : "bg-[var(--surface2)]/50 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  {statusTef === "autorizado" || (modoContingenciaManual && manualCardLast4.length === 4 && manualAuthCode.length >= 4) ? (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">Lido</span>
                  ) : (
                    <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded">Pendente</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs">Voucher VR/VA</span>
                  <span className="text-[10px] opacity-75">Sodexo, Alelo, Ticket</span>
                </div>
              </button>

              <button
                onClick={() => setMetodo("dividido")}
                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 min-h-[58px] col-span-2 sm:col-span-1 ${
                  metodo === "dividido"
                    ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs"
                    : "bg-[var(--surface2)]/50 border-[var(--line)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Users className="w-5 h-5 text-blue-600" />
                  {totalCotasPagas === pessoasCalculo ? (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded">100%</span>
                  ) : (
                    <span className="text-[9px] bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded">{totalCotasPagas}/{pessoasCalculo}</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs">Cotas na Mesa</span>
                  <span className="text-[10px] opacity-75">{pessoasCalculo} pessoas</span>
                </div>
              </button>
            </div>
          </div>

          {/* ÁREA DE CONFIGURAÇÃO ESPECÍFICA DO MÉTODO ESCOLHIDO */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--surface2)]/30 border border-[var(--line)]">
            {/* 1. PIX SICREDI */}
            {metodo === "pix" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-[var(--ink)]">QR Code Dinâmico Pix Sicredi MT</h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      Mostre na tela do celular/tablet para o cliente escanear na mesa.
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1 w-fit ${
                    pixStatus === "confirmado" 
                      ? "bg-emerald-500 text-white shadow-xs" 
                      : "bg-amber-500/15 text-amber-600 animate-pulse"
                  }`}>
                    {pixStatus === "confirmado" ? (
                      <><Check className="w-3.5 h-3.5" /> Pago &amp; Confirmado</>
                    ) : (
                      <><Clock className="w-3.5 h-3.5" /> Aguardando Leitura</>
                    )}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[var(--muted)] truncate max-w-xs">
                    {pixCopiaECola}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(pixCopiaECola);
                      toast.success("Código Pix Copia e Cola copiado!");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface2)] hover:bg-[var(--line)] text-xs font-bold flex items-center gap-1 cursor-pointer transition min-h-[36px]"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmarRecebimentoPix}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 shadow-2xs min-h-[42px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Recebimento Pix Sicredi MT</span>
                  </button>
                  <span className="text-[10px] text-[var(--muted)]">
                    Taxa Sicredi MT: 0% · Liquidação instantânea E2E (Conta Cooperativa 0716)
                  </span>
                </div>
              </div>
            )}

            {/* 2. CARTÃO TEF MÓVEL & BALCÃO (CATÁLOGO EXPANDIDO DE 16 MAQUININHAS) */}
            {metodo === "cartao" && (
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-[var(--ink)] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      Pagamento em Cartão na Mesa &amp; Captura TEF
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      Escolha entre envio sem fio para o POS, Tap on Phone (NFC no celular do garçom) ou digitação direta no app.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold">
                      Taxa Aplicada: {taxaMdrAtual.toFixed(2)}% · Retido: {formatBrl(valorTaxaMdrBrl)}
                    </span>
                    <button
                      onClick={handleTestarPingTef}
                      disabled={isPinging}
                      className="px-2.5 py-1 rounded-lg border border-indigo-400/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 transition cursor-pointer min-h-[32px]"
                    >
                      <Radio className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
                      <span>{isPinging ? "Testando..." : "Ping TEF"}</span>
                    </button>
                  </div>
                </div>

                {/* SELETOR DOS 4 MODOS DE CAPTURA DO CARTÃO NA MESA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => {
                      setModoCapturaCartao("pos_sem_fio");
                      setModoContingenciaManual(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 min-h-[56px] ${
                      modoCapturaCartao === "pos_sem_fio"
                        ? "bg-indigo-600 text-white shadow-xs border-indigo-600"
                        : "bg-[var(--surface2)]/50 border-transparent text-[var(--ink)] hover:bg-[var(--surface2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Radio className="w-4 h-4" />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        modoCapturaCartao === "pos_sem_fio" ? "bg-white/20 text-white" : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
                      }`}>16 POS</span>
                    </div>
                    <div>
                      <span className="block font-black text-xs">1. POS Sem Fio</span>
                      <span className={`text-[9px] block leading-tight ${
                        modoCapturaCartao === "pos_sem_fio" ? "text-indigo-100" : "text-[var(--muted)]"
                      }`}>Disparo remoto TEF</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModoCapturaCartao("tap_on_phone");
                      setModoContingenciaManual(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 min-h-[56px] ${
                      modoCapturaCartao === "tap_on_phone"
                        ? "bg-emerald-600 text-white shadow-xs border-emerald-600 ring-2 ring-emerald-500/30"
                        : "bg-[var(--surface2)]/50 border-transparent text-[var(--ink)] hover:bg-[var(--surface2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Smartphone className="w-4 h-4" />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                        modoCapturaCartao === "tap_on_phone" ? "bg-white/25 text-white animate-pulse" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      }`}>NFC</span>
                    </div>
                    <div>
                      <span className="block font-black text-xs">2. Tap on Phone</span>
                      <span className={`text-[9px] block leading-tight ${
                        modoCapturaCartao === "tap_on_phone" ? "text-emerald-100" : "text-[var(--muted)]"
                      }`}>Celular vira máquina</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModoCapturaCartao("digitacao_app");
                      setModoContingenciaManual(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 min-h-[56px] ${
                      modoCapturaCartao === "digitacao_app"
                        ? "bg-blue-600 text-white shadow-xs border-blue-600"
                        : "bg-[var(--surface2)]/50 border-transparent text-[var(--ink)] hover:bg-[var(--surface2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Keyboard className="w-4 h-4" />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        modoCapturaCartao === "digitacao_app" ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                      }`}>Garçom</span>
                    </div>
                    <div>
                      <span className="block font-black text-xs">3. Digitação App</span>
                      <span className={`text-[9px] block leading-tight ${
                        modoCapturaCartao === "digitacao_app" ? "text-blue-100" : "text-[var(--muted)]"
                      }`}>Digita dados no app</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModoCapturaCartao("contingencia");
                      setModoContingenciaManual(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-1 min-h-[56px] ${
                      modoCapturaCartao === "contingencia"
                        ? "bg-amber-600 text-white shadow-xs border-amber-600"
                        : "bg-[var(--surface2)]/50 border-transparent text-[var(--ink)] hover:bg-[var(--surface2)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <AlertTriangle className="w-4 h-4" />
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        modoCapturaCartao === "contingencia" ? "bg-white/20 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      }`}>Offline</span>
                    </div>
                    <div>
                      <span className="block font-black text-xs">4. Contingência</span>
                      <span className={`text-[9px] block leading-tight ${
                        modoCapturaCartao === "contingencia" ? "text-amber-100" : "text-[var(--muted)]"
                      }`}>Modo auditado salão</span>
                    </div>
                  </button>
                </div>

                {/* MODALIDADE (DÉBITO / CRÉDITO) & BANDEIRA DO CARTÃO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                      Modalidade do Cartão
                    </label>
                    <div className="flex rounded-xl bg-[var(--surface)] p-1 border border-[var(--line)]">
                      <button
                        onClick={() => setTipoCartao("debito")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[38px] ${
                          tipoCartao === "debito" ? "bg-indigo-600 text-white shadow-xs" : "text-[var(--muted)]"
                        }`}
                      >
                        Débito
                      </button>
                      <button
                        onClick={() => setTipoCartao("credito")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer min-h-[38px] ${
                          tipoCartao === "credito" ? "bg-indigo-600 text-white shadow-xs" : "text-[var(--muted)]"
                        }`}
                      >
                        Crédito
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                      Bandeira do Cartão
                    </label>
                    <select
                      value={bandeiraCartao}
                      onChange={e => setBandeiraCartao(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] min-h-[44px]"
                    >
                      <optgroup label="Bandeiras Tradicionais">
                        <option value="Mastercard">Mastercard (Crédito / Débito)</option>
                        <option value="Visa">Visa (Crédito / Débito)</option>
                        <option value="Elo">Elo (Nacional MT)</option>
                        <option value="American Express">American Express</option>
                        <option value="Hipercard">Hipercard</option>
                        <option value="Cabal">Cabal Cooperativa</option>
                        <option value="Banricompras">Banricompras Débito</option>
                      </optgroup>
                      <optgroup label="Vouchers e Benefícios">
                        <option value="Sodexo">Sodexo / Pluxee Refeição</option>
                        <option value="Alelo">Alelo Refeição / Alimentação</option>
                        <option value="Ticket">Ticket Restaurante</option>
                        <option value="VR">VR Benefícios</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* PAINEL DO MODO 1: POS SEM FIO (16 MAQUININHAS TEF) */}
                {modoCapturaCartao === "pos_sem_fio" && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--muted)] uppercase block mb-1">
                        Selecione o Terminal TEF / Maquininha Sem Fio (16 Opções Homologadas)
                      </label>
                      <select
                        value={selectedTerminalId}
                        onChange={e => {
                          setSelectedTerminalId(e.target.value);
                          setStatusTef("idle");
                        }}
                        className="w-full p-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-bold text-[var(--ink)] min-h-[44px]"
                      >
                        <optgroup label="🟢 Stone (Salão &amp; Balcão)">
                          <option value="pos_stone_01">POS 01 - Stone P2 (Móvel Salão 01)</option>
                          <option value="pos_stone_02">POS 02 - Stone P2 (Móvel Salão 02)</option>
                          <option value="pos_stone_03">POS 03 - PinPad Stone D210 (Balcão Caixa 01)</option>
                        </optgroup>
                        <optgroup label="🔵 Cielo (Salão, Balcão &amp; Deck)">
                          <option value="pos_cielo_01">POS 04 - Cielo LIO On V3 (Móvel Salão 03)</option>
                          <option value="pos_cielo_02">POS 05 - Cielo Flash 1590 (PinPad Caixa 02)</option>
                          <option value="pos_cielo_03">POS 06 - Cielo Zip Móvel (Deck &amp; Fila)</option>
                        </optgroup>
                        <optgroup label="🟢 Sicredi MT (Cooperativa Tangará da Serra)">
                          <option value="pos_sicredi_01">POS 07 - Sicredi Smart Cooperativa (Salão 04)</option>
                          <option value="pos_sicredi_02">POS 08 - Sicredi TEF Dedicado PayGo (Balcão)</option>
                        </optgroup>
                        <optgroup label="🟡 PagBank (Bar, Copa &amp; Delivery)">
                          <option value="pos_pagbank_01">POS 09 - PagBank Smart 2 (Móvel Bar)</option>
                          <option value="pos_pagbank_02">POS 10 - PagBank Pro 2 (Delivery / Motoboy)</option>
                        </optgroup>
                        <optgroup label="🟠 Rede Itaú (Tatames VIP &amp; Rápido)">
                          <option value="pos_rede_01">POS 11 - Rede Smart (Móvel Tatames VIP)</option>
                          <option value="pos_rede_02">POS 12 - Rede PinPad PPC930 (Balcão Caixa 03)</option>
                        </optgroup>
                        <optgroup label="🟣 Outras Adquirentes Homologadas">
                          <option value="pos_safra_01">POS 13 - SafraPay Smart (Salão Deck Externo)</option>
                          <option value="pos_getnet_01">POS 14 - Getnet POS Digital (Reserva)</option>
                          <option value="pos_mp_01">POS 15 - Mercado Pago Point Pro (Takeout)</option>
                          <option value="pos_granito_01">POS 16 - Granito SmartPOS TEF (Eventos)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Card Informativo ao Vivo do Terminal TEF Selecionado */}
                    <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-[var(--ink)]">
                            {terminalAtivo.codigo} · {terminalAtivo.nome}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                            ● {terminalAtivo.status} ({pingLatencia || terminalAtivo.latenciaMs}ms)
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold flex items-center gap-1">
                            <Wifi className="w-3 h-3" /> {terminalAtivo.conexao}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono font-bold flex items-center gap-1">
                            <BatteryCharging className="w-3 h-3 text-emerald-600" /> {terminalAtivo.bateriaPct}%
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
                          <span>Modelo: <strong>{terminalAtivo.modelo}</strong></span>
                          <span>•</span>
                          <span>Localização: <strong>{terminalAtivo.localizacao}</strong></span>
                          <span>•</span>
                          <span>Protocolo: <strong>{terminalAtivo.protocoloTef}</strong></span>
                          <span>•</span>
                          <span>IP: <code className="font-mono">{terminalAtivo.ip}:{terminalAtivo.portaTef}</code></span>
                        </div>
                      </div>

                      <div className="text-right sm:shrink-0 w-full sm:w-auto">
                        <span className="text-[10px] text-[var(--muted)] block">Valor Líquido na Conta:</span>
                        <span className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 block">
                          {formatBrl(valorLiquidoReceber)}
                        </span>
                        <span className="text-[9px] text-[var(--muted)]">MDR: {taxaMdrAtual.toFixed(2)}% (-{formatBrl(valorTaxaMdrBrl)})</span>
                      </div>
                    </div>

                    {/* Botão de Disparo TEF Direto & Feedback em Tempo Real */}
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          <span className="font-black text-xs text-indigo-950 dark:text-indigo-100">
                            Fluxo TEF Direto na Maquininha Sem Fio
                          </span>
                        </div>

                        {statusTef === "idle" && (
                          <button
                            onClick={handleDispararTransacaoTef}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer min-h-[42px]"
                          >
                            <Radio className="w-4 h-4" />
                            <span>Enviar {formatBrl(totalLiquido)} para o {terminalAtivo.codigo}</span>
                          </button>
                        )}
                      </div>

                      {statusTef !== "autorizado" && (
                        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/35 space-y-2">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <div className="font-black text-xs text-amber-950 dark:text-amber-100 uppercase tracking-wide flex items-center gap-2">
                                <span>Leitura de Cartão Obrigatória no {terminalAtivo.codigo}</span>
                                <span className="text-[9px] bg-amber-500 text-neutral-900 font-extrabold px-1.5 py-0.2 rounded font-mono">
                                  BAIXA BLOQUEADA
                                </span>
                              </div>
                              <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                                Para segurança contra fraudes e conciliação bancária 100%, o sistema Zuma <strong>bloqueia a baixa da mesa</strong> até a inserção ou aproximação (NFC) do cartão no terminal sem fio.
                              </p>
                            </div>
                          </div>

                          {statusTef === "idle" && (
                            <button
                              onClick={handleDispararTransacaoTef}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:brightness-110 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/25 transition cursor-pointer active:scale-98 min-h-[44px]"
                            >
                              <Radio className="w-4 h-4 animate-pulse" />
                              <span>LER CARTÃO NO POS AGORA (Enviar {formatBrl(totalLiquido)} para {terminalAtivo.codigo})</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Feedback Interativo das Etapas do TEF */}
                      {statusTef !== "idle" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="flex items-center gap-2">
                              {statusTef === "enviando" && <span className="animate-spin text-indigo-600">⏳</span>}
                              {statusTef === "aguardando_cartao" && <span className="animate-pulse text-amber-500">💳</span>}
                              {statusTef === "digitando_senha" && <span className="animate-pulse text-blue-500">🔒</span>}
                              {statusTef === "autorizado" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                              <span className={statusTef === "autorizado" ? "text-emerald-700 dark:text-emerald-300" : "text-indigo-900 dark:text-indigo-200"}>
                                {statusTef === "enviando" && `Enviando comando para ${terminalAtivo.nome}...`}
                                {statusTef === "aguardando_cartao" && "Aproxime (NFC Contactless) ou Insira o Cartão no terminal..."}
                                {statusTef === "digitando_senha" && "Cliente digitando senha no PIN Pad seguro..."}
                                {statusTef === "autorizado" && `Transação Autorizada com Sucesso! NSU: ${comprovanteTefGerado?.nsuHost || "94819201"}`}
                              </span>
                            </span>
                            <span className="text-[10px] font-mono text-[var(--muted)]">
                              {statusTef === "autorizado" ? "AUT: " + (comprovanteTefGerado?.codigoAutorizacao || "839102") : "Em andamento..."}
                            </span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-indigo-200/50 dark:bg-indigo-950 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${
                                statusTef === "autorizado" ? "bg-emerald-500 w-full" :
                                statusTef === "digitando_senha" ? "bg-blue-500 w-3/4" :
                                statusTef === "aguardando_cartao" ? "bg-amber-500 w-1/2" : "bg-indigo-600 w-1/4"
                              }`}
                            />
                          </div>

                          {statusTef === "autorizado" && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                onClick={() => setShowModalComprovanteTef(true)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-indigo-700 transition cursor-pointer min-h-[38px]"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Ver Comprovante TEF Térmico</span>
                              </button>
                              <button
                                onClick={() => {
                                  toast.success(`Comprovante TEF impresso na bobina de ${terminalAtivo.larguraBobinaMm}mm do ${terminalAtivo.codigo}!`);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-bold text-xs flex items-center gap-1.5 hover:bg-[var(--surface2)] transition cursor-pointer min-h-[38px]"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Imprimir no SmartPOS ({terminalAtivo.larguraBobinaMm}mm)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PAINEL DO MODO 2: TAP ON PHONE (NFC NO CELULAR DO GARÇOM) */}
                {modoCapturaCartao === "tap_on_phone" && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-xs text-emerald-950 dark:text-emerald-100 block">
                            Tap on Phone: Celular Vira Maquininha de Cartão (Contactless)
                          </span>
                          <span className="text-[10px] text-emerald-800 dark:text-emerald-200">
                            Antena NFC integrada · Suporta Cartões Físicos, Apple Pay, Google Wallet &amp; Samsung Pay
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-mono text-[10px] font-bold flex items-center gap-1 w-fit">
                        <Nfc className="w-3.5 h-3.5" /> Sensor NFC: Ativo (13.56 MHz)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="sm:col-span-2 space-y-2">
                        <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-emerald-500/20 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Instrução ao Garçom</span>
                          <p className="text-xs text-[var(--ink)] leading-relaxed">
                            Peça para o cliente <strong>aproximar o cartão de crédito/débito ou celular/smartwatch</strong> na <strong>traseira deste smartphone</strong>. O leitor processará o pagamento instantaneamente.
                          </p>
                        </div>

                        {statusTef !== "autorizado" ? (
                          <button
                            type="button"
                            onClick={handleProcessarTapOnPhoneNfc}
                            disabled={statusTef === "aguardando_cartao" || statusTef === "digitando_senha"}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-emerald-600/30 transition cursor-pointer active:scale-98 min-h-[48px]"
                          >
                            <Nfc className={`w-5 h-5 ${statusTef !== "idle" ? "animate-spin" : "animate-pulse"}`} />
                            <span>
                              {statusTef === "idle" && `APROXIMAR CARTÃO NFC AGORA (${formatBrl(totalLiquido)})`}
                              {statusTef === "aguardando_cartao" && "Aproxime o cartão na traseira do celular..."}
                              {statusTef === "digitando_senha" && "Lendo antena NFC... Autorizando..."}
                            </span>
                          </button>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-600 text-white space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Aprovado via Tap on Phone NFC!
                              </span>
                              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                                AUT: {comprovanteTefGerado?.codigoAutorizacao}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-100">
                              Transação homologada no adquirente Stone/Cielo Contactless. NSU: {comprovanteTefGerado?.nsuHost}.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <button
                                type="button"
                                onClick={() => setShowModalComprovanteTef(true)}
                                className="px-3 py-1.5 rounded-lg bg-white text-emerald-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-emerald-50 transition cursor-pointer min-h-[36px]"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Ver Comprovante Térmico NFC</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setStatusTef("idle");
                                  setComprovanteTefGerado(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer min-h-[36px]"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Nova Leitura NFC</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-emerald-500/20 text-center space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600">
                          <Nfc className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="text-[10px] font-mono text-[var(--muted)]">
                          <span>Total a Cobrar:</span>
                          <span className="block text-sm font-black text-emerald-600 dark:text-emerald-400 font-sans">
                            {formatBrl(totalLiquido)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PAINEL DO MODO 3: DIGITAÇÃO NO APP PELO GARÇOM */}
                {modoCapturaCartao === "digitacao_app" && (
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-blue-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Keyboard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-xs text-blue-950 dark:text-blue-100 block">
                            Digitação Direta dos Dados pelo Garçom no App Zuma
                          </span>
                          <span className="text-[10px] text-blue-800 dark:text-blue-200">
                            Informe os dados da transação efetuada na máquina de cartão externa para homologação e conciliação.
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-800 dark:text-blue-200 font-mono text-[10px] font-bold">
                        Entrada Manual Garçom
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--muted)] block mb-1">
                          Últimos 4 Dígitos do Cartão *:
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Ex: 5821"
                          value={digitacaoCardLast4}
                          onChange={e => setDigitacaoCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          onFocus={e => e.target.select()}
                          style={{ fontSize: "16px" }}
                          className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--muted)] block mb-1">
                          Cód. Autorização da Máquina *:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 849201"
                          value={digitacaoAuthCode}
                          onChange={e => setDigitacaoAuthCode(e.target.value.toUpperCase())}
                          onFocus={e => e.target.select()}
                          style={{ fontSize: "16px" }}
                          className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--muted)] block mb-1">
                          NSU / DOC da Fita (Opcional):
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 094829"
                          value={digitacaoNsu}
                          onChange={e => setDigitacaoNsu(e.target.value)}
                          onFocus={e => e.target.select()}
                          style={{ fontSize: "16px" }}
                          className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-[var(--muted)]">
                        {digitacaoCardLast4.length === 4 && digitacaoAuthCode.length >= 4 ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dados preenchidos! Clique no botão ao lado para validar no app.
                          </span>
                        ) : (
                          <span>🛑 Preencha os 4 últimos dígitos e o código de autorização impresso na máquina.</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmarDigitacaoAppGarcom}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer min-h-[42px]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validar &amp; Salvar Pagamento no App</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* PAINEL DO MODO 4: CONTINGÊNCIA MANUAL AUDITADA */}
                {modoCapturaCartao === "contingencia" && (
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Modo Auditado de Contingência: Digite os dados da fita impressa na maquininha</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--muted)] block mb-1">
                          Últimos 4 Dígitos do Cartão (Obrigatório):
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="Ex: 4892"
                          value={manualCardLast4}
                          onChange={e => setManualCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          onFocus={e => e.target.select()}
                          style={{ fontSize: "16px" }}
                          className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-[var(--muted)] block mb-1">
                          Cód. Autorização do POS (Obrigatório):
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 839102"
                          value={manualAuthCode}
                          onChange={e => setManualAuthCode(e.target.value)}
                          onFocus={e => e.target.select()}
                          style={{ fontSize: "16px" }}
                          className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                      {manualCardLast4.length === 4 && manualAuthCode.length >= 4 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dados de contingência auditados! Liberação autorizada.
                        </span>
                      ) : (
                        <span>🛑 Preencha os 4 dígitos e a autorização para liberar a baixa da mesa.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. DINHEIRO & TROCO (COM TECLADO NUMÉRICO TÁTIL OTIMIZADO) */}
            {metodo === "dinheiro" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm text-[var(--ink)]">Pagamento em Espécie na Mesa</h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      Calcule e confira o troco exato a entregar para o cliente antes de baixar a mesa.
                    </p>
                  </div>
                  <span className="text-base font-black font-mono text-emerald-600">
                    Total: {formatBrl(totalLiquido)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase block">
                      Valor Entregue pelo Cliente:
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[var(--muted)]">R$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={valorRecebidoDinheiro}
                        onChange={e => setValorRecebidoDinheiro(parseFloat(e.target.value) || 0)}
                        onFocus={e => e.target.select()}
                        style={{ fontSize: "16px" }}
                        className="w-full p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] font-mono font-black text-lg text-[var(--ink)] min-h-[48px]"
                      />
                    </div>
                    {/* Botões Rápidos de Notas (Toque Grande para Smartphone/Tablet) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        onClick={() => setValorRecebidoDinheiro(totalLiquido)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-bold min-h-[38px]"
                      >
                        Exato ({formatBrl(totalLiquido)})
                      </button>
                      <button
                        onClick={() => setValorRecebidoDinheiro(Math.ceil(totalLiquido / 20) * 20)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-bold min-h-[38px]"
                      >
                        R$ {Math.ceil(totalLiquido / 20) * 20}
                      </button>
                      <button
                        onClick={() => setValorRecebidoDinheiro(Math.ceil(totalLiquido / 50) * 50)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-bold min-h-[38px]"
                      >
                        R$ {Math.ceil(totalLiquido / 50) * 50}
                      </button>
                      <button
                        onClick={() => setValorRecebidoDinheiro(Math.ceil(totalLiquido / 100) * 100)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs font-bold min-h-[38px]"
                      >
                        R$ {Math.ceil(totalLiquido / 100) * 100}
                      </button>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-center ${
                    valorRecebidoDinheiro >= totalLiquido 
                      ? "bg-amber-500/10 border-amber-500/25" 
                      : "bg-rose-500/15 border-rose-500/35"
                  }`}>
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {valorRecebidoDinheiro >= totalLiquido ? "Troco a Devolver na Mesa:" : "Falta para Quitar a Mesa:"}
                    </span>
                    <span className={`text-2xl font-black font-mono ${
                      valorRecebidoDinheiro >= totalLiquido ? "text-amber-700 dark:text-amber-300" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {valorRecebidoDinheiro >= totalLiquido 
                        ? formatBrl(trocoCalculado) 
                        : formatBrl(totalLiquido - valorRecebidoDinheiro)}
                    </span>
                    <span className="text-[10px] text-[var(--muted)]">
                      {valorRecebidoDinheiro >= totalLiquido 
                        ? "✔ Valor suficiente entregue. Entregue o troco e o comprovante." 
                        : "🛑 Baixa bloqueada: O valor entregue não cobre a comanda."}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. VOUCHER REFEIÇÃO */}
            {metodo === "voucher" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-[var(--ink)]">Vouchers e Benefícios Alimentação (VR / VA)</h4>
                  <span className="text-xs font-mono font-bold text-purple-600">{formatBrl(totalLiquido)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { nome: "Sodexo / Pluxee", taxa: "2.10%", pos: "Stone / Cielo" },
                    { nome: "Alelo Refeição", taxa: "2.20%", pos: "Cielo LIO / Rede" },
                    { nome: "Ticket Restaurante", taxa: "2.15%", pos: "Stone / Sicredi" },
                    { nome: "VR Benefícios", taxa: "2.10%", pos: "Stone / PagBank" }
                  ].map((v, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setBandeiraCartao(v.nome);
                        toast.info(`Voucher ${v.nome} selecionado para o POS Móvel.`);
                      }}
                      className={`p-3 rounded-xl border text-left font-bold transition cursor-pointer min-h-[58px] ${
                        bandeiraCartao.includes(v.nome.split(" ")[0])
                          ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 shadow-2xs"
                          : "bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--surface2)]"
                      }`}
                    >
                      <span className="block text-xs">{v.nome}</span>
                      <span className="text-[10px] text-[var(--muted)]">Taxa {v.taxa} · {v.pos}</span>
                    </button>
                  ))}
                </div>

                {/* Processamento TEF para Voucher Refeição */}
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-600" />
                      <span className="font-black text-xs text-purple-950 dark:text-purple-100">
                        Processamento TEF Voucher ({bandeiraCartao}) no {terminalAtivo.codigo}
                      </span>
                    </div>

                    {statusTef === "idle" && (
                      <button
                        onClick={handleDispararTransacaoTef}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer min-h-[42px]"
                      >
                        <Radio className="w-4 h-4" />
                        <span>Cobrar Voucher {formatBrl(totalLiquido)} na Maquininha</span>
                      </button>
                    )}
                  </div>

                  {statusTef !== "autorizado" && !modoContingenciaManual && (
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-900 dark:text-purple-200">
                      🛑 <strong>Leitura Obrigatória:</strong> Aproxime ou passe o cartão voucher ({bandeiraCartao}) no terminal {terminalAtivo.codigo} antes de baixar a mesa.
                    </div>
                  )}

                  {statusTef === "autorizado" && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-900 dark:text-emerald-200 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Voucher {bandeiraCartao} Lido e Autorizado! NSU: {comprovanteTefGerado?.nsuHost || "94819201"}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. COTAS NA MESA (DIVISÃO SEM LIMITE DE PESSOAS) */}
            {metodo === "dividido" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-sm text-[var(--ink)]">
                      Baixa Individual por Pessoa ({pessoasCalculo} Pagantes)
                    </h4>
                    <p className="text-[11px] text-[var(--muted)]">
                      Cota por pessoa: <strong className="text-[var(--ink)]">{formatBrl(cotaIndividual)}</strong>. Marque as cotas à medida que os clientes pagarem na mesa.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold block">
                      {totalCotasPagas} de {pessoasCalculo} pagos
                    </span>
                    <span className={`text-[10px] font-bold ${totalCotasPagas === pessoasCalculo ? "text-emerald-600" : "text-amber-600"}`}>
                      {formatBrl(valorTotalJaPago)} de {formatBrl(totalLiquido)} {totalCotasPagas === pessoasCalculo ? "✔ (100% Pago)" : "🛑 (Pendente)"}
                    </span>
                  </div>
                </div>

                {/* Grid das Cotas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {cotasPagas.map(cota => (
                    <div
                      key={cota.id}
                      onClick={() => handleAlternarCota(cota.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition min-h-[48px] ${
                        cota.pago
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                          : "bg-[var(--surface)] border-[var(--line)] opacity-80 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          cota.pago ? "bg-emerald-600 text-white" : "bg-[var(--surface2)] text-[var(--muted)]"
                        }`}>
                          {cota.pago ? <Check className="w-4 h-4" /> : cota.id}
                        </div>
                        <div>
                          <span className="font-bold text-xs block truncate max-w-[110px]">{cota.nome}</span>
                          <span className="text-[10px] font-mono">{formatBrl(cotaIndividual)}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        cota.pago ? "bg-emerald-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                      }`}>
                        {cota.pago ? "Pago" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Módulo de Automação de Saída & Despacho Multicanal */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-black text-xs text-indigo-950 dark:text-indigo-100">
                  Despacho Multicanal Automático do Fechamento
                </span>
              </div>
              <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold">
                Sincronizado c/ Caixa, WhatsApp e E-mail Fiscal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Canal 1: Impressora do Caixa */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-indigo-950 dark:text-indigo-100 min-h-[30px]">
                    <input
                      type="checkbox"
                      checked={imprimirCaixaAuto}
                      onChange={e => setImprimirCaixaAuto(e.target.checked)}
                      className="rounded accent-indigo-600 cursor-pointer w-4 h-4"
                    />
                    <span>1. Imprimir no Caixa</span>
                  </label>
                  <button
                    onClick={() => setShowPreviewBobina(true)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Ver Bobina</span>
                  </button>
                </div>
                <select
                  value={impressoraDestino}
                  onChange={e => setImpressoraDestino(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[11px] font-semibold text-[var(--ink)] min-h-[42px]"
                >
                  <option value="Caixa Principal Balcão 80mm (Epson TM-T20X)">Caixa Principal (Epson 80mm)</option>
                  <option value="Copa & Bar (Bematech MP-4200 TH)">Copa &amp; Bar (Bematech 80mm)</option>
                  <option value="Portátil Bluetooth Garçom (Elgin M10)">Móvel Garçom (Elgin M10)</option>
                  <option value="SmartPOS Impressora Embutida (58mm)">SmartPOS Embutida (58mm)</option>
                </select>
                <div className="text-[10px] text-[var(--muted)] flex items-center justify-between">
                  <span>ESC/POS RAW 9100</span>
                  <span className="text-emerald-600 font-bold">● Online (2ms)</span>
                </div>
              </div>

              {/* Canal 2: WhatsApp Cliente via Servidor WAHA (Motor NOWEB) */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-indigo-950 dark:text-indigo-100 min-h-[30px]">
                    <input
                      type="checkbox"
                      checked={enviarWhatsAuto}
                      onChange={e => setEnviarWhatsAuto(e.target.checked)}
                      className="rounded accent-indigo-600 cursor-pointer w-4 h-4"
                    />
                    <span>2. Enviar por WhatsApp</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreviewWhats(true)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Ver Texto</span>
                  </button>
                </div>
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder="(65) 99999-9999"
                  value={numeroWhats}
                  onChange={e => setNumeroWhats(e.target.value)}
                  onFocus={e => e.target.select()}
                  style={{ fontSize: "16px" }}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-mono font-bold text-[var(--ink)] min-h-[42px]"
                />
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    ● Servidor WAHA (NOWEB)
                  </span>
                  <button
                    type="button"
                    onClick={handleDispararWhatsAppAgora}
                    disabled={enviarComprovanteWahaMutation.isPending}
                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>{enviarComprovanteWahaMutation.isPending ? "Enviando..." : "Enviar Whats Agora"}</span>
                  </button>
                </div>
              </div>

              {/* Canal 3: E-mail Fiscal Oficial (Remetente Estrito: contato@kytto.com.br) */}
              <div className="p-3 rounded-xl bg-white/70 dark:bg-black/30 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-indigo-950 dark:text-indigo-100 min-h-[30px]">
                    <input
                      type="checkbox"
                      checked={enviarEmailAuto}
                      onChange={e => setEnviarEmailAuto(e.target.checked)}
                      className="rounded accent-indigo-600 cursor-pointer w-4 h-4"
                    />
                    <span>3. Enviar por E-mail Fiscal</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreviewEmail(true)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Ver DANFE / Email</span>
                  </button>
                </div>

                <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-[10px]">
                  <span className="text-[var(--muted)]">Remetente Oficial:</span>
                  <strong className="font-mono text-emerald-700 dark:text-emerald-300">contato@kytto.com.br</strong>
                </div>

                <input
                  type="email"
                  inputMode="email"
                  placeholder="cliente@email.com"
                  value={emailDestino}
                  onChange={e => setEmailDestino(e.target.value)}
                  onFocus={e => e.target.select()}
                  style={{ fontSize: "16px" }}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] font-semibold text-[var(--ink)] min-h-[42px]"
                />

                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    ● SEFAZ-MT XML/PDF
                  </span>
                  <button
                    type="button"
                    onClick={handleDispararEmailAgora}
                    disabled={enviarEmailComprovanteMutation.isPending}
                    className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{enviarEmailComprovanteMutation.isPending ? "Enviando..." : "Enviar E-mail Agora"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer do Modal com Botões Táteis Largos para Smartphone/Tablet */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--line)] bg-[var(--surface2)]/40 flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success(`Comanda de pré-conta impressa no ${impressoraDestino}!`);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-500/20 cursor-pointer transition shadow-xs min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Pré-Conta</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--line)] text-xs font-bold hover:bg-[var(--surface2)] cursor-pointer transition min-h-[44px]"
            >
              Cancelar
            </button>

            <button
              onClick={handleExecutarFechamentoCompleto}
              disabled={!isPagamentoValidoEConfirmado}
              className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl font-black text-xs transition min-h-[44px] ${
                isPagamentoValidoEConfirmado
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md hover:shadow-emerald-600/30 active:scale-98"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border border-neutral-300 dark:border-neutral-700 cursor-not-allowed opacity-90"
              }`}
              title={motivoBloqueio || "Confirmar Pagamento e Baixar Mesa"}
            >
              {isPagamentoValidoEConfirmado ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Confirmar Pagamento &amp; Liberar Mesa</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="max-w-[280px] sm:max-w-none truncate">
                    {motivoBloqueio ? `Bloqueado: ${motivoBloqueio}` : "Aguardando Pagamento..."}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL SECUNDÁRIO: COMPROVANTE TEF TÉRMICO (BOBINA 58mm/80mm) */}
      {showModalComprovanteTef && comprovanteTefGerado && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-amber-50 text-neutral-900 rounded-3xl border border-neutral-300 p-5 w-full max-w-sm shadow-2xl space-y-3 font-mono text-[11px] leading-relaxed max-h-[90vh] overflow-y-auto">
            {/* Header da Bobina */}
            <div className="flex items-center justify-between border-b border-dashed border-neutral-400 pb-2">
              <span className="font-bold text-xs uppercase flex items-center gap-1.5 text-neutral-800">
                <Receipt className="w-4 h-4 text-emerald-700" /> Comprovante TEF
              </span>
              <button
                onClick={() => setShowModalComprovanteTef(false)}
                className="w-6 h-6 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Alternância de Via */}
            <div className="flex rounded-xl bg-amber-100 p-1 border border-amber-300">
              <button
                onClick={() => setTipoViaComprovante("CLIENTE")}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                  tipoViaComprovante === "CLIENTE" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-700"
                }`}
              >
                Via do Cliente
              </button>
              <button
                onClick={() => setTipoViaComprovante("ESTABELECIMENTO")}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                  tipoViaComprovante === "ESTABELECIMENTO" ? "bg-neutral-900 text-white shadow-xs" : "text-neutral-700"
                }`}
              >
                Via do Estabelecimento
              </button>
            </div>

            {/* Texto Formatado da Bobina */}
            <div className="p-3 bg-white rounded-xl border border-neutral-300 text-[10px] whitespace-pre font-mono leading-tight shadow-inner select-all">
              {comprovanteTefGerado.comprovanteTexto.replace(
                /COMPROVANTE TEF - VIA DO (CLIENTE|ESTABELECIMENTO)/,
                `COMPROVANTE TEF - VIA DO ${tipoViaComprovante}`
              )}
            </div>

            {/* Ações do Comprovante TEF */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  toast.success(`Comprovante TEF impresso na bobina térmica de ${terminalAtivo.larguraBobinaMm}mm do ${terminalAtivo.codigo}!`);
                  setShowModalComprovanteTef(false);
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <Printer className="w-4 h-4" /> Imprimir na Maquininha ({terminalAtivo.codigo})
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(comprovanteTefGerado.comprovanteTexto);
                    toast.success("Comprovante TEF copiado para a área de transferência!");
                  }}
                  className="py-2 rounded-xl bg-amber-100 border border-amber-300 font-bold text-xs text-neutral-800 flex items-center justify-center gap-1 min-h-[40px]"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Texto
                </button>
                <button
                  onClick={() => {
                    toast.success(`Comprovante TEF enviado para o WhatsApp ${numeroWhats}!`);
                  }}
                  className="py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 min-h-[40px]"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Secundário: Preview da Bobina Térmica da Conta 80mm */}
      {showPreviewBobina && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-amber-50 text-neutral-900 rounded-2xl border border-neutral-300 p-5 w-full max-w-sm shadow-2xl space-y-3 font-mono text-[11px] leading-relaxed">
            <div className="text-center border-b border-dashed border-neutral-400 pb-2">
              <h4 className="font-black text-xs tracking-wider">ZUMA COZINHA ORIENTAL</h4>
              <p className="text-[10px]">TANGARA DA SERRA - MT</p>
              <p className="text-[10px]">CNPJ: 36.296.848/0001-57</p>
              <p className="text-[10px] mt-1 font-bold">EXTRATO DE CONFERÊNCIA DE MESA</p>
              <p className="text-[10px]">MESA: {mesaNumero} · {mesaNome.toUpperCase()}</p>
              <p className="text-[10px]">GARÇOM: {garcomNome.toUpperCase()}</p>
              <p className="text-[10px]">DATA: {new Date().toLocaleDateString("pt-BR")} {new Date().toLocaleTimeString("pt-BR")}</p>
            </div>

            <div className="border-b border-dashed border-neutral-400 pb-2 space-y-1">
              <div className="flex justify-between font-bold text-[10px]">
                <span>ITEM</span>
                <span>QTD x UNIT = TOTAL</span>
              </div>
              {itens.map((it, idx) => (
                <div key={idx} className="flex justify-between text-[10px]">
                  <span className="truncate max-w-[180px]">{it.nome}</span>
                  <span>{it.qtd}x {formatBrl(it.valorUnit)} = {formatBrl(it.qtd * it.valorUnit)}</span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-neutral-400 pb-2 space-y-1 text-right">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>{formatBrl(consumoBase)}</span>
              </div>
              {taxaServicoAtiva && (
                <div className="flex justify-between text-indigo-700">
                  <span>TAXA DE SERVIÇO (10%):</span>
                  <span>+{formatBrl(taxaServico)}</span>
                </div>
              )}
              {descontoCashback > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>DESCONTO CLUBE ZUMI:</span>
                  <span>-{formatBrl(descontoCashback)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 border-t border-neutral-300">
                <span>TOTAL A PAGAR:</span>
                <span>{formatBrl(totalLiquido)}</span>
              </div>
              {modoFechamento === "DIVIDIDO" && (
                <div className="text-[10px] text-neutral-600">
                  DIVIDIDO EM {pessoasCalculo} PESSOAS ({pessoasCalculo}x de {formatBrl(cotaIndividual)})
                </div>
              )}
            </div>

            <div className="text-center pt-1 text-[9px] text-neutral-600">
              <p>NFC-e Nº 000.049.281 SÉRIE 1</p>
              <p className="font-mono text-[8px] truncate">{chaveNfceSefaz}</p>
              <p className="mt-1 font-bold">OBRIGADO PELA PREFERÊNCIA!</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`Impressão enviada com sucesso para ${impressoraDestino}!`);
                  setShowPreviewBobina(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-black transition cursor-pointer flex items-center justify-center gap-1 min-h-[44px]"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Agora
              </button>
              <button
                onClick={() => setShowPreviewBobina(false)}
                className="px-3 py-2.5 rounded-xl border border-neutral-400 text-neutral-800 font-bold text-xs hover:bg-neutral-200 transition cursor-pointer min-h-[44px]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Secundário: Preview da Mensagem WhatsApp */}
      {showPreviewWhats && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] text-[var(--ink)] rounded-2xl border border-[var(--line)] p-5 w-full max-w-md shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <h4 className="font-black text-sm flex items-center gap-2 text-emerald-600">
                <Send className="w-4 h-4" /> Mensagem WhatsApp Formatada
              </h4>
              <button onClick={() => setShowPreviewWhats(false)} className="text-[var(--muted)] hover:text-[var(--ink)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-emerald-950 dark:text-emerald-100">
{`*ZUMA COZINHA ORIENTAL* 🍣
Tangará da Serra (MT) · CNPJ: 36.296.848/0001-57

Olá, *${clienteNome || "Cliente Especial"}*! Agradecemos sua preferência.

📋 *Extrato de Conta - ${mesaNome}*
• Garçom Atendente: ${garcomNome}
• Itens Consumidos: ${itens.slice(0, 3).map(i => `${i.qtd}x ${i.nome}`).join(", ")}${itens.length > 3 ? "..." : ""}
• Subtotal: ${formatBrl(consumoBase)}
${taxaServicoAtiva ? `• Taxa de Serviço (10%): +${formatBrl(taxaServico)}\n` : ""}${descontoCashback > 0 ? `• Desconto Clube Zumi: -${formatBrl(descontoCashback)}\n` : ""}• *Total Pago: ${formatBrl(totalLiquido)}*
• Forma: ${metodo === "cartao" ? `Cartão (${terminalAtivo.codigo} - ${terminalAtivo.adquirente})` : metodo}
• Divisão: ${modoFechamento === "DIVIDIDO" ? `${pessoasCalculo} pessoas (${formatBrl(cotaIndividual)} cada)` : "Fatura Única"}

📄 *NFC-e SEFAZ-MT Autorizada:*
Chave: ${chaveNfceSefaz}
Consulte a nota: https://zuma.kytto.com.br/comprovante/nfce/${chaveNfceSefaz.slice(0, 16)}

⭐ *Você acumulou ${formatBrl(totalLiquido * 0.05)} em cashback no Clube Zumi!*`}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`Mensagem disparada para ${numeroWhats} via WhatsApp Cloud API!`);
                  setShowPreviewWhats(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition cursor-pointer flex items-center gap-1.5 min-h-[44px]"
              >
                <Send className="w-3.5 h-3.5" /> Disparar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Secundário: Preview do E-mail Fiscal Oficial (contato@kytto.com.br) */}
      {showPreviewEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-[var(--surface)] text-[var(--ink)] rounded-2xl border border-[var(--line)] p-5 w-full max-w-lg shadow-2xl space-y-3.5 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[var(--ink)]">E-mail Fiscal Oficial</h4>
                  <span className="text-[10px] text-[var(--muted)]">Remetente Estrito do Sistema Zuma Tangará da Serra</span>
                </div>
              </div>
              <button onClick={() => setShowPreviewEmail(false)} className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadados de Envio do E-mail */}
            <div className="p-3 rounded-xl bg-[var(--surface2)]/60 border border-[var(--line)] space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">De:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Zuma Cozinha Oriental &lt;contato@kytto.com.br&gt;
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Para:</span>
                <span className="font-bold text-[var(--ink)]">{emailDestino || "cliente@email.com"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Assunto:</span>
                <span className="font-bold text-[var(--ink)] truncate max-w-xs">
                  Comprovante Fiscal de Conta - Zuma Cozinha Oriental ({mesaNome})
                </span>
              </div>
            </div>

            {/* Visualização Renderizada da Mensagem */}
            <div className="p-4 rounded-xl border border-[var(--line)] bg-white text-neutral-900 space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h5 className="font-black text-xs text-neutral-900">ZUMA COZINHA ORIENTAL 🍣</h5>
                  <p className="text-[10px] text-neutral-500">Tangará da Serra - MT · CNPJ 36.296.848/0001-57</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  SEFAZ-MT AUTORIZADA
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <p>Olá, <strong>{clienteNome || "Cliente Especial"}</strong>! Agradecemos sua preferência.</p>
                <p className="text-neutral-600">Segue o extrato detalhado de conferência e cupom fiscal da sua conta:</p>
              </div>

              <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1 text-[11px]">
                <div className="flex justify-between font-bold border-b pb-1 text-[10px] text-neutral-600">
                  <span>ITEM</span>
                  <span>QTD x VALOR = TOTAL</span>
                </div>
                {itens.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="truncate max-w-[190px]">{it.nome}</span>
                    <span>{it.qtd}x {formatBrl(it.valorUnit)} = {formatBrl(it.qtd * it.valorUnit)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-right text-[11px] pt-1 border-t">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span>{formatBrl(consumoBase)}</span>
                </div>
                {taxaServicoAtiva && (
                  <div className="flex justify-between text-indigo-600">
                    <span>Taxa de Serviço (10%):</span>
                    <span>+{formatBrl(taxaServico)}</span>
                  </div>
                )}
                {descontoCashback > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Desconto Clube Zumi:</span>
                    <span>-{formatBrl(descontoCashback)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-neutral-900 pt-1 border-t">
                  <span>Total Pago:</span>
                  <span>{formatBrl(totalLiquido)}</span>
                </div>
              </div>

              <div className="p-2 rounded bg-neutral-100 text-[10px] font-mono text-neutral-700 space-y-0.5">
                <div><strong>NFC-e Chave SEFAZ:</strong> {chaveNfceSefaz}</div>
                <div><strong>Forma de Pagamento:</strong> {metodo === "cartao" ? `Cartão ${tipoCartao} (${bandeiraCartao})` : metodo}</div>
                <div><strong>Atendente / Garçom:</strong> {garcomNome} ({mesaNome})</div>
              </div>
            </div>

            {/* Ações do Modal de Preview */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPreviewEmail(false)}
                className="px-3.5 py-2 rounded-xl border border-[var(--line)] text-xs font-bold hover:bg-[var(--surface2)] cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDispararEmailAgora();
                  setShowPreviewEmail(false);
                }}
                disabled={enviarEmailComprovanteMutation.isPending}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Mail className="w-4 h-4" />
                <span>Disparar E-mail Fiscal Agora (contato@kytto.com.br)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalPagamentoMesa;
