"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Eye } from "lucide-react"
import Link from "next/link"
import { VitrineCustomization } from "@/components/vitrine/vitrine-customization"
import { DatabaseErrorFallbackClient } from "@/components/database-error-fallback-client"

interface VitrineClientPageProps {
  lojaId: string
}

export default function VitrineClientPage({ lojaId }: VitrineClientPageProps) {
  const [error, setError] = useState<boolean>(false)

  // Verificar se o componente pode ser renderizado
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/check-connection")
        if (!response.ok) {
          setError(true)
        }
      } catch (err) {
        console.error("Erro ao verificar conexão:", err)
        setError(true)
      }
    }

    checkConnection()
  }, [])

  if (error) {
    return <DatabaseErrorFallbackClient />
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vitrine Online</h1>
          <p className="text-muted-foreground">Personalize e gerencie sua vitrine online</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/vitrines/${lojaId}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar Vitrine
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <VitrineCustomization lojaId={lojaId} />

        <Card>
          <CardHeader>
            <CardTitle>Link da Vitrine</CardTitle>
            <CardDescription>Compartilhe sua vitrine online com seus clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto">
                {`${process.env.NEXT_PUBLIC_APP_URL || "https://fletoads.vercel.app"}/vitrines/${lojaId}`}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.NEXT_PUBLIC_APP_URL || "https://fletoads.vercel.app"}/vitrines/${lojaId}`,
                  )
                }}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Copiar link</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

