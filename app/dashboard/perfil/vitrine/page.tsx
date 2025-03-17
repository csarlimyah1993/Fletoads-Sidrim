"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function VitrineManagerPage() {
  const [loading, setLoading] = useState(true)
  const [loja, setLoja] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")

  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }

    const fetchLojaData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/loja/perfil")

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da loja: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados da loja recebidos:", data)

        if (!data || Object.keys(data).length === 0) {
          setLoja(null)
          setError("Loja não encontrada")
        } else {
          setLoja(data)
          setError(null)
        }
      } catch (err) {
        console.error("Erro ao buscar dados da loja:", err)
        setError("Erro ao carregar dados da loja")
        setLoja(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLojaData()
  }, [tab])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !loja) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loja não encontrada</CardTitle>
          <CardDescription>{error || "Você precisa criar uma loja antes de acessar a vitrine."}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/perfil/editar">Criar Loja</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Construir a URL da vitrine
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000"
  const vitrineUrl = `${baseUrl}/vitrine/${loja.slug || loja._id}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/perfil">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Gerenciar Vitrine</h2>
        </div>
        <Button asChild variant="outline">
          <Link href={vitrineUrl} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar Vitrine
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização da Vitrine</CardTitle>
              <CardDescription>Veja como sua vitrine aparece para os clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden h-[600px]">
                <iframe src={vitrineUrl} className="w-full h-full" title="Pré-visualização da Vitrine" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode" className="space-y-4">
          <QRCodeGenerator url={vitrineUrl} logoUrl={loja.logo} storeName={loja.nome} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Vitrine</CardTitle>
              <CardDescription>Personalize como sua vitrine aparece para os clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurações avançadas da vitrine estarão disponíveis em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

