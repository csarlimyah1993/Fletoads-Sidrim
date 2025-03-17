"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-form"
import { LojaPerfilForm } from "@/components/perfil/loja-form"
import { User, Store } from "lucide-react"
import { toast } from "sonner"

export default function PerfilEditorPageClient() {
  const [activeTab, setActiveTab] = useState<string>("usuario")
  const [usuario, setUsuario] = useState<any>(null)
  const [loja, setLoja] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching user and store data...")

        // Fetch user data
        const userResponse = await fetch("/api/usuario/perfil")
        if (!userResponse.ok) {
          throw new Error("Falha ao buscar dados do usuário")
        }
        const userData = await userResponse.json()
        setUsuario(userData)
        console.log("User data fetched:", userData)

        // Fetch store data
        const storeResponse = await fetch("/api/loja/perfil")
        // It's okay if the store doesn't exist yet
        if (storeResponse.status !== 404) {
          const storeData = await storeResponse.json()
          setLoja(storeData)
          console.log("Store data fetched:", storeData)
        } else {
          console.log("No store found, will create a new one")
          setLoja({})
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setError(error instanceof Error ? error.message : "Erro desconhecido")
        toast.error("Erro ao carregar dados do perfil. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <p className="text-muted-foreground">Atualize suas informações pessoais e da loja</p>
      </div>

      <Tabs defaultValue="usuario" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usuario" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Perfil do Usuário</span>
          </TabsTrigger>
          <TabsTrigger value="loja" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>Perfil da Loja</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuario">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>Atualize suas informações pessoais, incluindo CPF e dados de contato.</CardDescription>
            </CardHeader>
            <CardContent>{usuario && <UsuarioPerfilForm initialData={usuario} />}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loja">
          <Card>
            <CardHeader>
              <CardTitle>Perfil da Loja</CardTitle>
              <CardDescription>
                Atualize as informações da sua loja, incluindo CNPJ, endereço e contatos.
              </CardDescription>
            </CardHeader>
            <CardContent>{loja && <LojaPerfilForm loja={loja} isEditing={Object.keys(loja).length > 0} />}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

