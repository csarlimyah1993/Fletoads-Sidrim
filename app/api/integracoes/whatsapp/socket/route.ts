// app/api/integracoes/whatsapp/socket/route.ts
import { Server, Socket as ServerSocket } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";

// Adicionamos uma propriedade ao objeto global NextApiResponseServerIO
interface NextApiResponseServerIO extends NextApiResponse {
  socket: NextApiResponse["socket"] & {
    server: HttpServer & {
      io?: Server;
    };
  };
}

// Mantém um mapa de clientes por sessionId para direcionar mensagens
const clients = new Map<string, ServerSocket>();

// Função para emitir status para um cliente específico
export const emitStatusUpdate = (sessionId: string, status: string, message?: string) => {
  const clientSocket = clients.get(sessionId);
  if (clientSocket) {
    console.log(`Emitindo status_update para sessionId ${sessionId}: ${status}`);
    clientSocket.emit("status_update", { status, message });
  } else {
    console.warn(`Socket não encontrado para sessionId ${sessionId} ao tentar emitir status_update`);
  }
};

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponseServerIO
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  if (!res.socket.server.io) {
    console.log("[*] Inicializando Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/integracoes/whatsapp/socket",
      addTrailingSlash: false,
      cors: { origin: "*", methods: ["GET", "POST"] } // Ajuste conforme necessário para produção
    });

    io.on("connection", (socket) => {
      const sessionId = socket.handshake.query.sessionId as string;
      if (!sessionId) {
        console.warn("Conexão WebSocket recebida sem sessionId. Desconectando.");
        socket.disconnect(true);
        return;
      }

      console.log(`Cliente conectado com socket ID: ${socket.id} para sessionId: ${sessionId}`);
      clients.set(sessionId, socket); // Armazena o socket do cliente

      // Emitir um status inicial ou de boas-vindas, se necessário
      // socket.emit("status_update", { status: "socket_connected", message: "Conectado ao servidor WebSocket." });

      socket.on("disconnect", (reason) => {
        console.log(`Cliente desconectado com socket ID: ${socket.id} (sessionId: ${sessionId}). Razão: ${reason}`);
        clients.delete(sessionId); // Remove o socket do cliente ao desconectar
      });

      // Aqui você pode adicionar listeners para outros eventos do cliente, se houver
      // Exemplo: socket.on('custom_event', (data) => { ... });
    });

    res.socket.server.io = io;
    console.log("[*] Socket.IO server inicializado e anexado ao servidor HTTP.");
  } else {
    console.log("[*] Socket.IO server já está em execução.");
  }
  
  // A resposta para a requisição HTTP inicial que estabelece o WebSocket
  // Normalmente, para Socket.IO, não há muito a retornar aqui, pois a comunicação principal ocorre via WebSocket.
  // No entanto, o Next.js espera uma resposta para a rota de API.
  res.status(200).json({ message: "Socket.IO server está configurado. Use conexões WebSocket." });
}

// É importante notar que esta abordagem para Next.js com App Router pode precisar de ajustes.
// A forma tradicional de lidar com Socket.IO em `pages/api` é mais direta.
// Para o App Router, a gestão do servidor HTTP global e a anexação do Socket.IO
// podem ser mais complexas ou exigir uma configuração de servidor customizada (`server.js`).
// O código acima é uma tentativa de adaptar o padrão `pages/api` para um Route Handler.
// Se este arquivo for `pages/api/integracoes/whatsapp/socket.ts` (usando Pages Router), 
// a estrutura seria ligeiramente diferente, principalmente na assinatura da função handler.

// Para fins de teste, você pode adicionar uma rota para simular uma atualização de status:
// Exemplo: /api/integracoes/whatsapp/notify?sessionId=someSession&status=connected
// Isso seria uma rota separada, não neste arquivo.