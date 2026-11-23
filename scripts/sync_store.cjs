const fs = require('fs');

const dataStoreCode = fs.readFileSync('/home/ubuntu/zuma/server/dataStore.ts', 'utf8');
const match = dataStoreCode.match(/export const TANGARA_E_MT_BAIRROS_EXPANDIDOS: DeliveryNeighborhood\[\] = (\[[\s\S]*?\n\]);/);
if (!match) throw new Error('Could not find TANGARA_E_MT_BAIRROS_EXPANDIDOS');

const neighborhoods = eval(match[1]);
console.log('Extracted neighborhoods:', neighborhoods.length);

let store = JSON.parse(fs.readFileSync('/home/ubuntu/zuma/data/localStore.json', 'utf8'));
store.deliveryNeighborhoods = neighborhoods;

if (!store.customers) store.customers = [];
const existingVip = store.customers.find(c => c.code === 'VIP-01');
if (!existingVip) {
  store.customers.unshift({
    id: 101,
    code: 'VIP-01',
    name: 'Rodrigo Ribeiro Gonçalves',
    phone: '(65) 99812-4401',
    neighborhood: 'Centro',
    address: 'Av. Brasil, 450 - Centro',
    cep: '78300-000',
    cidade: 'Tangará da Serra',
    segment: 'vip',
    isVip: true,
    ordersCount: 28,
    totalSpent: '4250.00',
    daysSinceLastOrder: 0,
    favoriteDish: 'Especial Zuma 68 Peças',
    optIn: true,
    tags: ['VIP', 'Proprietário', 'Frete Grátis Vitalício', 'Gastronomia & Moda']
  });
}

fs.writeFileSync('/home/ubuntu/zuma/data/localStore.json', JSON.stringify(store, null, 2), 'utf8');
console.log('localStore.json successfully updated with', store.deliveryNeighborhoods.length, 'neighborhoods and', store.customers.length, 'customers');
