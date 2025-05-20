import { NextResponse } from 'next/server';
import { emitStatusUpdate } from '../socket/route';
import WhatsappIntegracao from '@/lib/models/whatsapp-integracao';
import { connectToDatabase } from '@/lib/mongodb';

// Configuração da API externa

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Extrai o nome da instância da query string (?instance=nome)
    const { searchParams } = new URL(request.url);
    const instance = searchParams.get('instance'); // 'instance' is nomeInstancia in the model

    if (!instance) {
      return NextResponse.json({ error: 'Parâmetro instance ausente na query string' }, { status: 400 });
    }

    const integration = await WhatsappIntegracao.findOne({ nomeInstancia: instance });

    if (!integration) {
      return NextResponse.json({ error: `WhatsApp integration with instance name '${instance}' not found.` }, { status: 404 });
    }

    if (!integration.evolutionApiUrl || !integration.apiKey) {
      return NextResponse.json({ error: `API configuration missing for instance '${instance}'. Please check the integration settings.` }, { status: 500 });
    }

    // Monta a URL do endpoint externo
    const connectUrl = `${integration.evolutionApiUrl}/instance/connect/${instance}`;
    const evolutionApiKey = integration.apiKey;

    // Faz a requisição GET para o endpoint externo
    const response = await fetch(connectUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey
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
      // Emitir status de erro para o cliente via WebSocket
      if (instance) {
        emitStatusUpdate(instance, "error", `Erro na EvolutionAPI ao gerar QR Code: ${response.status}`);
      }
      return NextResponse.json({ error: `Erro na EvolutionAPI: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    // Espera-se que a resposta tenha { "base64": "<imagem base64>" }
    if (!data || typeof data.base64 !== 'string') {
      console.error('Resposta da EvolutionAPI não contém campo base64 válido:', data);
      // Emitir status de erro para o cliente via WebSocket
      if (instance) {
        emitStatusUpdate(instance, "error", "Resposta inválida da EvolutionAPI ao gerar QR Code.");
      }
      return NextResponse.json({ error: 'Resposta inválida da EvolutionAPI' }, { status: 500 });
    }

    // Emitir status para o cliente via WebSocket
    // O 'instance' aqui é o sessionId que o frontend gerou
    if (instance) {
      emitStatusUpdate(instance, "qr_code_ready", "QR Code gerado e pronto para escaneamento.");
    }
    return NextResponse.json({ base64: data.base64 }, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao processar requisição de QR code WhatsApp:', error);
    // Emitir status de erro para o cliente via WebSocket
    const { searchParams } = new URL(request.url); // Precisamos pegar o instance (sessionId) novamente aqui
    const instance = searchParams.get('instance');
    if (instance) {
      emitStatusUpdate(instance, "error", error.message || "Falha ao gerar QR Code.");
    }
    return NextResponse.json({ error: 'Erro interno', details: error.message }, { status: 500 });
  }
}