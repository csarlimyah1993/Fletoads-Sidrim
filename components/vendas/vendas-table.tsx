"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, FileText, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Venda {
  id: string
  customer: string
  product: string
  amount: number
  status: "completed" | "pending" | "canceled"
  date: string
}

interface VendasTableProps {
  vendas: Venda[]
}

export function VendasTable({ vendas }: VendasTableProps) {
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-500/20 text-green-500 hover:bg-green-500/20 hover:text-green-500"
          >
            Concluído
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500"
          >
            Pendente
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 hover:bg-red-500/20 hover:text-red-500">
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewDetails = (id: string) => {
    // Implementação futura de visualização de detalhes
    toast({
      title: "Visualizar detalhes",
      description: `Visualizando detalhes da venda ${id}`,
    })
  }

  const handleGenerateInvoice = (id: string) => {
    // Implementação futura de geração de nota fiscal
    toast({
      title: "Gerar nota fiscal",
      description: `Gerando nota fiscal para a venda ${id}`,
    })
  }

  const handleReportIssue = (id: string) => {
    // Implementação futura de relatório de problemas
    toast({
      title: "Reportar problema",
      description: `Reportando problema com a venda ${id}`,
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendas.map((venda) => (
            <TableRow key={venda.id}>
              <TableCell className="font-medium">{venda.customer}</TableCell>
              <TableCell>{venda.product}</TableCell>
              <TableCell>{formatCurrency(venda.amount)}</TableCell>
              <TableCell>{getStatusBadge(venda.status)}</TableCell>
              <TableCell>{venda.date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(venda.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateInvoice(venda.id)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar nota fiscal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleReportIssue(venda.id)} className="text-red-500">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reportar problema
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

