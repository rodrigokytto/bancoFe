import React, { useState } from "react";
import { trpc } from "../lib/trpc";
import { Calendar, Users, Clock, CheckCircle2, AlertCircle, Plus, Send, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface Reservation {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  time: string;
  tableNum: string;
  status: "confirmada" | "pendente" | "sentado" | "finalizada";
  notes?: string;
}

interface WaitlistGroup {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  waitingMinutes: number;
  called: boolean;
}

export const ReservasFila: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([
    { id: "r1", name: "Dra. Mariana Costa", phone: "(65) 99611-3421", partySize: 4, time: "19:30", tableNum: "Mesa 04", status: "confirmada", notes: "Aniversário (pedir sobremesa com vela)" },
    { id: "r2", name: "Henrique Vasconcelos", phone: "(65) 99982-1144", partySize: 2, time: "20:00", tableNum: "Mesa 08", status: "confirmada", notes: "Mesa perto da janela" },
    { id: "r3", name: "Patrícia Mendonça", phone: "(65) 99877-5532", partySize: 6, time: "20:30", tableNum: "Mesa 12", status: "pendente", notes: "Família com criança pequena" },
    { id: "r4", name: "Carlos Eduardo Silva", phone: "(65) 99923-8890", partySize: 2, time: "21:00", tableNum: "Mesa 02", status: "confirmada" },
    { id: "r5", name: "Luciana Guimarães", phone: "(65) 99645-7711", partySize: 5, time: "21:30", tableNum: "Mesa 06", status: "confirmada", notes: "Comemoração de promoção" }
  ]);

  const [waitlist, setWaitlist] = useState<WaitlistGroup[]>([
    { id: "w1", name: "Felipe Nogueira", phone: "(65) 99812-4411", partySize: 2, waitingMinutes: 14, called: false },
    { id: "w2", name: "Amanda & Lucas", phone: "(65) 99933-7722", partySize: 4, waitingMinutes: 8, called: false },
    { id: "w3", name: "Roberto Dias", phone: "(65) 99601-9988", partySize: 3, waitingMinutes: 3, called: false }
  ]);

  // Modal de Nova Reserva
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSize, setNewSize] = useState(2);
  const [newTime, setNewTime] = useState("20:00");
  const [newTable, setNewTable] = useState("Mesa 05");
  const [newNotes, setNewNotes] = useState("");

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return toast.error("Preencha nome e telefone.");

    const newRes: Reservation = {
      id: `r-${Date.now()}`,
      name: newName,
      phone: newPhone,
      partySize: newSize,
      time: newTime,
      tableNum: newTable,
      status: "confirmada",
      notes: newNotes || undefined
    };

    setReservations([...reservations, newRes]);
    setShowAddModal(false);
    setNewName("");
    setNewPhone("");
    setNewNotes("");
    toast.success(`Reserva para ${newName} confirmada com sucesso! Mensagem enviada pelo Zumi.`);
  };

  const handleCallWaitlist = (id: string, name: string) => {
    setWaitlist(waitlist.map(w => w.id === id ? { ...w, called: true } : w));
    toast.success(`Zumi chamou ${name} no WhatsApp: "Sua mesa no Zuma já está pronta!"`);
  };

  const handleSeatReservation = (id: string) => {
    setReservations(reservations.map(r => r.id === id ? { ...r, status: "sentado" } : r));
    toast.success("Mesa ocupada. Bom apetite!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
            Salão, Reservas &amp; Fila Inteligente
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] mt-0.5">
            Mesa cheia nos horários certos, sem fila perdida
          </h1>
          <p className="text-sm text-[var(--muted)] max-w-3xl mt-1">
            Confirmação automática de reservas pelo WhatsApp com o Zumi, mapa de ocupação das mesas e chamada rápida da fila de espera sem necessidade de pager físico.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Reserva de Mesa
        </button>
      </div>

      {/* 4 KPIs de Salão */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Reservas de Hoje</span>
          <div className="text-2xl font-display font-extrabold text-[var(--ink)] font-mono-nums mt-1">{reservations.length}</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">
            {reservations.reduce((s, r) => s + r.partySize, 0)} pessoas esperadas
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Mesas Ocupadas</span>
          <div className="text-2xl font-display font-extrabold text-[var(--nori)] font-mono-nums mt-1">11 / 16</div>
          <div className="text-xs text-[var(--nori)] font-medium mt-0.5">68% de lotação no salão agora</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Fila de Espera</span>
          <div className="text-2xl font-display font-extrabold text-[var(--salmon)] font-mono-nums mt-1">{waitlist.length} grupos</div>
          <div className="text-xs text-[var(--muted)] mt-0.5">Média 12 min de espera</div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Taxa de No-Show</span>
          <div className="text-2xl font-display font-extrabold text-[var(--good)] font-mono-nums mt-1">2,1%</div>
          <div className="text-xs text-[var(--good)] font-medium mt-0.5">Zumi confirma 2h antes</div>
        </div>
      </div>

      {/* Grid: Reservas de Hoje + Fila de Espera */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tabela de Reservas */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--salmon)]" />
            Reservas de Hoje no Salão
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--line)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-2.5 pr-3 font-bold">Horário</th>
                  <th className="py-2.5 px-3 font-bold">Cliente</th>
                  <th className="py-2.5 px-3 font-bold text-center">Pessoas</th>
                  <th className="py-2.5 px-3 font-bold">Mesa</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Observações</th>
                  <th className="py-2.5 pl-3 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface2)]/50">
                    <td className="py-3 pr-3 font-bold font-mono-nums text-[var(--ink)]">{r.time}</td>
                    <td className="py-3 px-3">
                      <b className="text-[var(--ink)] block text-xs">{r.name}</b>
                      <span className="font-mono-nums text-[10.5px] text-[var(--muted)]">{r.phone}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono-nums text-[var(--ink)]">
                      {r.partySize}p
                    </td>
                    <td className="py-3 px-3 font-semibold text-[var(--ink)]">{r.tableNum}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === "confirmada"
                          ? "bg-[var(--nori-soft)] text-[var(--nori)]"
                          : r.status === "sentado"
                          ? "bg-[var(--good)] text-white"
                          : "bg-[var(--warn)]/20 text-[var(--warn)]"
                      }`}>
                        {r.status === "confirmada" && "Confirmada (Zumi)"}
                        {r.status === "sentado" && "Na Mesa"}
                        {r.status === "pendente" && "Aguardando"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[var(--muted)] text-[11px]">{r.notes || "—"}</td>
                    <td className="py-3 pl-3 text-right">
                      {r.status !== "sentado" ? (
                        <button
                          onClick={() => handleSeatReservation(r.id)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--salmon)] text-white text-[11px] font-bold hover:brightness-105"
                        >
                          Sentar
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--good)]">Ocupada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fila de Espera em Tempo Real */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--salmon)]" />
              Fila de Espera Digital
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--salmon-soft)] text-[var(--salmon)] font-mono-nums">
              {waitlist.length} aguardando
            </span>
          </div>

          <div className="space-y-3">
            {waitlist.map((w, i) => (
              <div key={w.id} className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface2)] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase">#{i + 1} na fila</span>
                    <b className="text-xs text-[var(--ink)] block">{w.name} ({w.partySize} pessoas)</b>
                    <span className="font-mono-nums text-[10.5px] text-[var(--muted)]">{w.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-nums font-bold text-[var(--salmon)]">{w.waitingMinutes} min</span>
                    <span className="text-[10px] text-[var(--muted)] block">esperando</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCallWaitlist(w.id, w.name)}
                  disabled={w.called}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    w.called
                      ? "bg-[var(--good)] text-white"
                      : "bg-[var(--nori)] text-white hover:brightness-105 shadow-xs"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {w.called ? "Cliente Notificado no WhatsApp" : "Avisar pelo WhatsApp: Mesa Pronta!"}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--muted)] space-y-1">
            <b className="text-[var(--ink)] block">Sem pager físico:</b>
            O cliente pode aguardar no carro, em frente ou passeando. Quando a mesa libera, o Zumi dispara a notificação no WhatsApp com 5 minutos de tolerância.
          </div>
        </div>
      </div>

      {/* Modal Nova Reserva */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--ink)]">Adicionar Reserva de Mesa</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[var(--muted)] hover:text-[var(--ink)] font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleAddReservation} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rodrigo Ribeiro"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="(65) 99999-9999"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Qtd de Pessoas</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newSize}
                    onChange={(e) => setNewSize(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Horário</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                  >
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                    <option value="20:30">20:30</option>
                    <option value="21:00">21:00</option>
                    <option value="21:30">21:30</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[var(--ink)] block mb-1">Mesa Sugerida</label>
                  <select
                    value={newTable}
                    onChange={(e) => setNewTable(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                  >
                    <option value="Mesa 01">Mesa 01 (2p)</option>
                    <option value="Mesa 03">Mesa 03 (4p)</option>
                    <option value="Mesa 05">Mesa 05 (4p)</option>
                    <option value="Mesa 07">Mesa 07 (6p)</option>
                    <option value="Mesa 10">Mesa 10 (8p VIP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[var(--ink)] block mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Aniversário, mesa perto da janela"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--line)] bg-[var(--surface2)] text-xs text-[var(--ink)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] text-xs font-semibold text-[var(--muted)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--salmon)] text-white text-xs font-bold hover:brightness-105"
                >
                  Salvar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
