import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env-config';

// Configuração da API externa

export async function GET(request: Request) {
  try {
    // Extrai o nome da instância da query string (?instance=nome)
    const { searchParams } = new URL(request.url);
    const instance = searchParams.get('instance');

    if (!instance) {
      return NextResponse.json({ error: 'Parâmetro instance ausente na query string' }, { status: 400 });
    }

    // Monta a URL do endpoint externo
    const connectUrl = `${ENV.EVOLUTION_API_BASE_URL}/instance/connect/${instance}`;

    // Faz a requisição GET para o endpoint externo
    const response = await fetch(connectUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ENV.EVOLUTION_API_KEY
      },
    });

    if (!response.ok) {
      let errorBody = 'Erro desconhecido';
      try {
        errorBody = await response.text();
      } catch (e) {
        console.error('Falha ao ler corpo de erro:', e);
      }
      console.error(`EvolutionAPI respondeu com status ${response.status}: ${errorBody}`);
      return NextResponse.json({ error: `Erro na EvolutionAPI: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Espera-se que a resposta tenha { "base64": "<imagem base64>" }
    if (!data || typeof data.base64 !== 'string') {
      console.error('Resposta da EvolutionAPI não contém campo base64 válido:', data);
      return NextResponse.json({ error: 'Resposta inválida da EvolutionAPI' }, { status: 500 });
    }

    return NextResponse.json({ base64: data.base64 }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao processar requisição de QR code WhatsApp:', error);
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}

// Mantém o POST existente para compatibilidade
const EXTERNAL_WEBHOOK_URL = 'https://n8n.robotizze.us/webhook-test/start-conexao';

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Missing name or phone in request body' }, { status: 400 });
    }

    const webhookResponse = await fetch(EXTERNAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': `${process.env.EVOLUTION_API_KEY}`,
      },
      body: JSON.stringify({ name, phone }),
    });

    if (!webhookResponse.ok) {
      let errorBody = 'Unknown error';
      try {
        errorBody = await webhookResponse.text();
      } catch (e) {
        console.error('Failed to read webhook error body:', e);
      }
      console.error(`Webhook responded with status ${webhookResponse.status}: ${errorBody}`);
      return NextResponse.json({ error: `Webhook error: ${webhookResponse.status}` }, { status: webhookResponse.status });
    }

    const data = await webhookResponse.json();

    if (!data || typeof data.base64 !== 'string') {
       console.error('Webhook response did not contain a valid base64 field:', data);
       return NextResponse.json({ error: 'Invalid response from webhook' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error processing WhatsApp QR request:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}