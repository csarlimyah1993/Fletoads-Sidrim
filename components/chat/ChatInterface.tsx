// Frontend: Componente da Interface de Chat para PanAi
"use client"

import { useState, useEffect, useRef, FormEvent } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaperPlaneIcon } from '@radix-ui/react-icons'; // Exemplo de ícone
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast'; // Adicionado para notificações
import ChatMessage from './ChatMessage'; // Componente para exibir mensagens individuais

interface Message {
  id: string;
  text: string;
  sender: string; // 'user', 'ai', 'system'
  timestamp: Date;
  userId?: string; // ID do usuário que enviou
  userName?: string; // Nome do usuário
}

const ChatInterface = () => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Conectar ao servidor Socket.IO
    // A URL do servidor Socket.IO. Em produção, use uma variável de ambiente.
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      // transports: ['websocket'], // Opcional, pode ajudar em alguns ambientes restritivos
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket:', newSocket.id);
      setIsConnected(true);
      if (session?.user?.id) {
        newSocket.emit('joinRoom', { userId: session.user.id, room: 'panai_chat' });
      }
      // Mensagem inicial do sistema ou IA após conexão
      setMessages([
        {
          id: 'initial-ai-message',
          text: 'Olá! Como posso ajudar você hoje com a PanAi?',
          sender: 'ai',
          timestamp: new Date(),
          userName: 'PanAi'
        }
      ]);
    });

    newSocket.on('receiveMessage', (message: Message) => {
      console.log('Mensagem recebida do servidor:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on('userJoined', (data: { userId: string, message: string }) => {
      console.log('Usuário entrou:', data);
      // Opcional: adicionar uma mensagem do sistema sobre novo usuário
      // setMessages((prevMessages) => [...prevMessages, {
      //   id: `system-${Date.now()}`,
      //   text: `${data.userId} ${data.message}`,
      //   sender: 'system',
      //   timestamp: new Date(),
      // }]);
    });

    newSocket.on('userLeft', (data: { userId: string, message: string }) => {
      console.log('Usuário saiu:', data);
      // Opcional: adicionar uma mensagem do sistema sobre usuário que saiu
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Desconectado do servidor WebSocket:', reason);
      setIsConnected(false);
      toast({ title: "Desconectado do Chat", description: `Motivo: ${reason}`, variant: "destructive" });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      setIsConnected(false);
      toast({ title: "Erro de Conexão com Chat", description: error.message, variant: "destructive" });
    });

    return () => {
      console.log('Desconectando o socket...');
      newSocket.disconnect();
    };
  }, [session]);

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && session?.user?.id) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        sender: 'user',
        timestamp: new Date(),
        userId: session.user.id,
        userName: session.user.name || 'Usuário',
      };
      const messageToSend = { ...newMessage, room: 'panai_chat' };
      socket?.emit('sendMessage', messageToSend);
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Adiciona localmente para feedback imediato
      setInputValue('');
    }
  };

  if (!session) {
    return <p>Por favor, faça login para usar o chat.</p>;
  }

  return (
    <div className="flex flex-col h-[500px] max-w-lg mx-auto border rounded-lg shadow-lg">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">PanAi Chat</h2>
        <p className="text-xs">Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} currentUserEmail={session.user?.email || ''} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t bg-white flex items-center">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-grow mr-2"
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!isConnected || !inputValue.trim()}>
          <PaperPlaneIcon className="h-5 w-5" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;