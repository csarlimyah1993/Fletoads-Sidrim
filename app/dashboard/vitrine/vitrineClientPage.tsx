"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface VitrineClientPageProps {
  vitrine: any
  loja: any
}

export default function VitrineClientPage({ vitrine, loja }: VitrineClientPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loja) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-lg mb-4">Você ainda não possui uma loja cadastrada.</p>
          <Button asChild>
            <Link href="/dashboard/perfil-da-loja/criar">Criar Loja</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Personalização da Vitrine</h2>
        {vitrine && (
          <Button variant="outline" asChild>
            <Link href={`/vitrines/${vitrine._id}`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Vitrine
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="personalizacao">
        <TabsList>
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="personalizacao" className="mt-6">
          {vitrine ? (
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Vitrine</CardTitle>
                <CardDescription>Personalize a aparência da sua vitrine online</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/vitrine/editar">Editar Configurações</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Vitrine não configurada</CardTitle>
                <CardDescription>Você ainda não configurou sua vitrine online</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/dashboard/vitrine/criar">Configurar Vitrine</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="produtos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos na Vitrine</CardTitle>
              <CardDescription>Gerencie os produtos que aparecem na sua vitrine online.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/produtos/novo">Adicionar Produto</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas da Vitrine</CardTitle>
              <CardDescription>Acompanhe o desempenho da sua vitrine online.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Estatísticas em breve disponíveis.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
