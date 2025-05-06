import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env-config';

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