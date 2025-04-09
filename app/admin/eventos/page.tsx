import type { Metadata } from "next"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, BarChart2, Download } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Eventos - Admin FletoAds",
  description: "Gerenciamento de eventos da plataforma",
}

interface Evento {
  _id: string
  nome: string
  local: string
  data?: string
  totalVisitantes: number
  visitantesUnicos: number
}

async function getEventos() {
  try {
    // Usar URL relativa
    const res = await fetch("/api/admin/eventos", {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Falha ao carregar eventos: ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return { eventos: [] }
  }
}

export default async function EventosPage() {
  const { eventos } = await getEventos()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Eventos</h1>
        <Button asChild>
          <Link href="/admin/eventos/novo">Novo Evento</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total de Visitantes</TableHead>
              <TableHead>Visitantes Únicos</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos && eventos.length > 0 ? (
              eventos.map((evento: Evento) => (
                <TableRow key={evento._id}>
                  <TableCell className="font-medium">{evento.nome}</TableCell>
                  <TableCell>{evento.local}</TableCell>
                  <TableCell>
                    {evento.data ? format(new Date(evento.data), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                  </TableCell>
                  <TableCell>{evento.totalVisitantes}</TableCell>
                  <TableCell>{evento.visitantesUnicos}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/eventos/${evento._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/eventos/${evento._id}/metricas`}>
                          <BarChart2 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Nenhum evento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

