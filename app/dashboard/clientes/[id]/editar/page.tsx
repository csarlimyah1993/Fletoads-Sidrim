"use client"

import { ClienteForm } from "@/components/clientes/cliente-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { notFound, redirect } from "next/navigation"

interface Cliente {
  _id: string
  nome: string
  email: string
  telefone: string
  documento: string
  status: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  categoriasPreferidasArray?: string[]
  observacoes?: string
}

interface PageProps {
  params: { id: string }
}

export default async function EditarClientePage({ params }: PageProps) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clientes/${params.id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return notFound()
    }

    const data = await response.json()
    const cliente: Cliente = data.cliente

    if (!cliente) return notFound()

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => redirect(`/dashboard/clientes/${params.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
        </div>
        <div className="grid gap-4">
          <ClienteForm cliente={cliente} />
        </div>
      </div>
    )
  } catch (err) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-lg font-medium text-center">Erro ao carregar cliente</p>
            <Button onClick={() => redirect("/dashboard/clientes")} className="mt-4">
              Voltar para a lista de clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
