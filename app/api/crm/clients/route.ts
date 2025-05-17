// d:\Workspace\Fleto-v10\Fletoads-Sidrim\app\api\crm\clients\route.ts
import { NextResponse } from 'next/server';
import { Client } from '@/components/crm/types'; // Adjust path as necessary
import { connectToDatabase } from '@/lib/mongodb'; // Assuming you have a MongoDB connection utility

// Mock database (replace with actual database interaction)
let clientsDB: Client[] = [
  {
    id: '1',
    nome: 'João Silva (DB)',
    email: 'joao.silva.db@example.com',
    telefone: '(11) 98765-0001',
    empresa: 'Empresa Alpha DB',
    dataCriacao: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaAtualizacao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    origem: 'whatsapp',
    tags: ['VIP DB', 'Lead Quente DB'],
    sentimentoIA: 'positivo',
    interessesProdutos: [{ id: 'prod1_db', nome: 'Produto X DB', valorEstimado: 2500 }],
    etapaAtualCRM: 'negociacao',
    valorTotalNegociado: 2500,
    responsavelId: 'userDB123',
  },
  {
    id: '2',
    nome: 'Maria Oliveira (DB)',
    email: 'maria.oliveira.db@example.com',
    telefone: '(21) 91234-0002',
    empresa: 'Serviços Beta DB',
    dataCriacao: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    origem: 'instagram',
    tags: ['Novo Cliente DB'],
    sentimentoIA: 'neutro',
    interessesProdutos: [{ id: 'serv2_db', nome: 'Serviço Y DB', valorEstimado: 1200 }],
    etapaAtualCRM: 'proposta-enviada',
    valorTotalNegociado: 1200,
  },
];

async function getClientsFromDb(): Promise<Client[]> {
    // In a real app, you would fetch from MongoDB or other database
    // For now, we'll use the in-memory clientsDB and simulate localStorage persistence for demo
    if (typeof window !== "undefined" && localStorage.getItem('crm_clients_api_db')) {
        return JSON.parse(localStorage.getItem('crm_clients_api_db')!);
    }
    return [...clientsDB]; // Return a copy
}

async function saveClientToDb(client: Client): Promise<Client> {
    let db = await getClientsFromDb();
    const existingIndex = db.findIndex(c => c.id === client.id);
    if (existingIndex > -1) {
        db[existingIndex] = client;
    } else {
        db.push(client);
    }
    if (typeof window !== "undefined") {
        localStorage.setItem('crm_clients_api_db', JSON.stringify(db));
    } else {
        clientsDB = db; // Update in-memory if localStorage not available (e.g. server-side during build)
    }
    return client;
}

export async function GET(request: Request) {
  try {
    // const { db } = await connectToDatabase();
    // const clients = await db.collection('clients').find({}).toArray();
    // return NextResponse.json(clients);
    const clients = await getClientsFromDb();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ message: 'Failed to fetch clients', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newClientData = body as Partial<Client>;

    if (!newClientData.nome) {
      return NextResponse.json({ message: 'Nome do cliente é obrigatório' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const clientToSave: Client = {
      id: newClientData.id || `client_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      nome: newClientData.nome,
      email: newClientData.email,
      telefone: newClientData.telefone,
      empresa: newClientData.empresa,
      dataCriacao: newClientData.dataCriacao || now,
      ultimaAtualizacao: now,
      origem: newClientData.origem || 'outro',
      origemDetalhes: newClientData.origem === 'outro' ? newClientData.origemDetalhes : undefined,
      tags: newClientData.tags || [],
      sentimentoIA: newClientData.sentimentoIA || 'nao_analisado',
      interessesProdutos: newClientData.interessesProdutos || [],
      etapaAtualCRM: newClientData.etapaAtualCRM || 'lead',
      valorTotalNegociado: newClientData.valorTotalNegociado || 0,
      responsavelId: newClientData.responsavelId,
      notasGerais: newClientData.notasGerais,
      historicoSentimento: newClientData.historicoSentimento || [],
      historicoEtapasCRM: newClientData.historicoEtapasCRM || [],
    };

    // const { db } = await connectToDatabase();
    // const result = await db.collection('clients').insertOne(clientToSave);
    // const createdClient = await db.collection('clients').findOne({ _id: result.insertedId });
    // return NextResponse.json(createdClient, { status: 201 });

    const savedClient = await saveClientToDb(clientToSave);
    return NextResponse.json(savedClient, { status: 201 });

  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ message: 'Failed to create client', error: (error as Error).message }, { status: 500 });
  }
}