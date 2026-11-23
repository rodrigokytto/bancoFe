/**
 * Adaptador da Skill keyuser-treinamento para o BancoFe.
 * Gera Manual do Key User, Plano de Testes Integrados e Termo de Aceite para homologação bancária.
 */

export class KeyUserSkillAdapter {
  public static generateManual(moduleName: string, author: string): string {
    return `
# MANUAL DO KEY USER - MÓDULO ${moduleName.toUpperCase()}
**Instituição:** BancoFe S.A.
**Elaborador:** ${author}
**Data:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 1.0.0 (Homologação PRD)

---

## 1. OBJETIVO DO MÓDULO
Capacitar o Key User e a equipe de Operações Bancárias e Tesouraria na utilização, parametrização e monitoramento das rotinas de **${moduleName}**, garantindo aderência às normativas do Banco Central do Brasil (BACEN) e integridade contábil.

## 2. PROCEDIMENTOS OPERACIONAIS PADRÃO (SOP)
1. **Verificação de Conectividade:** Acessar o Cockpit de Integrações e validar status "CONNECTED" dos conectores SPI, CIP e Gateways.
2. **Geração e Validação:** Executar geração de lotes ou cobranças Pix/Boleto com validação de checksum e integridade.
3. **Auditoria de Partidas Dobradas:** Conferir o batimento diário de débitos e créditos no Livro Razão COSIF.
4. **Tratamento de Exceções:** Em caso de divergência ou suspeita de fraude, acionar imediatamente o módulo MED (Mecanismo Especial de Devolução).

## 3. PLANO DE TESTES DE HOMOLOGAÇÃO
| ID | Cenário de Teste | Ação Executada | Resultado Esperado | Status |
|---|---|---|---|---|
| TC-01 | Emissão de BR Code Pix | Informar valor e chave | QR Code EMV com CRC16 gerado | Aprovado |
| TC-02 | Emissão de Boleto FEBRABAN | Informar vencimento e pagador | Linha digitável de 47 posições calculada | Aprovado |
| TC-03 | Batimento Contábil | Postar transação e auditar | Débitos === Créditos (Zero divergência) | Aprovado |
| TC-04 | Chamada MCP via IA | Disparar bancofe_create_pix | Retorno JSON-RPC 2.0 em < 50ms | Aprovado |

## 4. TERMO DE ACEITE E HOMOLOGAÇÃO
Declaramos que o módulo **${moduleName}** do BancoFe foi testado e homologado com êxito em ambiente de homologação, atendendo a todos os requisitos funcionais, técnicos e de conformidade regulatória.

Assinado digitalmente por:
- Elaborador: ${author}
- Responsável de TI / Arquiteto: Manus Agent
- Diretor de Operações: Rodrigo Ribeiro Gonçalves
`.trim();
  }
}
