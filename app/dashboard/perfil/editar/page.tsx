"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-perfil-form"
import { LojaEditForm } from "@/components/perfil/loja-edit-form"
import { Loader2, User, Store } from "lucide-react"

export default function EditarPerfilPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [loja, setLoja] = useState<any>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("loja")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch loja data
        const lojaResponse = await fetch("/api/loja/perfil")
        if (!lojaResponse.ok && lojaResponse.status !== 404) {
          throw new Error("Erro ao buscar dados da loja")
        }

        if (lojaResponse.status === 200) {
          const lojaData = await lojaResponse.json()
          setLoja(lojaData.loja || null)
        }

        // Fetch usuario data
        const usuarioResponse = await fetch("/api/usuario/perfil")
        if (!usuarioResponse.ok && usuarioResponse.status !== 404) {
          throw new Error("Erro ao buscar dados do usuário")
        }

        if (usuarioResponse.status === 200) {
          const usuarioData = await usuarioResponse.json()
          setUsuario(usuarioData || null)
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setError("Não foi possível carregar os dados. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCancel = () => {
    router.push("/dashboard/perfil-da-loja")
  }

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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
          <CardDescription>Atualize as informações do seu perfil e da sua loja</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
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
              <UsuarioPerfilForm initialData={usuario} />
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={() => setActiveTab("loja")}>Próximo: Perfil da Loja</Button>
              </div>
            </TabsContent>

            <TabsContent value="loja">
              {loja ? (
                <LojaEditForm loja={loja} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Você ainda não tem uma loja cadastrada.</p>
                  <Button onClick={() => router.push("/dashboard/perfil-da-loja/criar")}>Criar Loja</Button>
                </div>
              )}
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setActiveTab("usuario")}>
                  Voltar: Perfil do Usuário
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Concluir
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

