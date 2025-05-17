// Frontend: Componente para exibir uma mensagem individual no chat
"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: string; // 'user', 'ai', 'system'
  timestamp: Date;
  userId?: string;
  userName?: string;
  userImage?: string | null; // Adicionado para imagem do avatar
}

interface ChatMessageProps {
  message: Message;
  currentUserEmail: string; // Para diferenciar as mensagens do usuário atual
}

const ChatMessage = ({ message, currentUserEmail }: ChatMessageProps) => {
  const isCurrentUser = message.userId === currentUserEmail || (message.sender === 'user' && !message.userId); // Adaptação simples
  const senderName = isCurrentUser ? 'Você' : message.userName || (message.sender === 'ai' ? 'PanAi' : 'Sistema');

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex my-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-end max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 mr-2 self-start">
            <AvatarImage src={message.userImage || undefined} alt={senderName} />
            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`px-4 py-2 rounded-lg shadow ${isCurrentUser ? 'bg-primary text-primary-foreground ml-2' : 'bg-muted mr-2'}`}
        >
          {!isCurrentUser && <p className="text-xs font-semibold mb-1">{senderName}</p>}
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;