"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointer, ShoppingCart, BarChart } from "lucide-react"
import type { VitrineMetricasProps } from "@/types/vitrine"

export function VitrineMetricas({ loja }: VitrineMetricasProps) {
  const [isProprietario, setIsProprietario] = useState(false)
  const [metricas, setMetricas] = useState({
    visualizacoes: 0,
    interacoes: 0,
    conversoes: 0,
    cliques: 0,
  })

  // Verificar se o usuário atual é o proprietário da loja
  useEffect(() => {
    const verificarProprietario = async () => {
      try {
        const response = await fetch(`/api/vitrines/${loja._id}/proprietario`)
        if (response.ok) {
          const data = await response.json()
          setIsProprietario(data.isProprietario)
        }
      } catch (error) {
        console.error("Erro ao verificar proprietário:", error)
      }
    }

    verificarProprietario()
  }, [loja._id])

  // Buscar métricas se for o proprietário
  useEffect(() => {
    if (isProprietario) {
      const buscarMetricas = async () => {
        try {
          const response = await fetch(`/api/vitrines/${loja._id}/metricas`)
          if (response.ok) {
            const data = await response.json()
            setMetricas(data.metricas)
          }
        } catch (error) {
          console.error("Erro ao buscar métricas:", error)
        }
      }

      buscarMetricas()
    }
  }, [isProprietario, loja._id])

  // Se não for o proprietário, não mostrar nada
  if (!isProprietario) {
    return null
  }

  return (
    <section className="py-8 px-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-b border-yellow-100 dark:border-yellow-900/30">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Métricas da Vitrine</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Apenas você e administradores podem ver esta seção</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                Visualizações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.visualizacoes}</div>
              <p className="text-xs text-gray-500">Total de visualizações da vitrine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MousePointer className="h-4 w-4 mr-2 text-green-500" />
                Interações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.interacoes}</div>
              <p className="text-xs text-gray-500">Cliques em produtos e botões</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2 text-purple-500" />
                Conversões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricas.conversoes}</div>
              <p className="text-xs text-gray-500">Ações de compra ou contato</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-orange-500" />
                Taxa de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricas.visualizacoes > 0 ? ((metricas.conversoes / metricas.visualizacoes) * 100).toFixed(1) : "0.0"}
                %
              </div>
              <p className="text-xs text-gray-500">Conversões / Visualizações</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
