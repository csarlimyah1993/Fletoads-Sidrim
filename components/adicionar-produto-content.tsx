"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function AdicionarProdutoContent() {
  console.log("Renderizando AdicionarProdutoContent")
  const router = useRouter()
  const [imagem, setImagem] = useState<string | null>(null)

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagem(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar lógica de salvar
    router.push("/vitrine")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Informações básicas</h2>

              {/* Upload de imagem */}
              <div className="mb-6">
                <div className="relative h-[240px] w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                  {imagem ? (
                    <Image src={imagem || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Clique para fazer upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImagemChange}
                  />
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-blue-600">
                    Alterar imagem
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Aceitamos os formatos jpg e png com menos de 500kb. Sugestão de tamanho: 750 x 750px
                </p>
              </div>

              {/* Nome */}
              <div className="mb-4">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" className="mb-1" />
                <p className="text-xs text-gray-500">
                  Esse nome será exibido em todos os locais da Kirvano - (0/60 caracteres)
                </p>
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  className="h-32 mb-1"
                  placeholder="Crie e distribua panfletos dentro do Fleto App&#10;Obtenha o perfil de consumo dos clientes&#10;Disponibilize cupons de desconto&#10;Escaneie seus produtos para clientes que usam o QR Code"
                />
                <p className="text-xs text-gray-500">177/200 caracteres</p>
              </div>
            </Card>

            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Suporte ao comprador</h2>
              <p className="text-sm text-gray-600 mb-4">Informações que serão apresentadas ao seu cliente.</p>

              {/* Nome do vendedor */}
              <div className="mb-4">
                <Label htmlFor="vendedor">Nome do vendedor</Label>
                <Input id="vendedor" defaultValue="Reszon Ltda." />
              </div>

              {/* Email */}
              <div className="mb-4">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Input id="email" defaultValue="contato@fletoads.com" className="pl-10" />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="telefone">
                  Telefone <span className="text-gray-400">(opcional)</span>
                </Label>
                <div className="relative">
                  <Input id="telefone" className="pl-10" />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

