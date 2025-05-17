// d:\Workspace\Fleto-v10\Fletoads-Sidrim\app\api\crm\clients\[id]\whatsapp\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { WhatsappMessage } from '@/components/crm/types'; // Ajuste o caminho se necessário

// Mock de dados de mensagens do WhatsApp para simulação
const mockWhatsappMessages: { [clientId: string]: WhatsappMessage[] } = {
  '1': [
    { id: 'msg1', sender: 'client', content: 'Olá, gostaria de saber mais sobre o Produto X.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'read' },
    { id: 'msg2', sender: 'agent', content: 'Claro! O Produto X é ideal para suas necessidades...', timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(), status: 'delivered' },
    { id: 'msg3', sender: 'client', content: 'Parece interessante. Qual o preço?', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), status: 'read' },
    { id: 'msg4', sender: 'agent', content: 'O preço é R$XX. Temos um desconto especial esta semana.', timestamp: new Date(Date.now() - 1.4 * 60 * 60 * 1000).toISOString(), status: 'sent' },
  ],
  '2': [
    { id: 'msg5', sender: 'client', content: 'Preciso de suporte técnico.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'read' },
    { id: 'msg6', sender: 'agent', content: 'Olá! Como posso ajudar?', timestamp: new Date(Date.now() - 2.9 * 60 * 60 * 1000).toISOString(), status: 'read' },
  ],
  // Adicione mais mensagens mockadas para outros clientIds conforme necessário
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  // Em um aplicativo real, você buscaria essas informações de um banco de dados
  // ou de uma API de integração do WhatsApp.
  const messages = mockWhatsappMessages[clientId] || [];

  if (messages.length === 0 && !mockWhatsappMessages[clientId]) {
    // Se não houver um array definido para o clientId, consideramos que o cliente não foi encontrado para mensagens do WhatsApp
    // Embora, na prática, um cliente pode existir sem mensagens.
    // Para este mock, vamos retornar 404 se não houver entrada para o cliente.
    // return NextResponse.json({ message: 'Nenhuma mensagem do WhatsApp encontrada para este cliente ou cliente não existe.' }, { status: 404 });
    // Retornando um array vazio é mais comum para listas
     return NextResponse.json([], { status: 200 });
  }

  // Simular um pequeno atraso da API
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(messages);
}

// Você pode adicionar handlers POST, PUT, DELETE aqui se precisar gerenciar mensagens do WhatsApp via API.
// Exemplo: POST para adicionar uma nova mensagem enviada pelo agente.
// export async function POST(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const clientId = params.id;
//   const body = await request.json();
//   // Lógica para adicionar a nova mensagem...
//   return NextResponse.json({ message: 'Mensagem adicionada com sucesso' }, { status: 201 });
// }