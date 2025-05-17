import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env-config';
import { emitStatusUpdate } from '../socket/route';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instance, phoneNumber } = body;

    if (!instance) {
      return NextResponse.json({ error: 'Missing instance in request body' }, { status: 400 });
    }

    const evolutionApiUrl = `${ENV.EVOLUTION_API_BASE_URL}/instance/create`;

    const evolutionResponse = await fetch(evolutionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ENV.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName: instance,
        number: phoneNumber,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true,
      }),
    });

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text();
      console.error(`EvolutionAPI error: ${evolutionResponse.status} ${evolutionResponse.statusText}`, errorData);
      throw new Error(`EvolutionAPI request failed with status ${evolutionResponse.status}: ${errorData}`);
    }

    const responseData = await evolutionResponse.json();

    // Emitir status para o cliente via WebSocket
    // O 'instance' aqui é o sessionId que o frontend gerou
    if (instance && responseData.instance?.instanceName) {
      emitStatusUpdate(instance, "pending_qr_scan", `Instância ${responseData.instance.instanceName} criada, aguardando QR code.`);
    } else if (instance) {
      // Caso a resposta da Evolution API não tenha instanceName, mas a criação foi OK
      emitStatusUpdate(instance, "pending_qr_scan", `Instância criada, aguardando QR code.`);
    }

    return NextResponse.json(responseData, { status: evolutionResponse.status });

  } catch (error) {
    console.error('Erro ao criar instância WhatsApp na evolutionAPI:', error);
    let errorMessage = 'Erro interno no servidor';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = `Falha ao criar instância na evolutionAPI. ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}