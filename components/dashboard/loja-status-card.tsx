"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"

interface LojaStatus {
  nome: string
  completude: number
  vitrine: boolean
  produtos: number
  online: boolean
}

export function LojaStatusCard() {
  const [status, setStatus] = useState<LojaStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    // Simulação de carregamento de dados
    const timer = setTimeout(() => {
      // Dados simulados
      setStatus({
        nome: "Minha Loja",
        completude: 75,
        vitrine: true,
        produtos: 24,
        online: true,
      })
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Status da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Status da Loja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{status?.nome}</span>
              <span className="flex items-center text-xs">
                {status?.online ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    Online
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
                    Offline
                  </>
                )}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Perfil completo</span>
                <span>{status?.completude}%</span>
              </div>
              <Progress value={status?.completude} className="h-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${status?.vitrine ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Vitrine</span>
            </div>
            <div className="text-right">{status?.vitrine ? "Ativa" : "Inativa"}</div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${status?.produtos && status.produtos > 0 ? "bg-green-500" : "bg-gray-300"}`}
              ></div>
              <span>Produtos</span>
            </div>
            <div className="text-right">{status?.produtos}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
