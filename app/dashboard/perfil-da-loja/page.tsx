"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LojaPerfilContent } from "@/components/perfil/loja-perfil-content"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export default function PerfilDaLojaPage() {
  const [loja, setLoja] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        setLoading(true)
        setError(null)

        // Primeiro, tente buscar pelo endpoint específico de perfil da loja
        let response = await fetch("/api/loja/perfil")

        // Se não encontrar, tente buscar pela API geral de lojas
        if (response.status === 404) {
          console.log("Loja não encontrada no endpoint de perfil, tentando endpoint alternativo...")
          response = await fetch("/api/loja")
        }

        if (response.status === 404) {
          // Loja não encontrada em nenhum endpoint
          setLoja(null)
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da loja: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Dados da loja recebidos:", data)

        // Verificar a estrutura da resposta e extrair os dados da loja
        const lojaData = data.loja || data.data || data
        setLoja(lojaData)
      } catch (err) {
        console.error("Erro ao buscar loja:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados da loja")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da loja. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLoja()
  }, [toast])

  const handleCriarLoja = () => {
    router.push("/dashboard/perfil-da-loja/criar")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Perfil da Loja</h1>
        </div>
        <div className="relative h-48 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <Skeleton className="h-full w-full" />
          <div className="absolute -bottom-16 left-8">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        </div>
        <div className="pt-20">
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-4 w-2/3 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Perfil da Loja</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Erro ao carregar dados</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  if (!loja) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Perfil da Loja</h1>
        </div>
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Você ainda não tem uma loja</h2>
            <p className="text-muted-foreground">
              Crie sua loja para ter uma vitrine online e começar a vender seus produtos e serviços.
            </p>
          </div>
          <Button onClick={handleCriarLoja}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Loja
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil da Loja</h1>
      </div>
      <LojaPerfilContent loja={loja} />
    </div>
  )
}

