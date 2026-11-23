import re

def resolve_dataStore():
    with open('server/dataStore.ts', 'r') as f:
        content = f.read()

    # Resolver conflito 2: closeTable
    # Substituir bloco conflitante em closeTable
    # Na main havia a criacao da mesa se ela nao existisse
    # No HEAD ha todo o bloco de calculo avançado
    c2_pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> main', re.DOTALL)
    
    matches = list(c2_pattern.finditer(content))
    print(f"Encontrados {len(matches)} conflitos restantes em dataStore.ts")
    for m in matches:
        full = m.group(0)
        head_part = m.group(1)
        main_part = m.group(2)
        
        if "closeTable" in main_part:
            # Em closeTable: queremos o head_part, mas se a mesa não existir podemos criá-la
            fallback = '''    let table = this.data.tables.find(t => t.tableNumber === tableNumber);
    if (!table) {
      table = {
        tableNumber,
        name: `Mesa ${String(tableNumber).padStart(2, "0")}`,
        capacity: 4,
        status: "ocupada",
        orderItems: [],
        subtotal: 0,
        serviceFeePercent: 10,
        total: 0,
      };
      this.data.tables.push(table);
    }'''
            # Substitui o "const table = this.data.tables.find(t => t.tableNumber === tableNumber);\n    if (!table) throw new Error("Mesa não encontrada");" do head pelo fallback
            resolved_head = head_part.replace(
                'const table = this.data.tables.find(t => t.tableNumber === tableNumber);\n    if (!table) throw new Error("Mesa não encontrada");',
                fallback
            )
            content = content.replace(full, resolved_head)
        elif "logWebhook" in main_part:
            # Em fechamento_comanda: manter ambos logAuditEvent e logWebhook
            both = head_part + "\n    // Registra webhook de auditoria em tempo real\n" + main_part
            content = content.replace(full, both)
        else:
            # Por padrão manter head_part
            content = content.replace(full, head_part)

    with open('server/dataStore.ts', 'w') as f:
        f.write(content)
    print("server/dataStore.ts resolvido!")

def resolve_zumaRouter():
    with open('server/routers/zumaRouter.ts', 'r') as f:
        content = f.read()

    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> main', re.DOTALL)
    match = pattern.search(content)
    if match:
        head_part = match.group(1)
        main_part = match.group(2)
        # Queremos AMBOS os endpoints: os da HEAD e os da main!
        both = head_part + "\n\n  " + main_part
        content = pattern.sub(both, content)
        with open('server/routers/zumaRouter.ts', 'w') as f:
            f.write(content)
        print("server/routers/zumaRouter.ts resolvido!")

def resolve_localStore():
    # Em localStore.json, usar a versão da HEAD (que tem os dados reais e completos)
    with open('data/localStore.json', 'r') as f:
        content = f.read()
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> main', re.DOTALL)
    match = pattern.search(content)
    if match:
        head_part = match.group(1)
        content = pattern.sub(head_part, content)
        with open('data/localStore.json', 'w') as f:
            f.write(content)
        print("data/localStore.json resolvido!")

if __name__ == '__main__':
    resolve_dataStore()
    resolve_zumaRouter()
    resolve_localStore()
