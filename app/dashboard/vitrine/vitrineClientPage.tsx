"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VitrineCustomization from "@/components/vitrine/vitrine-customization"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VitrineClientPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Vitrine</h1>

      <Tabs defaultValue="customize">
        <TabsList className="mb-4">
          <TabsTrigger value="customize">Personalizar</TabsTrigger>
          <TabsTrigger value="preview">Visualizar</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="customize">
          <VitrineCustomization />
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Prévia da Vitrine</CardTitle>
              <CardDescription>Veja como sua vitrine ficará para os clientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full border rounded-md flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Prévia da vitrine será exibida aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Vitrine</CardTitle>
              <CardDescription>Gerencie as configurações da sua vitrine online.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Configurações da vitrine serão exibidas aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
