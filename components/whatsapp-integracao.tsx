"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, QrCode, RefreshCw, Play, StopCircle } from 'lucide-react'
import Image from "next/image"

export function WhatsappIntegracao() {
  // Removed states and effects related to fetching and displaying persistent integrations
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [qrPhone, setQrPhone] = useState("")
  const [qrTimer, setQrTimer] = useState(40)
  const [isQrActive, setIsQrActive] = useState(false)
  const [isStartEndLoading, setIsStartEndLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1)

  const requestNewQrCode = async () => {
    try {
      setQrCodeLoading(true);
      setQrCodeData(null);
      setQrTimer(40);
      setIsQrActive(true);

      const response = await fetch("/api/integracoes/whatsapp/qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: qrPhone }),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ao gerar QR Code" }))
        throw new Error(errorData.error || "Erro ao gerar QR Code");
      }

      const data = await response.json();

      if (data.base64) {
        setQrCodeData(data.base64);
        toast({
          title: "QR Code gerado!",
          description: "Escaneie em 40 segundos.",
        });
      } else {
        throw new Error("Resposta da API inesperada");
      }
    } catch (error: any) {
      console.error("Erro ao gerar QR Code:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar QR Code.",
        variant: "destructive",
      });
      setQrCodeData(null);
      setIsQrActive(false);
    } finally {
      setQrCodeLoading(false);
    }
  };

  const handleStartConnection = async () => {
    if (!qrPhone) {
      toast({
        title: "Erro",
        description: "Nome e Telefone são necessários para iniciar a conexão.",
        variant: "destructive",
      });
      return;
    }
    setIsStartEndLoading(true);
    try {
      const response = await fetch("/api/integracoes/whatsapp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: qrPhone }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ao iniciar conexão" }));
        throw new Error(errorData.error || "Erro ao iniciar conexão");
      }
      toast({
        title: "Sucesso",
        description: "Instância criada. Avance para o QR Code.",
      });
      setStep(2);
    } catch (error: any) {
      console.error("Erro ao iniciar conexão:", error);
      toast({
        title: "Erro ao Iniciar",
        description: error.message || "Não foi possível iniciar a conexão.",
        variant: "destructive",
      });
    } finally {
      setIsStartEndLoading(false);
    }
  };

  const handleEndConnection = async () => {
    if (!qrPhone) {
      toast({
        title: "Erro",
        description: "Nome e Telefone são necessários para finalizar a conexão.",
        variant: "destructive",
      });
      return;
    }
    setIsStartEndLoading(true);
    try {
      const response = await fetch("/api/integracoes/whatsapp/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: qrPhone }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ error: "Erro desconhecido ao finalizar conexão" }));
        throw new Error(errorData.error || "Erro ao finalizar conexão");
      }
      toast({
        title: "Sucesso",
        description: "Comando para finalizar conexão enviado.",
      });
    } catch (error: any) {
      console.error("Erro ao finalizar conexão:", error);
      toast({
        title: "Erro ao Finalizar",
        description: error.message || "Não foi possível finalizar a conexão.",
        variant: "destructive",
      });
    } finally {
      setIsStartEndLoading(false);
    }
  };

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    if (isQrActive && qrTimer > 0) {
      timerInterval = setInterval(() => {
        setQrTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (qrTimer === 0) {
      setIsQrActive(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isQrActive, qrTimer]);

  const handleCloseDialog = () => {
    setQrCodeData(null)
    setQrCodeLoading(false)
    setIsQrActive(false)
    setQrTimer(40)
    setQrPhone("")
    setDialogOpen(false)
  }

   const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      handleCloseDialog();
    } else {
       setQrCodeData(null);
       setIsQrActive(false);
       setQrCodeLoading(false);
       setQrTimer(40);
       setQrPhone("");
     }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integração com WhatsApp</CardTitle>
          <CardDescription>
            Gere um QR Code avulso para conectar um número de WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="mt-4">
             <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <QrCode className="mr-2 h-4 w-4" /> Gerar QR Code Avulso
                </Button>
             </DialogTrigger>
           </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp / Gerar QR Code</DialogTitle>
            <DialogDescription>
              Preencha os dados para gerar um QR Code avulso.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4 min-h-[300px]">
            {step === 1 ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="qrPhone">Telefone</Label>
                  <Input
                    id="qrPhone"
                    placeholder="Número de telefone (com código do país)"
                    value={qrPhone}
                    onChange={(e) => setQrPhone(e.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleStartConnection}
                  disabled={!qrPhone || isStartEndLoading}
                >
                  {isStartEndLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Iniciar Conexão
                </Button>
              </div>
            ) : (
              qrCodeLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Gerando QR Code...</p>
                </div>
              ) : qrCodeData && isQrActive ? (
                <div className="flex flex-col items-center">
                  <div className="relative h-64 w-64">
                    <Image
                      src={`data:image/png;base64,${qrCodeData}`}
                      alt="QR Code para WhatsApp"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    {"Abra o WhatsApp no seu celular, vá em Configurações > Aparelhos conectados > Conectar um aparelho"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-center">
                    Tempo restante: {qrTimer} segundos
                  </p>
                </div>
              ) : qrCodeData && !isQrActive ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <p className="text-sm text-muted-foreground">QR Code expirado.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={requestNewQrCode}
                    disabled={qrCodeLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Gerar novo QR Code
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full">
                  <Button
                    className="w-full"
                    onClick={requestNewQrCode}
                    disabled={qrCodeLoading}
                  >
                    {qrCodeLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="mr-2 h-4 w-4" />
                    )}
                    Gerar QR Code
                  </Button>
                </div>
              )
            )}
            {step === 2 && (
              <Button
                type="button"
                variant="secondary"
                className="mt-4"
                onClick={() => setStep(1)}
              >
                Voltar
              </Button>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseDialog}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
