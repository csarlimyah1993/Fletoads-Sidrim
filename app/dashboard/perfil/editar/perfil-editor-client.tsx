"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-form"
import { LojaPerfilForm } from "@/components/perfil/loja-form"

export default function PerfilEditorClient({
  initialUsuario,
  initialLoja,
}: {
  initialUsuario: any
  initialLoja: any
}) {
  const [activeTab, setActiveTab] = useState("usuario")

  return (
    <Tabs defaultValue="usuario" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="usuario">Dados Pessoais</TabsTrigger>
        <TabsTrigger value="loja">Dados da Loja</TabsTrigger>
      </TabsList>
      <TabsContent value="usuario" className="space-y-4">
        <Card className="p-6">
          <UsuarioPerfilForm initialData={initialUsuario} />
        </Card>
      </TabsContent>
      <TabsContent value="loja" className="space-y-4">
        <Card className="p-6">
          <LojaPerfilForm loja={initialLoja} isEditing={true} />
        </Card>
      </TabsContent>
    </Tabs>
  )
}

