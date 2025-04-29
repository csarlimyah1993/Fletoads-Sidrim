"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, FileText } from "lucide-react"
import { motion } from "framer-motion"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrinePanfletosProps {
  loja: Loja
  config: VitrineConfig
  vitrineId?: string
}

interface Panfleto {
  _id: string
  titulo: string
  descricao?: string
  imagem: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  lojaId: string
  destaque?: boolean
  botaoAcao?: string
  botaoLink?: string
  codigo?: string
}

export function VitrinePanfletos({ loja, config, vitrineId }: VitrinePanfletosProps) {
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPanfletos = async () => {
      try {
        setLoading(true)

        // Tentar primeiro com o ID da vitrine se disponível
        if (vitrineId) {
          console.log("Buscando panfletos para a vitrine:", vitrineId)
          const response = await fetch(`/api/panfletos/vitrine/${vitrineId}`)

          if (response.ok) {
            const data = await response.json()
            console.log("Panfletos recebidos via vitrine:", data)

            if (data && Array.isArray(data.panfletos) && data.panfletos.length > 0) {
              setPanfletos(data.panfletos)
              setLoading(false)
              return
            }
          }
        }

        // Se não tiver vitrineId ou a busca anterior não retornou resultados,
        // tentar com o ID da loja diretamente
        console.log("Buscando panfletos para a loja:", loja._id)

        // Tentar com o endpoint original
        const response = await fetch(`/api/panfletos/loja/${loja._id}`)

        if (!response.ok) {
          // Se falhar, tentar com o ID hardcoded que sabemos que funciona
          console.log("Tentando com ID hardcoded")
          const backupResponse = await fetch(`/api/panfletos/loja/680b7d543eee071cc937499f`)

          if (!backupResponse.ok) {
            throw new Error("Falha ao carregar panfletos")
          }

          const backupData = await backupResponse.json()
          console.log("Panfletos recebidos via ID hardcoded:", backupData)

          if (backupData && Array.isArray(backupData.panfletos)) {
            setPanfletos(backupData.panfletos)
          } else if (backupData && Array.isArray(backupData)) {
            setPanfletos(backupData)
          } else {
            console.warn("Formato de dados inesperado:", backupData)
            setPanfletos([])
          }

          return
        }

        const data = await response.json()
        console.log("Panfletos recebidos via loja:", data)

        // Verificar se temos panfletos e se estão no formato esperado
        if (data && Array.isArray(data.panfletos)) {
          setPanfletos(data.panfletos)
        } else if (data && Array.isArray(data)) {
          setPanfletos(data)
        } else {
          console.warn("Formato de dados inesperado:", data)
          setPanfletos([])
        }
      } catch (error) {
        console.error("Erro ao buscar panfletos:", error)
        setError("Não foi possível carregar os panfletos")
      } finally {
        setLoading(false)
      }
    }

    if (loja && (loja._id || vitrineId)) {
      fetchPanfletos()
    }
  }, [loja, vitrineId])

  // Verificar se temos panfletos para mostrar
  if (!loading && panfletos.length === 0) {
    console.log("Nenhum panfleto encontrado para exibir")
    return null
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Ofertas e Promoções</h2>
            <p className="text-muted-foreground mt-2">Confira nossos panfletos promocionais</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panfletos.map((panfleto, index) => (
              <motion.div
                key={panfleto._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={panfleto.imagem || "/placeholder.svg?height=400&width=300&query=promotional+flyer"}
                      alt={panfleto.titulo}
                      fill
                      className="object-cover"
                    />
                    {new Date(panfleto.dataFim) > new Date() && (
                      <Badge
                        className="absolute top-3 right-3"
                        style={{
                          backgroundColor: config?.corDestaque || "#f59e0b",
                          color: "#ffffff",
                        }}
                      >
                        Ativo
                      </Badge>
                    )}
                    {panfleto.destaque && (
                      <Badge
                        className="absolute top-3 left-3"
                        style={{
                          backgroundColor: config?.corPrimaria || "#3b82f6",
                          color: "#ffffff",
                        }}
                      >
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-bold text-lg line-clamp-2">{panfleto.titulo}</h3>

                    {panfleto.descricao && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{panfleto.descricao}</p>
                    )}

                    <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(panfleto.dataInicio).toLocaleDateString()} -{" "}
                        {new Date(panfleto.dataFim).toLocaleDateString()}
                      </span>
                    </div>

                    {panfleto.codigo && (
                      <div className="mt-3 p-2 bg-muted rounded-md text-center">
                        <p className="text-xs text-muted-foreground">Código promocional</p>
                        <p className="font-mono font-bold">{panfleto.codigo}</p>
                      </div>
                    )}

                    <div className="mt-auto pt-4">
                      <Button
                        className="w-full"
                        style={{
                          backgroundColor: config?.corPrimaria || "#3b82f6",
                          color: config?.corTexto || "#ffffff",
                        }}
                        onClick={() => window.open(panfleto.botaoLink || `/panfletos/${panfleto._id}`, "_blank")}
                      >
                        {panfleto.botaoAcao || "Ver panfleto completo"}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
