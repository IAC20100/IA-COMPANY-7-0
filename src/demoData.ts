import { v4 as uuidv4 } from 'uuid';
import { Client, Product, Ticket, Quote, Receipt, Cost, Appointment, ChecklistItem } from './store';

const client1Id = uuidv4();
const client2Id = uuidv4();
const client3Id = uuidv4();

export const demoClients: Client[] = [
  {
    id: client1Id,
    name: 'Condomínio Residencial das Flores',
    document: '12.345.678/0001-90',
    contactPerson: 'João Silva (Síndico)',
    phone: '(11) 98765-4321',
    email: 'sindico@resdasflores.com.br',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    notes: 'Cliente VIP, atendimento prioritário.'
  },
  {
    id: client2Id,
    name: 'Edifício Comercial Paulista',
    document: '98.765.432/0001-10',
    contactPerson: 'Maria Oliveira (Gerente Predial)',
    phone: '(11) 91234-5678',
    email: 'gerencia@edpaulista.com.br',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  },
  {
    id: client3Id,
    name: 'Shopping Center Sul',
    document: '45.678.901/0001-23',
    contactPerson: 'Carlos Santos (Manutenção)',
    phone: '(11) 99999-8888',
    email: 'manutencao@shoppingsul.com.br',
    address: 'Av. das Nações Unidas, 5000 - Santo Amaro, São Paulo - SP',
  }
];

export const demoProducts: Product[] = [
  { id: uuidv4(), code: 'PRD-001', name: 'Contatora 220V 32A', description: 'Contatora tripolar para motores', price: 150.00, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-002', name: 'Disjuntor Bipolar 20A', description: 'Disjuntor termomagnético curva C', price: 45.50, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-003', name: 'Cabo Flexível 2.5mm', description: 'Cabo de cobre isolado 750V', price: 180.00, unit: 'RL' },
  { id: uuidv4(), code: 'PRD-004', name: 'Lâmpada LED Tubular 18W', description: 'Lâmpada LED T8 120cm', price: 25.00, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-005', name: 'Fita Isolante 3M', description: 'Fita isolante preta 20m', price: 8.90, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-006', name: 'Rele Falta de Fase', description: 'Rele de proteção para motores trifásicos', price: 120.00, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-007', name: 'Bóia Elétrica', description: 'Chave bóia para caixa d\'água', price: 65.00, unit: 'UN' },
  { id: uuidv4(), code: 'PRD-008', name: 'Filtro de Ar Condicionado', description: 'Filtro para split 9000 BTUs', price: 35.00, unit: 'UN' },
];

export const demoChecklistItems: ChecklistItem[] = [
  { id: uuidv4(), task: 'Verificar extintores (Validade e Pressão)', category: 'Segurança' },
  { id: uuidv4(), task: 'Testar luzes de emergência', category: 'Segurança' },
  { id: uuidv4(), task: 'Limpeza da caixa d\'água', category: 'Hidráulica' },
  { id: uuidv4(), task: 'Verificar bombas de recalque', category: 'Hidráulica' },
  { id: uuidv4(), task: 'Revisão do quadro elétrico principal', category: 'Elétrica' },
  { id: uuidv4(), task: 'Medir tensão e corrente dos circuitos', category: 'Elétrica' },
  { id: uuidv4(), task: 'Lubrificação de portões da garagem', category: 'Mecânica' },
  { id: uuidv4(), task: 'Verificar ruídos nos elevadores', category: 'Mecânica' },
];

const today = new Date();
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const lastWeek = new Date(today); lastWeek.setDate(lastWeek.getDate() - 7);
const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const demoTickets: Ticket[] = [
  {
    id: uuidv4(),
    title: 'Portão da garagem não fecha',
    type: 'CORRETIVA',
    status: 'REALIZANDO',
    clientId: client1Id,
    date: formatDate(today),
    technician: 'Carlos Silva',
    observations: 'Cliente relatou que o portão trava na metade do curso.',
    reportedProblem: 'Portão eletrônico da garagem travando.',
    productsForQuote: 'Possível necessidade de troca da placa de comando.',
    serviceReport: 'Em análise. Motor apresenta superaquecimento.',
  },
  {
    id: uuidv4(),
    title: 'Manutenção Preventiva Mensal',
    type: 'PREVENTIVA',
    status: 'APROVADO',
    clientId: client2Id,
    date: formatDate(tomorrow),
    technician: 'Roberto Alves',
    observations: 'Realizar checklist completo do mês de Março.',
    checklistResults: demoChecklistItems.map(item => ({
      taskId: item.id,
      status: 'OK',
      notes: ''
    }))
  },
  {
    id: uuidv4(),
    title: 'Troca de lâmpadas do hall',
    type: 'CORRETIVA',
    status: 'CONCLUIDO',
    clientId: client1Id,
    date: formatDate(yesterday),
    technician: 'Carlos Silva',
    observations: 'Serviço executado com sucesso.',
    reportedProblem: 'Lâmpadas do hall de entrada queimadas.',
    productsForQuote: '',
    serviceReport: 'Foram substituídas 5 lâmpadas LED tubulares. Sistema funcionando perfeitamente.',
  },
  {
    id: uuidv4(),
    title: 'Vazamento na casa de bombas',
    type: 'CORRETIVA',
    status: 'AGUARDANDO_MATERIAL',
    clientId: client3Id,
    date: formatDate(today),
    technician: 'Marcos Paulo',
    observations: 'Aguardando aprovação do orçamento das peças.',
    reportedProblem: 'Vazamento intenso no registro geral da casa de bombas.',
    productsForQuote: '1x Registro de Gaveta 2", 2x Luvas de PVC, Fita Veda Rosca.',
    serviceReport: 'Registro danificado. Necessário substituição urgente.',
  }
];

export const demoQuotes: Quote[] = [
  {
    id: uuidv4(),
    clientId: client3Id,
    date: formatDate(today),
    status: 'SENT',
    items: [
      { id: uuidv4(), description: 'Registro de Gaveta 2"', quantity: 1, unitPrice: 150.00, total: 150.00 },
      { id: uuidv4(), description: 'Luva de PVC 2"', quantity: 2, unitPrice: 25.00, total: 50.00 },
      { id: uuidv4(), description: 'Mão de obra especializada', quantity: 1, unitPrice: 350.00, total: 350.00 },
    ],
    totalValue: 550.00
  },
  {
    id: uuidv4(),
    clientId: client1Id,
    date: formatDate(lastWeek),
    status: 'APPROVED',
    items: [
      { id: uuidv4(), description: 'Lâmpada LED Tubular 18W', quantity: 5, unitPrice: 25.00, total: 125.00 },
      { id: uuidv4(), description: 'Mão de obra', quantity: 1, unitPrice: 150.00, total: 150.00 },
    ],
    totalValue: 275.00
  }
];

export const demoReceipts: Receipt[] = [
  { id: uuidv4(), clientId: client1Id, date: formatDate(yesterday), value: 275.00, description: 'Pagamento referente à troca de lâmpadas' },
  { id: uuidv4(), clientId: client2Id, date: formatDate(lastWeek), value: 1500.00, description: 'Contrato de Manutenção Mensal' },
];

export const demoCosts: Cost[] = [
  { id: uuidv4(), description: 'Combustível', value: 150.00, date: formatDate(today), category: 'Transporte' },
  { id: uuidv4(), description: 'Compra de Lâmpadas', value: 100.00, date: formatDate(lastWeek), category: 'Materiais' },
  { id: uuidv4(), description: 'Alimentação', value: 45.00, date: formatDate(yesterday), category: 'Alimentação' },
];

export const demoAppointments: Appointment[] = [
  { id: uuidv4(), title: 'Visita Técnica - Shopping', start: `${formatDate(tomorrow)}T10:00:00`, end: `${formatDate(tomorrow)}T12:00:00`, type: 'MEETING' },
  { id: uuidv4(), title: 'Manutenção Preventiva', start: `${formatDate(nextWeek)}T14:00:00`, end: `${formatDate(nextWeek)}T17:00:00`, type: 'TICKET', ticketId: demoTickets[1].id },
];
