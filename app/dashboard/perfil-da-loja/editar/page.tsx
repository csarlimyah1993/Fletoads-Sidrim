"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-form"
import { LojaPerfilForm } from "@/components/perfil/loja-form"

export default function EditarPerfilPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState(null)
  const [storeData, setStoreData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch user data
        const userResponse = await fetch("/api/usuario/perfil")
        if (!userResponse.ok) {
          throw new Error("Falha ao carregar dados do usuário")
        }
        const userData = await userResponse.json()
        setUserData(userData)

        // Fetch store data
        const storeResponse = await fetch("/api/loja/perfil")
        if (storeResponse.ok) {
          const storeData = await storeResponse.json()
          setStoreData(storeData)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError(error instanceof Error ? error.message : "Erro desconhecido")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando informações...</p>
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
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <p className="text-muted-foreground">Atualize suas informações pessoais e da sua loja.</p>
      </div>

      <Tabs defaultValue="usuario" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="usuario">Perfil do Usuário</TabsTrigger>
          <TabsTrigger value="loja">Perfil da Loja</TabsTrigger>
        </TabsList>

        <TabsContent value="usuario" className="space-y-4">
          <UsuarioPerfilForm initialData={userData} />
        </TabsContent>

        <TabsContent value="loja" className="space-y-4">
          <LojaPerfilForm loja={storeData} isEditing={true} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

