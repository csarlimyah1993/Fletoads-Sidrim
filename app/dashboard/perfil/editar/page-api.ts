"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import PerfilEditorClient from "./perfil-editor-client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PerfilEditorPageAPI() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [lojaData, setLojaData] = useState<any>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchProfileData()
    }
  }, [status, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/perfil")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar dados do perfil")
      }

      const data = await response.json()
      setUserData(data.usuario)
      setLojaData(data.loja)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar perfil:", err)
      setError((err as Error).message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Erro ao Carregar Perfil</h1>
          <p className="text-muted-foreground">
            Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <button
          onClick={() => fetchProfileData()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <p className="text-muted-foreground">Atualize suas informações pessoais e da sua loja</p>
      </div>

      <PerfilEditorClient initialUsuario={userData} initialLoja={lojaData} />
    </div>
  )
}

