"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { QRCodeGenerator } from "@/components/perfil/qr-code-generator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

// Define the Loja type
interface Loja {
  _id: string
  nome: string
  logo?: string
  [key: string]: any
}

export default function VitrinePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loja, setLoja] = useState<Loja | null>(null)
  const [vitrineUrl, setVitrineUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchLoja()
    }
  }, [session])

  async function fetchLoja() {
    try {
      setIsLoading(true)
      const response = await fetch("/api/loja/me")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setLoja(data)
      setVitrineUrl(`${process.env.NEXT_PUBLIC_APP_URL}/loja/${data._id}`)
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar loja",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyVitrineUrl = () => {
    navigator.clipboard.writeText(vitrineUrl)
    toast({
      title: "Sucesso",
      description: "URL da vitrine copiada!",
    })
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Vitrine</h1>
        <div className="space-y-2">
          <Skeleton className="w-[200px] h-8" />
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    )
  }

  if (!loja) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Vitrine</h1>
        <p>Você ainda não possui uma loja. Crie uma para ter sua vitrine.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Vitrine</h1>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vitrineUrl">
          URL da Vitrine
        </label>
        <div className="flex items-center">
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="vitrineUrl"
            type="text"
            value={vitrineUrl}
            readOnly
          />
          <Button variant="outline" size="sm" className="ml-2" onClick={handleCopyVitrineUrl}>
            <Copy className="h-4 w-4 mr-2" />
            Copiar
          </Button>
        </div>
      </div>

      <div>
        <QRCodeGenerator url={vitrineUrl} logoUrl={loja.logo} storeName={loja.nome} storeId={loja._id} />
      </div>
    </div>
  )
}
