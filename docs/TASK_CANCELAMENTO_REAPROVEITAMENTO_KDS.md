# Contexto da Tarefa: Alertas de Cancelamento e Reaproveitamento Inteligente de Produção no KDS

## Demanda do Usuário (Rodrigo)
"ao cancelar itens precisa ter alerta sonoro e visual na coziha e caso tenha algum pedido com o msmo item, passar a producao a outro pedido e cancelar o mesmo na comanda original"

## Imagem Anexada
Print da tela `Comanda · Mesa 04` em `https://zuma.kytto.com.br/garcom` com:
- `Combo 26 Peças sushibar` riscado em vermelho (cancelado) com valor original R$ 69,90 riscado.
- Demais itens mantidos: Hot Filadélfia (R$ 31,90) e Coca-Cola Zero (R$ 15,80).
- Total recalculado para R$ 52,47 (excluindo os R$ 69,90).

## Requisitos Técnicos
1. Alerta Sonoro na Cozinha:
   - Novo efeito sonoro de cancelamento / alarme urgente em `kdsAudio.ts` (`playCancellationAlertChime`).
   - Sintetizado com Web Audio API, padrão decrescente de alerta (880Hz -> 659Hz -> 523Hz -> 392Hz).
2. Alerta Visual na Cozinha:
   - Banner / Top Card de alta visibilidade no KDS 2.0 (`/kds-v2`) e KDS 1 (`/kds` / `/cozinha`).
   - Notificação instantânea com detalhes do item, mesa de origem, garçom e motivo.
   - Marcação clara do item como "CANCELADO" com tachado vermelho no ticket da mesa de origem.
3. Reaproveitamento Inteligente de Produção (Zero Desperdício):
   - Ao cancelar um item na mesa original (ex.: Mesa 04):
   - O backend busca se há OUTRO PEDIDO ATIVO (outra mesa, delivery, ifood) na cozinha que tenha o mesmo item aguardando ou em preparo.
   - Se houver:
     - A produção daquele prato é repassada para o pedido de destino.
     - O pedido de destino recebe badge "♻️ Produção Reaproveitada da Mesa XX (Zero Desperdício)".
     - Na comanda original, o item é cancelado, deduzido do total e anotado com o destino do reaproveitamento.
     - O alerta na cozinha e no app do garçom confirma o reaproveitamento com sucesso.
   - Se não houver:
     - O item é cancelado e a cozinha é alertada para interromper o preparo imediatamente.
