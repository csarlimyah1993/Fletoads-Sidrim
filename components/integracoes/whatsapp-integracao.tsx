"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Loader2, QrCode, RefreshCw, Trash2, LogOut } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { fetchInstances, createInstance, connectInstance, checkInstanceStatus } from "@/lib/utils/evolution-api"
import { number } from "zod"

type WhatsappIntegracao = {
  _id: string
  nomeInstancia: string
  status: "pendente" | "conectado" | "desconectado" | "erro"
  telefone?: string
  ultimaConexao?: string
  createdAt: string
  updatedAt: string
}

export function WhatsappIntegracao() {
  const [step, setStep] = useState<1 | 2>(1)
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [pairingCode, setPairingCode] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [selectedIntegracao, setSelectedIntegracao] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [qrCodeInterval, setQrCodeInterval] = useState<NodeJS.Timeout | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected")
  const [formError, setFormError] = useState<string | null>(null)

  // Carregar integrações
  const [integracoes, setIntegracoes] = useState<WhatsappIntegracao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [limiteAtingido, setLimiteAtingido] = useState(false)
  const [limiteInfo, setLimiteInfo] = useState({ usado: 0, limite: 0 })

  // Carregar integrações existentes
  useEffect(() => {
    const fetchIntegracoes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/integracoes/whatsapp')
        if (response.ok) {
          const data = await response.json()
          setIntegracoes(data.integracoes || [])
          setLimiteInfo({
            usado: data.integracoes?.length || 0,
            limite: data.limiteContasWhatsapp || 0
          })
          setLimiteAtingido(data.limiteAtingido || false)
        } else {
          console.error('Erro ao carregar integrações:', await response.text())
        }
      } catch (error) {
        console.error('Erro ao buscar integrações:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIntegracoes()
  }, [])

  // Criar nova integração

  // Limpar intervalos ao desmontar o componente
  useEffect(() => {
    return () => {
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      if (qrCodeInterval) clearInterval(qrCodeInterval);
    };
  }, [statusCheckInterval, qrCodeInterval]);

  // Verificar status da conexão
  const checkConnectionStatus = async (instanceName: string) => {
    try {
      const statusData = await checkInstanceStatus(instanceName);
      console.log("Status da conexão:", statusData);
      
      // Verificar se está conectado com base na resposta da API
      if (statusData.state === "open" || statusData.state === "connected") {
        setConnectionStatus("connected");
        
        // Limpar intervalos quando conectado
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        if (qrCodeInterval) {
          clearInterval(qrCodeInterval);
          setQrCodeInterval(null);
        }
        
        // Atualizar o status da instância no banco de dados
        try {
          const updateResponse = await fetch(`/api/integracoes/whatsapp/${instanceName}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'conectado',
              telefone: telefone,
              ultimaConexao: new Date().toISOString()
            }),
          });

          if (updateResponse.ok) {
            // Atualizar a lista de integrações localmente
            const updatedData = await updateResponse.json();
            setIntegracoes(prev => 
              prev.map(integ => 
                integ.nomeInstancia === instanceName ? updatedData.integracao : integ
              )
            );
          } else {
            console.error('Erro ao atualizar status da instância:', await updateResponse.text());
          }
        } catch (updateError) {
          console.error('Erro ao atualizar status da instância:', updateError);
        }
        
        toast({
          title: "Sucesso",
          description: "WhatsApp conectado com sucesso!",
        });
      } else {
        setConnectionStatus("disconnected");
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    }
  };

  // Gerar QR Code
  const gerarQRCode = async (instanceName: string, number: string) => {
    try {
      setQrCodeLoading(true);
      setSelectedIntegracao(instanceName);
      setDialogOpen(true);
      setConnectionStatus("disconnected");

      // Obter QR code usando a função utilitária
      const data = await connectInstance(instanceName, number);

      if (data.qrcode) {
        // Extrair o QR code e o código de pareamento
        setQrCodeData(data.qrcode.base64);
        setPairingCode(data.qrcode.pairingCode);

        // Iniciar verificação de status a cada 5 segundos
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        const newStatusInterval = setInterval(() => {
          checkConnectionStatus(instanceName);
        }, 5000);
        setStatusCheckInterval(newStatusInterval);

        // Atualizar QR code a cada 30 segundos
        if (qrCodeInterval) {
          clearInterval(qrCodeInterval);
        }
        const newQrInterval = setInterval(async () => {
          try {
            const refreshData = await connectInstance(instanceName, number);
            if (refreshData.qrcode) {
              setQrCodeData(refreshData.qrcode.base64);
              setPairingCode(refreshData.qrcode.pairingCode);
            }
          } catch (error) {
            console.error("Erro ao atualizar QR code:", error);
          }
        }, 30000);
        setQrCodeInterval(newQrInterval);
      } else {
        throw new Error("QR Code não disponível na resposta da API");
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      });
    } finally {
      setQrCodeLoading(false);
    }
  };

  // Validação simples
  const validateStep1 = () => {
    if (!nome.trim()) {
      setFormError("Nome é obrigatório.")
      return false
    }
    if (!/^\+?[1-9]{1}[0-9]{7,14}$/.test(telefone)) {
      setFormError("Telefone inválido. Use o formato internacional: +5511999999999")
      return false
    }
    setFormError(null)
    return true
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // Verificar se o limite de instâncias foi atingido
    if (limiteAtingido) {
      setFormError(`Limite de contas WhatsApp atingido (${limiteInfo.usado}/${limiteInfo.limite}). Faça upgrade do seu plano para adicionar mais contas.`);
      toast({
        title: "Limite atingido",
        description: `Você atingiu o limite de contas WhatsApp do seu plano (${limiteInfo.usado}/${limiteInfo.limite}).`,
        variant: "destructive",
      });
      return;
    }

    setFormError(null); // Clear previous form errors

    try {
      // Step 1: Create the instance
      const instanceData = {
        instanceName: nome,
        number: telefone,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      };
      const createdInstance = await createInstance(instanceData);

      // Obter o nome da instância da resposta ou usar o nome fornecido
      const instanceName = createdInstance.instance?.instanceName || nome;

      // Step 2: Salvar a instância no banco de dados
      const saveResponse = await fetch('/api/integracoes/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomeInstancia: instanceName,
          telefone: telefone,
          status: 'pendente',
          evolutionApiData: createdInstance
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || "Erro ao salvar instância no banco de dados");
      }

      // Atualizar a lista de integrações
      const updatedData = await saveResponse.json();
      setIntegracoes(prev => [...prev, updatedData.integracao]);
      setLimiteInfo({
        usado: updatedData.usado || limiteInfo.usado + 1,
        limite: updatedData.limite || limiteInfo.limite
      });

      // Step 3: Se a criação da instância for bem-sucedida, obter o QR code
      setStep(2);
      await gerarQRCode(instanceName, telefone);

      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso. Escaneie o QR Code para conectar.",
      });

    } catch (error: any) {
      console.error("Erro ao criar instância:", error);
      setFormError(error.message || "Não foi possível criar a instância.");
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a instância.",
        variant: "destructive",
      });
      // Opcionalmente resetar o passo ou lidar com o estado de erro
      setStep(1);
    }
  }

  const handleGetQrCode = async () => {
    if (!nome) {
      setFormError("Nome da instância é obrigatório para gerar o QR Code");
      return;
    }
    
    try {
      await gerarQRCode(nome, telefone);
    } catch (error: any) {
      console.error("Erro ao buscar QR Code:", error);
      setFormError(error.message || "Erro ao buscar QR Code");
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Integração WhatsApp</CardTitle>
          <CardDescription>Conecte seu WhatsApp para automações.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da integração" />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="+5511999999999" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <Button type="submit" className="w-full">Conectar</Button>
            </form>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <QrCode className="w-12 h-12 mb-2 text-primary" />
                <span className="font-medium">Escaneie o QR Code abaixo para conectar</span>
              </div>
              {qrCodeLoading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
              ) : connectionStatus === "connected" ? (
                <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">WhatsApp Conectado!</h3>
                  <p className="text-center text-green-600 dark:text-green-400 mt-2">
                    Seu WhatsApp foi conectado com sucesso e está pronto para uso.
                  </p>
                </div>
              ) : qrCodeData ? (
                <>
                  <div className="flex flex-col items-center">
                    <Image src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`} alt="QR Code" width={200} height={200} />
                    <span className="text-xs text-muted-foreground mt-2">O QR Code expira em 30 segundos.</span>
                  </div>
                  <div className="flex flex-col items-center mt-4">
                    <h3 className="text-lg font-semibold mb-2">Passo 2: Conecte seu WhatsApp</h3>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 w-full">
                      <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Opção 1: Usar código de pareamento</h4>
                      {pairingCode ? (
                        <>
                          <div className="flex items-center justify-center bg-white dark:bg-gray-800 p-3 rounded-md border mb-2">
                            <span className="text-xl font-mono tracking-wider">{pairingCode}</span>
                          </div>
                          <ol className="list-decimal pl-6 text-sm text-left">
                            <li>Abra o WhatsApp no seu celular</li>
                            <li>Toque em <b>Configurações</b> &gt; <b>Aparelhos conectados</b></li>
                            <li>Toque em <b>Conectar um aparelho</b></li>
                            <li>Toque em <b>Usar código de pareamento</b></li>
                            <li>Digite o código acima</li>
                          </ol>
                        </>
                      ) : (
                        <p className="text-sm">Código de pareamento não disponível</p>
                      )}
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 w-full">
                      <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Opção 2: Escanear QR Code</h4>
                      <ol className="list-decimal pl-6 text-sm text-left mb-4">
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Toque em <b>Configurações</b> &gt; <b>Aparelhos conectados</b></li>
                        <li>Toque em <b>Conectar um aparelho</b></li>
                        <li>Aponte a câmera para o QR Code abaixo</li>
                      </ol>
                      <div className="border rounded p-4 bg-white dark:bg-gray-900">
                        <Image src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`} alt="QR Code WhatsApp" width={220} height={220} />
                      </div>
                    </div>
                    
                    <p className="mt-2 text-sm text-muted-foreground">Verificando conexão a cada 5 segundos...</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">QR Code não disponível.</div>
              )}
              <Button variant="outline" className="w-full mt-2" onClick={handleGetQrCode} disabled={qrCodeLoading}>Recarregar QR Code</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

 
 