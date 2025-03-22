"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-perfil-form"
import { LojaPerfilForm } from "@/components/perfil/loja-perfil-form"
import { User, Store } from "lucide-react"

interface CriarLojaFormProps {
  userId: string
}

export function CriarLojaForm({ userId }: CriarLojaFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("usuario")

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Criar Nova Loja</CardTitle>
        <CardDescription>
          Preencha as informações do seu perfil e da sua loja para começar a usar o FletoAds
        </CardDescription>
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
            <UsuarioPerfilForm />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={() => setActiveTab("loja")}>Próximo: Perfil da Loja</Button>
            </div>
          </TabsContent>

          <TabsContent value="loja">
            <LojaPerfilForm />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("usuario")}>
                Voltar: Perfil do Usuário
              </Button>
              <Button onClick={handleCancel}>Finalizar</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

