"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Loader2, QrCode, RefreshCw, Trash2, LogOut } from 'lucide-react'
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

type WhatsappIntegracao = {
  _id: string
  nomeInstancia: string
  status: "pendente" | "conectado" | "desconectado" | "erro"
  evolutionApiUrl: string
  apiKey: string
  telefone?: string
  ultimaConexao?: string
  createdAt: string
  updatedAt: string
}

export function WhatsappIntegracao() {
  const [integracoes, setIntegracoes] = useState<WhatsappIntegracao[]>([])
  const [loading, setLoading] = useState(true)
  const [novaIntegracao, setNovaIntegracao] = useState({
    nomeInstancia: "",
    evolutionApiUrl: "http://localhost:8080",
    apiKey: "",
  })
  const [qrCodeData, setQrCodeData] = useState<string | null>(null)
  const [qrCodeLoading, setQrCodeLoading] = useState(false)
  const [selectedIntegracao, setSelectedIntegracao] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)

  // Carregar integrações
  const carregarIntegracoes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/integracoes/whatsapp")
      if (!response.ok) {
        throw new Error("Erro ao carregar integrações")
      }
      const data = await response.json()
      setIntegracoes(data)
    } catch (error) {
      console.error("Erro ao carregar integrações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações do WhatsApp",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarIntegracoes()
  }, [])

  // Criar nova integração
  const criarIntegracao = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/integracoes/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaIntegracao),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar integração")
      }

      const data = await response.json()
      setIntegracoes([...integracoes, data])
      setNovaIntegracao({
        nomeInstancia: "",
        evolutionApiUrl: "http://localhost:8080",
        apiKey: "",
      })
      toast({
        title: "Sucesso",
        description: "Integração criada com sucesso",
      })
    } catch (error: any) {
      console.error("Erro ao criar integração:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a integração",
        variant: "destructive",
      })
    }
  }

  // Gerar QR Code
  const gerarQRCode = async (id: string) => {
    try {
      setQrCodeLoading(true)
      setSelectedIntegracao(id)
      setDialogOpen(true)
      
      const response = await fetch(`/api/integracoes/whatsapp/${id}/qrcode`)
      if (!response.ok) {
        throw new Error("Erro ao gerar QR Code")
      }
      
      const data = await response.json()
      
      if (data.qrcode) {
        setQrCodeData(data.qrcode)
        
        // Iniciar verificação de status
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
        }
        
        const interval = setInterval(() => verificarStatus(id), 3000)
        setStatusCheckInterval(interval)
      } else {
        throw new Error("QR Code não disponível")
      }
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        variant: "destructive",
      })
    } finally {
      setQrCodeLoading(false)
    }
  }

  // Verificar status da conexão
  const verificarStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/integracoes/whatsapp/${id}/status`)
      if (!response.ok) {
        throw new Error("Erro ao verificar status")
      }
      
      const data = await response.json()
      
      // Atualizar a lista de integrações com o novo status
      setIntegracoes(prevIntegracoes => 
        prevIntegracoes.map(integracao => 
          integracao._id === id 
            ? { ...integracao, status: data.status } 
            : integracao
        )
      )
      
      // Se conectado, limpar o intervalo e fechar o diálogo
      if (data.status === "conectado") {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval)
          setStatusCheckInterval(null)
        }
        
        toast({
          title: "Sucesso!",
          description: `Seu WhatsApp foi conectado à instância ${integracoes.find(i => i._id === id)?.nomeInstancia}`,
        })
        
        setQrCodeData(null)
        setDialogOpen(false)
        carregarIntegracoes() // Recarregar para obter informações atualizadas
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  // Desconectar WhatsApp
  const desconectarWhatsapp = async (id: string) => {
    try {
      const response = await fetch(`/api/integracoes/whatsapp/${id}/desconectar`, {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Erro ao desconectar WhatsApp")
      }
      
      toast({
        title: "Sucesso",
        description: "WhatsApp desconectado com sucesso",
      })
      
      carregarIntegracoes()
    } catch (error) {
      console.error("Erro ao desconectar WhatsApp:", error)
      toast({
        title: "Erro",
        description: "Não foi possível desconectar o WhatsApp",
        variant: "destructive",
      })
    }
  }

  // Excluir integração
  const excluirIntegracao = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta integração?")) {
      return
    }
    
    try {
      const response = await fetch(`/api/integracoes/whatsapp/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        throw new Error("Erro ao excluir integração")
      }
      
      setIntegracoes(integracoes.filter(integracao => integracao._id !== id))
      
      toast({
        title: "Sucesso",
        description: "Integração excluída com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir integração:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a integração",
        variant: "destructive",
      })
    }
  }

  // Limpar intervalo ao desmontar o componente
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

  // Fechar diálogo
  const handleCloseDialog = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }
    setQrCodeData(null)
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integração com WhatsApp</CardTitle>
          <CardDescription>
            Conecte seu WhatsApp para enviar mensagens através da Evolution API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={criarIntegracao} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nomeInstancia">Nome da Instância</Label>
                <Input
                  id="nomeInstancia"
                  placeholder="minha-instancia"
                  value={novaIntegracao.nomeInstancia}
                  onChange={(e) =>
                    setNovaIntegracao({
                      ...novaIntegracao,
                      nomeInstancia: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  placeholder="Chave de API da Evolution API"
                  value={novaIntegracao.apiKey}
                  onChange={(e) =>
                    setNovaIntegracao({
                      ...novaIntegracao,
                      apiKey: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="evolutionApiUrl">URL da Evolution API</Label>
                <Input
                  id="evolutionApiUrl"
                  placeholder="http://localhost:8080"
                  value={novaIntegracao.evolutionApiUrl}
                  onChange={(e) =>
                    setNovaIntegracao({
                      ...novaIntegracao,
                      evolutionApiUrl: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Deixe o padrão se estiver usando localmente
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Adicionar Integração
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card className="col-span-full flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </Card>
        ) : integracoes.length === 0 ? (
          <Card className="col-span-full p-8">
            <div className="text-center text-muted-foreground">
              <p>Nenhuma integração configurada</p>
            </div>
          </Card>
        ) : (
          integracoes.map((integracao) => (
            <Card key={integracao._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{integracao.nomeInstancia}</CardTitle>
                  <Badge
                    variant={
                      integracao.status === "conectado"
                        ? "success"
                        : integracao.status === "pendente"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      integracao.status === "conectado"
                        ? "bg-green-500 hover:bg-green-600"
                        : integracao.status === "pendente"
                        ? ""
                        : "bg-red-500 hover:bg-red-600"
                    }
                  >
                    {integracao.status === "conectado"
                      ? "Conectado"
                      : integracao.status === "pendente"
                      ? "Pendente"
                      : "Desconectado"}
                  </Badge>
                </div>
                <CardDescription>
                  {integracao.telefone
                    ? `Conectado ao número ${integracao.telefone}`
                    : "Nenhum telefone conectado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">URL da API:</span>{" "}
                    {integracao.evolutionApiUrl}
                  </div>
                  {integracao.ultimaConexao && (
                    <div className="text-sm">
                      <span className="font-medium">Última conexão:</span>{" "}
                      {new Date(integracao.ultimaConexao).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => gerarQRCode(integracao._id)}
                  disabled={qrCodeLoading && selectedIntegracao === integracao._id}
                >
                  {qrCodeLoading && selectedIntegracao === integracao._id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="mr-2 h-4 w-4" />
                  )}
                  {integracao.status === "conectado"
                    ? "Reconectar"
                    : "Conectar"}
                </Button>
                <div className="flex space-x-2">
                  {integracao.status === "conectado" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => desconectarWhatsapp(integracao._id)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Desconectar
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => excluirIntegracao(integracao._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com seu WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrCodeLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Gerando QR Code...
                </p>
              </div>
            ) : qrCodeData ? (
              <div className="flex flex-col items-center">
                <div className="relative h-64 w-64">
                  <Image
                    src={`data:image/png;base64,${qrCodeData}`}
                    alt="QR Code para WhatsApp"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">
                  Não foi possível gerar o QR Code
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => selectedIntegracao && gerarQRCode(selectedIntegracao)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
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
