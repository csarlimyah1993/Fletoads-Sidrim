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
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [planoInfo, setPlanoInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Buscar dados do plano
  useEffect(() => {
    const fetchPlanoInfo = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setPlanoInfo(data)
        }
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
      }
    }

    fetchPlanoInfo()
  }, [])

  // Buscar dados da loja
  useEffect(() => {
    let isMounted = true

    const fetchLoja = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/loja/perfil")

        if (!isMounted) return

        if (response.status === 404) {
          // Loja não encontrada, mostrar página para criar
          setLoja(null)
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error("Erro ao buscar dados da loja")
        }

        const data = await response.json()
        setLoja(data.loja)

        // Buscar produtos apenas se a loja existir
        if (data.loja && data.loja._id) {
          fetchProdutos(data.loja._id)
        }
      } catch (err) {
        console.error("Erro ao buscar loja:", err)
        if (isMounted) {
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados da loja. Tente novamente mais tarde.",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchLoja()

    return () => {
      isMounted = false
    }
  }, [toast])

  // Função para buscar produtos
  const fetchProdutos = async (lojaId: string) => {
    try {
      setLoadingProdutos(true)
      const response = await fetch(`/api/produtos?lojaId=${lojaId}&limit=4`)

      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
      setLoadingProdutos(false)
    }
  }

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
      <LojaPerfilContent loja={loja} produtos={produtos} isLoading={loadingProdutos} planoInfo={planoInfo} />
    </div>
  )
}