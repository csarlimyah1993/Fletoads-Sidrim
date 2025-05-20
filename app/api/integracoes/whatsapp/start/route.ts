import { NextRequest, NextResponse } from 'next/server';
import { emitStatusUpdate } from '../socket/route';
import WhatsappIntegracao from '@/lib/models/whatsapp-integracao';
import { connectToDatabase } from '@/lib/mongodb';
import { ENV } from '@/lib/env-config'; // For fallback API key

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { lojaId, userId } = body;

    if (!lojaId) {
      return NextResponse.json({ error: 'Missing lojaId in request body' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
    }

    const instanceName = `loja_${lojaId}_${Date.now()}`; // This will be our sessionId

    let integration = await WhatsappIntegracao.findOne({ lojaId });
    let evolutionApiUrlToUse: string;
    let evolutionApiKeyToUse: string;

    if (integration) {
      // Integration for this lojaId exists
      if (!integration.evolutionApiUrl || !integration.apiKey) {
        return NextResponse.json({ error: `API configuration missing for existing integration with lojaId '${lojaId}'. Please check settings.` }, { status: 500 });
      }
      evolutionApiUrlToUse = integration.evolutionApiUrl;
      evolutionApiKeyToUse = integration.apiKey;

      // Update existing integration with the new instanceName (sessionId) and reset status
      integration.nomeInstancia = instanceName;
      integration.status = "pendente";
      await integration.save();
    } else {
      // No integration for this lojaId, create a new one
      const globalApiKey = ENV.EVOLUTION_API_KEY;

      if (!globalApiKey) {
        // The model requires apiKey, so if it's a new instance, globalApiKey must be set.
        return NextResponse.json({ error: 'Global EVOLUTION_API_KEY is not configured. This is required for new WhatsApp integrations.' }, { status: 500 });
      }
      
      integration = await WhatsappIntegracao.create({
        userId,
        lojaId,
        nomeInstancia: instanceName,
        status: "pendente",
        // evolutionApiUrl will use the schema default "http://localhost:8080" as it's not provided here
        apiKey: globalApiKey, // Store the global key for this new instance
        telefone: "",
      });

      // After creation, the integration object will have the default evolutionApiUrl
      evolutionApiUrlToUse = integration.evolutionApiUrl;
      evolutionApiKeyToUse = integration.apiKey; // This will be the globalApiKey
    }

    const evolutionApiEndpoint = `${evolutionApiUrlToUse}/instance/create`;

    const evolutionResponse = await fetch(evolutionApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKeyToUse,
      },
      body: JSON.stringify({
        instanceName: instanceName, // This is the session ID / nomeInstancia for Evolution API
        number: "", // Phone number is not provided upfront
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true, // Request QR code generation
      }),
    });

    if (!evolutionResponse.ok) {
      const errorData = await evolutionResponse.text();
      console.error(`EvolutionAPI error: ${evolutionResponse.status} ${evolutionResponse.statusText}`, errorData);
      // Update status to 'erro' in our DB
      if (integration) {
        integration.status = "erro";
        await integration.save();
      }
      throw new Error(`EvolutionAPI request failed with status ${evolutionResponse.status}: ${errorData}`);
    }

    const responseData = await evolutionResponse.json();

    // Emit status to the client via WebSocket using the generated instanceName as sessionId
    // Check if Evolution API actually returned the instanceName we expect
    if (responseData.instance?.instanceName === instanceName) {
      emitStatusUpdate(instanceName, "pending_qr_scan", `Instância ${instanceName} criada, aguardando QR code.`);
    } else {
      // Fallback or log warning if instanceName mismatch, though it should match
      emitStatusUpdate(instanceName, "pending_qr_scan", `Instância criada (aguardando QR code).`);
      console.warn(`Evolution API instanceName mismatch: expected ${instanceName}, got ${responseData.instance?.instanceName}`);
    }
    
    // Return the sessionId and Evolution API response to the frontend
    return NextResponse.json({ ...responseData, sessionId: instanceName }, { status: evolutionResponse.status });

  } catch (error) {
    console.error('Erro ao iniciar instância WhatsApp na evolutionAPI:', error);
    let errorMessage = 'Erro interno no servidor';
    let statusCode = 500;
    if (error instanceof Error) {
      errorMessage = `Falha ao criar instância na evolutionAPI. ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}