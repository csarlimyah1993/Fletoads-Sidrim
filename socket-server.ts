// d:\Workspace\Fleto-v10\Fletoads-Sidrim\socket-server.ts
import { createServer } from 'http';
import { Server, Socket as ServerSocket } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://seusite.com' : 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

interface Message {
  id: string;
  text: string;
  sender: string; // 'user', 'ai', 'system'
  timestamp: Date;
  userId?: string;
  userName?: string;
  room: string; // Sala de chat
}

const PORT = process.env.SOCKET_PORT || 3001;

io.on('connection', (socket: ServerSocket) => {
  console.log(`Usuário conectado: ${socket.id}`);

  socket.on('joinRoom', ({ userId, room }) => {
    socket.join(room);
    console.log(`Usuário ${userId || socket.id} entrou na sala: ${room}`);
    // Pode-se emitir uma mensagem de boas-vindas ou notificar outros na sala
    socket.to(room).emit('userJoined', { userId: userId || socket.id, message: 'Entrou no chat.' });
  });

  socket.on('sendMessage', (message: Message) => {
    console.log('Mensagem recebida no servidor:', message);
    // Envia a mensagem para todos na sala, incluindo o remetente
    // io.to(message.room).emit('receiveMessage', message);

    // Ou, se quiser enviar para todos EXCETO o remetente:
    socket.to(message.room).emit('receiveMessage', message);

    // Simular resposta da IA após um pequeno atraso
    if (message.sender === 'user' && message.room.includes('panai_chat')) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: Date.now().toString() + '_ai_response',
          text: `PanAi processou: "${message.text}". Esta é uma resposta automática.`, 
          sender: 'ai',
          timestamp: new Date(),
          room: message.room,
          userName: 'PanAi',
        };
        io.to(message.room).emit('receiveMessage', aiResponse);
        console.log('Resposta da IA enviada:', aiResponse);
      }, 1500);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Usuário desconectado: ${socket.id}, motivo: ${reason}`);
    // Pode-se notificar outros usuários na sala sobre a desconexão
    // io.to('alguma_sala_padrão_ou_dinamica').emit('userLeft', { userId: socket.id, message: 'Saiu do chat.'});
  });

  socket.on('connect_error', (err) => {
    console.error(`Erro de conexão no socket ${socket.id}: ${err.message}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor Socket.IO rodando na porta ${PORT}`);
});

// Para executar este servidor:
// 1. Certifique-se de ter 'socket.io' e 'typescript' (e 'ts-node' para rodar diretamente) instalados.
//    npm install socket.io
//    npm install -D typescript ts-node @types/node @types/socket.io
// 2. Compile para JS (tsc socket-server.ts) e rode com node (node socket-server.js)
//    OU rode diretamente com ts-node (npx ts-node socket-server.ts)
// 3. Configure as variáveis de ambiente se necessário (ex: SOCKET_PORT, NODE_ENV).