"use client"

import { useState, useEffect, useRef } from "react"
import { io, Socket } from "socket.io"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, QrCode, RefreshCw, Play, StopCircle, CheckCircle } from 'lucide-react'
import Image from "next/image"

export function WhatsappIntegracao() {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [sessionId, setSessionId] = useState("") 
  const [qrTimer, setQrTimer] = useState(40)
  const [isQrActive, setIsQrActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) 
  const [step, setStep] = useState<1 | 2 | 3>(1) 
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error" | "timeout">("idle")
  const socketRef = useRef<Socket | null>(null);

  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const resetToInitialState = () => {
    setQrCodeData(null);
    setQrCodeLoading(false);
    setIsQrActive(false);
    setQrTimer(40);
    setSessionId("");
    setStep(1);
    setConnectionStatus("idle");
    setIsProcessing(false);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const requestNewQrCode = async (currentSessionId: string) => {
    if (!currentSessionId) {
      toast({
        title: "Erro Interno",
        description: "ID de sessão não encontrado para gerar QR Code.",
        variant: "destructive",
      });
      resetToInitialState();
      return;
    }
    try {
      setQrCodeLoading(true);
      setQrCodeData(null);
      setQrTimer(40);
      setIsQrActive(true);
      setConnectionStatus("connecting");

      const apiUrl = new URL("/api/integracoes/whatsapp/qr", window.location.origin);
      apiUrl.searchParams.append("instance", currentSessionId);

      const response = await fetch(apiUrl.toString(), {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ao gerar QR Code" }))
        throw new Error(errorData.error || "Erro ao gerar QR Code");
      }

      const data = await response.json();

      if (data.base64) {
        setQrCodeData(data.base64);
        toast({
          title: "QR Code Gerado!",
          description: "Escaneie com seu WhatsApp em 40 segundos.",
        });
      } else {
        throw new Error("Resposta da API inesperada ao gerar QR Code");
      }
    } catch (error: any) {
      console.error("Erro ao gerar QR Code:", error);
      toast({
        title: "Erro ao Gerar QR Code",
        description: error.message || "Não foi possível gerar o QR Code.",
        variant: "destructive",
      });
      setQrCodeData(null);
      setIsQrActive(false);
      setConnectionStatus("error");
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleStartConfiguration = async () => {
    setIsProcessing(true);
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    
    try {
      const response = await fetch("/api/integracoes/whatsapp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // O backend em start/route.ts espera 'instance' para o sessionId
        // e 'phoneNumber'. Se o número for definido pelo QR Code,
        // enviamos uma string vazia, assumindo que a API lida com isso.
        body: JSON.stringify({ instance: newSessionId, phoneNumber: "" }), 
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ao iniciar instância" }));
        throw new Error(errorData.error || "Erro ao iniciar instância de conexão");
      }
      
      toast({
        title: "Preparando Conexão",
        description: "Gerando QR Code para conexão com WhatsApp.",
      });
      setStep(2);
      await requestNewQrCode(newSessionId);

    } catch (error: any) {
      console.error("Erro ao iniciar configuração:", error);
      toast({
        title: "Erro na Configuração",
        description: error.message || "Não foi possível iniciar a configuração.",
        variant: "destructive",
      });
      resetToInitialState();
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isQrActive && qrTimer > 0 && step === 2) {
      timerInterval = setInterval(() => {
        setQrTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (qrTimer === 0 && isQrActive && step === 2) {
      setIsQrActive(false);
      setConnectionStatus("timeout");
      toast({
        title: "Tempo Esgotado",
        description: "O QR Code expirou. Gere um novo se necessário.",
        variant: "destructive"
      });
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isQrActive, qrTimer, step]);

  useEffect(() => {
    if (step === 2 && isQrActive && connectionStatus === "connecting" && sessionId && !socketRef.current) {
      // URL do WebSocket para o modo global da API
      // Em um cenário real, esta URL viria de uma configuração ou variável de ambiente.
      // ATENÇÃO: Esta URL 'wss://api.seusite.com' é um placeholder e precisa ser configurada corretamente.
      const globalSocketUrl = "wss://api.seusite.com"; 

      const newSocket = io(globalSocketUrl, {
        // O 'path' é omitido pois a URL global já aponta para o endpoint do Socket.IO
        // ou o servidor Socket.IO está configurado para responder no path padrão (ex: /socket.io/)
        // sob o domínio especificado.
        query: { sessionId },
        transports: ['websocket'],
        reconnectionAttempts: 3, // Tenta reconectar 3 vezes
        timeout: 10000, // Timeout de conexão de 10 segundos
      });
      socketRef.current = newSocket;

      newSocket.on("connect", () => {
        console.log("Conectado ao WebSocket com ID:", newSocket.id, "para sessão:", sessionId);
        // O status "connecting" já deve estar setado, mas podemos confirmar
        if (connectionStatus !== "connecting") setConnectionStatus("connecting");
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Desconectado do WebSocket:", reason);
        // Só altera o status se não estivermos já conectados ou em outro estado final
        if (connectionStatus === "connecting" && step === 2) {
          // Se a desconexão não foi intencional (ex: erro de servidor)
          // Poderia tentar reconectar ou marcar como erro
          // setConnectionStatus("error");
          // setIsQrActive(false);
          // toast({
          //   title: "Conexão Perdida",
          //   description: "A conexão com o servidor foi perdida. Verifique sua internet ou tente novamente.",
          //   variant: "destructive"
          // });
        }
        // Limpa a referência se a desconexão for definitiva ou não gerenciada por reconexão automática
        if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Erro de conexão WebSocket:", error);
        setConnectionStatus("error");
        setIsQrActive(false);
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor de atualizações em tempo real.",
          variant: "destructive"
        });
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
      });

      newSocket.on("status_update", (data: { status: string; message?: string }) => {
        console.log("Evento 'status_update' recebido:", data);
        switch (data.status) {
          case "connected":
            setConnectionStatus("connected");
            setIsQrActive(false);
            toast({
              title: "WhatsApp Conectado!",
              description: "Seu número foi conectado com sucesso via WebSocket.",
            });
            setStep(3);
            if (socketRef.current) {
              socketRef.current.disconnect(); // Desconecta após sucesso
              socketRef.current = null;
            }
            break;
          case "pending_qr_scan":
          case "connecting": // Mantém o status se a API ainda estiver processando
            setConnectionStatus("connecting");
            break;
          case "timeout":
            setConnectionStatus("timeout");
            setIsQrActive(false);
            toast({
              title: "Tempo Esgotado (WebSocket)",
              description: data.message || "O QR Code expirou. Gere um novo se necessário.",
              variant: "destructive"
            });
            // Não desconecta o socket aqui, pode ser que o usuário queira tentar de novo com o mesmo sessionId
            // A API pode enviar um novo QR code ou o usuário pode solicitar.
            break;
          case "error":
          case "disconnected": // Tratado como erro do ponto de vista do cliente se inesperado
            setConnectionStatus("error");
            setIsQrActive(false);
            toast({
              title: "Falha na Conexão (WebSocket)",
              description: data.message || "Não foi possível manter a conexão ou ocorreu um erro.",
              variant: "destructive"
            });
            if (socketRef.current) {
              socketRef.current.disconnect();
              socketRef.current = null;
            }
            break;
          default:
            console.warn("Status desconhecido recebido via WebSocket:", data.status);
        }
      });

      // Opcional: se a API enviar o QR code via WebSocket após o 'start'
      // newSocket.on('qr_code_ready', (qrData: { base64: string }) => {
      //   if (qrData.base64) {
      //     setQrCodeData(qrData.base64);
      //     setQrCodeLoading(false);
      //     setIsQrActive(true);
      //     setQrTimer(40); // Reinicia o timer visual
      //     setConnectionStatus("connecting"); // Garante que está em modo de espera do scan
      //     toast({
      //       title: "QR Code Recebido!",
      //       description: "Escaneie com seu WhatsApp.",
      //     });
      //   } else {
      //      // Tratar erro se base64 não vier
      //   }
      // });

    }

    // Função de limpeza do useEffect
    return () => {
      // Limpeza agressiva para garantir que o socket seja desconectado na desmontagem do componente
      // ou quando as dependências mudarem de forma que o socket não seja mais necessário.
      if (socketRef.current) {
        console.log("Limpando socket no cleanup do useEffect para sessão:", sessionId);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  // Adicionar socketRef.current como dependência pode causar reconexões. 
  // A lógica de criar o socket apenas se `!socketRef.current` ajuda a mitigar isso.
  // As dependências principais são as condições para iniciar a conexão.
  }, [step, isQrActive, connectionStatus, sessionId, toast]); // Adicionado toast às dependências

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Integração com WhatsApp</CardTitle>
          <CardDescription className="text-center">
            Conecte seu número de WhatsApp para automatizar mensagens e integrações.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex flex-col items-center justify-center">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full text-center">
              <QrCode className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold">Bem-vindo à configuração do WhatsApp!</h3>
              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para iniciar o processo de conexão do seu WhatsApp com nossa plataforma.
              </p>
              <Button
                className="w-full max-w-xs"
                onClick={handleStartConfiguration}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Iniciar Configuração
              </Button>
            </div>
          )}

          {step === 2 && (
            qrCodeLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-lg text-muted-foreground">Gerando QR Code...</p>
              </div>
            ) : qrCodeData && isQrActive ? (
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold mb-4">Escaneie o QR Code</h3>
                <div className="relative h-64 w-64 mb-6 border-4 border-primary rounded-lg p-2 bg-white shadow-lg">
                  <Image
                    src={`data:image/png;base64,${qrCodeData}`}
                    alt="QR Code para WhatsApp"
                    fill
                    className="object-contain"
                  />
                </div>
                <ul className="list-decimal list-inside text-sm text-muted-foreground text-left space-y-1 mb-4 max-w-md">
                  <li>Abra o WhatsApp no seu celular.</li>
                  <li>Toque em "Configurações" (ou menu de três pontos) e selecione "Aparelhos conectados".</li>
                  <li>Toque em "Conectar um aparelho".</li>
                  <li>Escaneie o QR Code exibido acima.</li>
                </ul>
                {connectionStatus === "connecting" && (
                  <p className="mt-2 text-base text-blue-600 flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Aguardando conexão... (Tempo restante: {qrTimer}s)
                  </p>
                )}
                {connectionStatus === "timeout" && (
                   <p className="mt-2 text-base text-red-600">QR Code expirado. Tente novamente.</p>
                )}
              </div>
            ) : (connectionStatus === "error" || connectionStatus === "timeout") && !qrCodeLoading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <StopCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg text-red-600 mb-6">
                  {connectionStatus === "timeout" ? "QR Code expirado." : "Falha ao gerar QR Code ou conectar."}
                </p>
                <Button
                  variant="outline"
                  onClick={() => requestNewQrCode(sessionId)} 
                  disabled={qrCodeLoading || !sessionId}
                  className="w-full max-w-xs"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-lg text-muted-foreground">Preparando para gerar QR Code...</p>
                  <Loader2 className="h-12 w-12 animate-spin text-primary mt-4" />
               </div>
            )
          )}
          {step === 3 && connectionStatus === "connected" && (
               <div className="flex flex-col items-center justify-center p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-2xl font-semibold text-green-600">WhatsApp Conectado!</h3>
                  <p className="mt-3 text-base text-muted-foreground">
                    Seu número foi conectado com sucesso.
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    (ID da Sessão: {sessionId})
                  </p>
               </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-center pt-6 border-t space-y-2 sm:space-y-0 sm:space-x-3">
          {(step === 2 && connectionStatus !== "connected" && !(connectionStatus === "error" || connectionStatus === "timeout")) && (
               <Button
                  type="button"
                  variant="outline"
                  onClick={resetToInitialState}
                  className="w-full sm:w-auto"
                >
                  Voltar ao Início
                </Button>
          )}
           {(step === 2 && (connectionStatus === "error" || connectionStatus === "timeout")) && (
               <Button
                  type="button"
                  variant="destructive"
                  onClick={resetToInitialState}
                  className="w-full sm:w-auto"
                >
                  Cancelar e Voltar ao Início
                </Button>
          )}
          {(step === 3 && connectionStatus === "connected") && (
            <Button
              type="button"
              variant="default"
              onClick={resetToInitialState} // Ou poderia navegar para outra página
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Concluir e Voltar ao Início
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
