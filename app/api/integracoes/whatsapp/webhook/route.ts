// app/api/integracoes/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { emitStatusUpdate } from '../socket/route'; // Ajuste o caminho se necessário

interface EvolutionWebhookPayload {
  event: string; // ex: "connection.update"
  instance: string; // Nome da instância, que usamos como sessionId
  data: {
    state?: string; // ex: "open", "close", "connecting"
    // Outros campos dependendo do evento
  };
  // Pode haver outros campos como 'destination', 'date_time', 'server_url', 'apikey'
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as EvolutionWebhookPayload;
    console.log("Webhook da Evolution API recebido:", JSON.stringify(payload, null, 2));

    const { instance, event, data } = payload;

    if (!instance) {
      console.warn("Webhook recebido sem nome de instância (sessionId).");
      return NextResponse.json({ error: 'Nome da instância ausente no payload do webhook' }, { status: 400 });
    }

    // Tratar diferentes tipos de eventos de webhook
    if (event === "connection.update") {
      const newState = data.state;
      if (newState) {
        let clientStatus = "";
        let message = "";

        switch (newState) {
          case "open":
            clientStatus = "connected";
            message = "WhatsApp conectado com sucesso.";
            break;
          case "close":
            clientStatus = "disconnected"; // O frontend pode tratar como 'error' ou 'timeout' dependendo do contexto
            message = "WhatsApp desconectado.";
            break;
          case "connecting":
            clientStatus = "connecting";
            message = "Conectando ao WhatsApp...";
            break;
          // Adicione outros estados da Evolution API conforme necessário
          default:
            console.warn(`Estado de conexão desconhecido '${newState}' recebido para instância ${instance}`);
            // Não emitir status se não soubermos como mapeá-lo
            return NextResponse.json({ message: "Webhook processado, estado desconhecido." }, { status: 200 });
        }
        emitStatusUpdate(instance, clientStatus, message);
      } else {
        console.warn(`Evento 'connection.update' recebido sem 'data.state' para instância ${instance}`);
      }
    } else if (event === "qrcode.updated") {
      // Se a Evolution API enviar um novo QR code via webhook (algumas versões podem fazer isso)
      // O frontend atualmente obtém o QR code via /api/integracoes/whatsapp/qr
      // Mas se o webhook fornecer, podemos atualizar.
      // const qrBase64 = payload.data?.qrcode?.base64;
      // if (qrBase64) {
      //   emitStatusUpdate(instance, "qr_code_ready", "QR Code atualizado via webhook.");
      //   // O frontend precisaria de um handler para 'qr_code_ready' que também atualize a imagem do QR Code.
      //   // E o socket.io server precisaria emitir o base64: clientSocket.emit("qr_code_update", { base64: qrBase64 });
      // }
       console.log(`Evento 'qrcode.updated' recebido para instância ${instance}. Lógica de tratamento não implementada neste exemplo.`);
    } else {
      console.log(`Webhook evento '${event}' recebido para instância ${instance}. Nenhum manipulador específico.`);
    }

    return NextResponse.json({ message: "Webhook recebido e processado" }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao processar webhook da Evolution API:", error);
    return NextResponse.json({ error: 'Erro interno ao processar webhook', details: error.message }, { status: 500 });
  }
}

// Para outros métodos HTTP, se necessário
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Endpoint de webhook do WhatsApp. Use POST." }, { status: 405 });
}