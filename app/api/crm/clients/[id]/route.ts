// d:\Workspace\Fleto-v10\Fletoads-Sidrim\app\api\crm\clients\[id]\route.ts
import { NextResponse } from 'next/server';
import { Client } from '@/components/crm/types'; // Adjust path as necessary
import { connectToDatabase } from '@/lib/mongodb'; // Assuming you have a MongoDB connection utility

// Mock database (consistent with the one in ../route.ts)
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
    if (typeof window !== "undefined" && localStorage.getItem('crm_clients_api_db')) {
        try {
            return JSON.parse(localStorage.getItem('crm_clients_api_db')!);
        } catch (e) {
            console.error("Error parsing clients from localStorage:", e);
            // Fallback to in-memory if localStorage is corrupt
            return [...clientsDB]; 
        }
    }
    return [...clientsDB]; 
}

async function persistClientsToDb(updatedDb: Client[]): Promise<void> {
    if (typeof window !== "undefined") {
        localStorage.setItem('crm_clients_api_db', JSON.stringify(updatedDb));
    } else {
        clientsDB = updatedDb; 
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // const { db } = await connectToDatabase();
    // const client = await db.collection('clients').findOne({ id: id }); // Assuming 'id' is your custom ID field, not MongoDB's _id
    
    const currentClients = await getClientsFromDb();
    const client = currentClients.find(c => c.id === id);

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json({ message: 'Failed to fetch client', error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updatedClientData = body as Partial<Client>;

    // const { db } = await connectToDatabase();
    // const result = await db.collection('clients').updateOne({ id: id }, { $set: { ...updatedClientData, ultimaAtualizacao: new Date().toISOString() } });
    // if (result.matchedCount === 0) {
    //   return NextResponse.json({ message: 'Cliente não encontrado para atualização' }, { status: 404 });
    // }
    // const updatedClient = await db.collection('clients').findOne({ id: id });
    // return NextResponse.json(updatedClient);

    let currentClients = await getClientsFromDb();
    const clientIndex = currentClients.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return NextResponse.json({ message: 'Cliente não encontrado para atualização' }, { status: 404 });
    }

    currentClients[clientIndex] = {
      ...currentClients[clientIndex], 
      ...updatedClientData,
      id: id, // Ensure ID is not changed
      ultimaAtualizacao: new Date().toISOString(),
    };

    await persistClientsToDb(currentClients);
    return NextResponse.json(currentClients[clientIndex]);

  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ message: 'Failed to update client', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    // const { db } = await connectToDatabase();
    // const result = await db.collection('clients').deleteOne({ id: id });
    // if (result.deletedCount === 0) {
    //   return NextResponse.json({ message: 'Cliente não encontrado para exclusão' }, { status: 404 });
    // }
    // return NextResponse.json({ message: 'Cliente excluído com sucesso' }, { status: 200 });

    let currentClients = await getClientsFromDb();
    const initialLength = currentClients.length;
    currentClients = currentClients.filter(c => c.id !== id);

    if (currentClients.length === initialLength) {
        return NextResponse.json({ message: 'Cliente não encontrado para exclusão' }, { status: 404 });
    }

    await persistClientsToDb(currentClients);
    return NextResponse.json({ message: 'Cliente excluído com sucesso (mock)' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json({ message: 'Failed to delete client', error: (error as Error).message }, { status: 500 });
  }
}