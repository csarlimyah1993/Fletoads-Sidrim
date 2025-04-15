"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, MoreHorizontal, Edit, Trash2, MapPin, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Importe o useRouter para navegação
import { useRouter } from "next/navigation"

// Atualize a interface Loja para incluir o novo campo enderecoFormatado
// e para refletir a estrutura real do objeto endereco

interface Endereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  latitude?: number
  longitude?: number
}

interface Loja {
  _id: string
  nome: string
  endereco: string | Endereco
  enderecoFormatado?: string
  cidade: string
  estado: string
  telefone: string
  status: string
  createdAt: string
}

export default function LojasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [lojas, setLojas] = useState<Loja[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Adicione o hook useRouter na função do componente
  const router = useRouter()

  useEffect(() => {
    async function fetchLojas() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/lojas")

        if (!response.ok) {
          throw new Error(`Erro ao buscar lojas: ${response.status}`)
        }

        const data = await response.json()
        setLojas(data.lojas || [])
      } catch (err) {
        console.error("Erro ao buscar lojas:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar lojas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLojas()
  }, [])

  const filteredLojas = lojas.filter(
    (loja) =>
      loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.estado.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatarEndereco = (endereco: any) => {
    if (!endereco) return "—"
    if (typeof endereco === "string") return endereco

    // Se endereco for um objeto, formatar como string
    const { rua, numero, complemento, bairro, cidade, estado } = endereco
    let enderecoFormatado = ""

    if (rua) enderecoFormatado += rua
    if (numero) enderecoFormatado += `, ${numero}`
    if (complemento) enderecoFormatado += ` - ${complemento}`
    if (bairro) enderecoFormatado += `, ${bairro}`

    return enderecoFormatado || "—"
  }

  // Adicione estas funções para lidar com as ações
  const handleVerMapa = (loja: Loja) => {
    // Verificar se temos coordenadas
    const latitude = typeof loja.endereco === "object" ? loja.endereco.latitude : null
    const longitude = typeof loja.endereco === "object" ? loja.endereco.longitude : null

    if (latitude && longitude) {
      // Abrir o Google Maps em uma nova aba
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, "_blank")
    } else {
      // Se não tiver coordenadas, tentar buscar pelo endereço
      const endereco = loja.enderecoFormatado || formatarEndereco(loja.endereco)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, "_blank")
    }
  }

  const handleVerVitrine = (id: string) => {
    router.push(`/vitrines/${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Lojas</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lojas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lojas..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nome</th>
                    <th className="text-left py-3 px-4 font-medium">Endereço</th>
                    <th className="text-left py-3 px-4 font-medium">Cidade/Estado</th>
                    <th className="text-left py-3 px-4 font-medium">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLojas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma loja encontrada
                      </td>
                    </tr>
                  ) : (
                    filteredLojas.map((loja) => (
                      <tr key={loja._id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{loja.nome}</td>
                        <td className="py-3 px-4">{loja.enderecoFormatado || formatarEndereco(loja.endereco)}</td>
                        <td className="py-3 px-4">
                          {typeof loja.cidade === "string" ? loja.cidade : (loja.endereco as Endereco)?.cidade || "—"},
                          {typeof loja.estado === "string" ? loja.estado : (loja.endereco as Endereco)?.estado || "—"}
                        </td>
                        <td className="py-3 px-4">{loja.telefone}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              loja.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {loja.status === "active" ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleVerMapa(loja)}
                              >
                                <MapPin className="h-4 w-4" />
                                <span>Ver no mapa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => handleVerVitrine(loja._id)}
                              >
                                <Eye className="h-4 w-4" />
                                <span>Ver vitrine</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                <Edit className="h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
