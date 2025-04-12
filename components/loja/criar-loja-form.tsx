"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CriarLojaFormProps } from "@/types/loja"

export function CriarLojaForm({ userId }: CriarLojaFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const lojaData = {
      nome: formData.get("nome") as string,
      cnpj: formData.get("cnpj") as string,
      descricao: formData.get("descricao") as string,
      proprietarioId: userId,
      usuarioId: userId, // Adicionando usuarioId igual ao proprietarioId
      endereco: {
        rua: formData.get("rua") as string,
        numero: formData.get("numero") as string,
        complemento: formData.get("complemento") as string,
        bairro: formData.get("bairro") as string,
        cidade: formData.get("cidade") as string,
        estado: formData.get("estado") as string,
        cep: formData.get("cep") as string,
      },
      contato: {
        telefone: formData.get("telefone") as string,
        email: formData.get("email") as string,
        whatsapp: formData.get("whatsapp") as string,
      },
      categorias: ["Geral"],
      status: "ativo",
      ativo: true,
    }

    console.log("Enviando dados da loja:", lojaData)

    try {
      const response = await fetch("/api/lojas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lojaData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar loja")
      }

      const data = await response.json()
      console.log("Loja criada com sucesso:", data)

      // Associar a loja ao usuário
      await fetch(`/api/usuarios/${userId}/associar-loja`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lojaId: data.lojaId }),
      })

      // Recarregar a sessão para atualizar o lojaId
      await fetch("/api/auth/session", { method: "GET" })

      // Redirecionar para o perfil da loja
      router.push("/dashboard/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar loja:", error)
      setError(error instanceof Error ? error.message : "Erro ao criar loja")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome da Loja *</Label>
            <Input id="nome" name="nome" required />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required />
          </div>
        </div>
        <div>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" name="descricao" rows={3} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Endereço</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rua">Rua *</Label>
            <Input id="rua" name="rua" required />
          </div>
          <div>
            <Label htmlFor="numero">Número *</Label>
            <Input id="numero" name="numero" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" />
          </div>
          <div>
            <Label htmlFor="bairro">Bairro *</Label>
            <Input id="bairro" name="bairro" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cidade">Cidade *</Label>
            <Input id="cidade" name="cidade" required />
          </div>
          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Input id="estado" name="estado" required />
          </div>
          <div>
            <Label htmlFor="cep">CEP *</Label>
            <Input id="cep" name="cep" placeholder="00000-000" required />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input id="telefone" name="telefone" placeholder="(00) 0000-0000" required />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="(00) 00000-0000" />
          </div>
          <div>
            <Label htmlFor="email">Email de Contato *</Label>
            <Input id="email" name="email" type="email" required />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando..." : "Criar Loja"}
      </Button>
    </form>
  )
}
