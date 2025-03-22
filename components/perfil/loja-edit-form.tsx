"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// Atualize a interface LojaEditFormProps para incluir a propriedade isCriacao
interface LojaEditFormProps {
  loja: any
  isCriacao?: boolean
}

// Atualize a função LojaEditForm para usar a propriedade isCriacao
export function LojaEditForm({ loja, isCriacao = false }: LojaEditFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: loja.nome || "",
    descricao: loja.descricao || "",
    endereco: loja.endereco || "",
    telefone: loja.telefone || "",
    email: loja.email || "",
    website: loja.website || "",
    horarioFuncionamento: loja.horarioFuncionamento || "",
    dataFundacao: loja.dataFundacao || "",
    numeroFuncionarios: loja.numeroFuncionarios || "",
    redesSociais: {
      instagram: loja.redesSociais?.instagram || "",
      facebook: loja.redesSociais?.facebook || "",
      twitter: loja.redesSociais?.twitter || "",
      linkedin: loja.redesSociais?.linkedin || "",
      youtube: loja.redesSociais?.youtube || "",
    },
    tags: loja.tags || [],
    ativo: loja.ativo !== undefined ? loja.ativo : true,
  })
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ativo: checked }))
  }

  // Atualize o método handleSubmit para lidar com a criação de uma nova loja
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const method = isCriacao ? "POST" : "PUT"
      const response = await fetch("/api/loja", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(isCriacao ? "Falha ao criar loja" : "Falha ao salvar dados da loja")
      }

      toast({
        title: "Sucesso",
        description: isCriacao ? "Loja criada com sucesso!" : "Dados da loja atualizados com sucesso!",
      })

      // Redirecionar para a página de perfil após salvar
      router.push("/dashboard/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados da loja. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isCriacao ? "Criar Nova Loja" : "Editar Perfil da Loja"}</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/perfil-da-loja")}>
          Cancelar
        </Button>
      </div>

      <Tabs defaultValue="informacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="informacoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Estas informações serão exibidas publicamente em seus panfletos e produtos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Loja</Label>
                    <Input
                      id="nome"
                      name="nome"
                      placeholder="Nome da sua loja"
                      value={formData.nome}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFundacao">Data de Fundação</Label>
                    <Input
                      id="dataFundacao"
                      name="dataFundacao"
                      placeholder="DD/MM/AAAA"
                      value={formData.dataFundacao}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    placeholder="Descreva sua loja em poucas palavras"
                    value={formData.descricao}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    placeholder="Endereço completo"
                    value={formData.endereco}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroFuncionarios">Número de Funcionários</Label>
                  <Input
                    id="numeroFuncionarios"
                    name="numeroFuncionarios"
                    type="number"
                    placeholder="10"
                    value={formData.numeroFuncionarios}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contato" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
                <CardDescription>Como seus clientes podem entrar em contato com você.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contato@sualoja.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      placeholder="https://www.sualoja.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horarioFuncionamento">Horário de Funcionamento</Label>
                    <Input
                      id="horarioFuncionamento"
                      name="horarioFuncionamento"
                      placeholder="Seg-Sex: 9h às 18h, Sáb: 9h às 13h"
                      value={formData.horarioFuncionamento}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Conecte suas redes sociais para aumentar sua visibilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redesSociais.instagram">Instagram</Label>
                  <Input
                    id="redesSociais.instagram"
                    name="redesSociais.instagram"
                    placeholder="https://instagram.com/sualoja"
                    value={formData.redesSociais.instagram}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redesSociais.facebook">Facebook</Label>
                  <Input
                    id="redesSociais.facebook"
                    name="redesSociais.facebook"
                    placeholder="https://facebook.com/sualoja"
                    value={formData.redesSociais.facebook}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redesSociais.twitter">Twitter</Label>
                  <Input
                    id="redesSociais.twitter"
                    name="redesSociais.twitter"
                    placeholder="https://twitter.com/sualoja"
                    value={formData.redesSociais.twitter}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redesSociais.linkedin">LinkedIn</Label>
                  <Input
                    id="redesSociais.linkedin"
                    name="redesSociais.linkedin"
                    placeholder="https://linkedin.com/company/sualoja"
                    value={formData.redesSociais.linkedin}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="redesSociais.youtube">YouTube</Label>
                  <Input
                    id="redesSociais.youtube"
                    name="redesSociais.youtube"
                    placeholder="https://youtube.com/c/sualoja"
                    value={formData.redesSociais.youtube}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Loja</CardTitle>
                <CardDescription>Gerencie as configurações da sua loja.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Status da Loja</Label>
                      <p className="text-sm text-muted-foreground">
                        Quando desativada, sua loja não será visível para os clientes.
                      </p>
                    </div>
                    <Switch checked={formData.ativo} onCheckedChange={handleSwitchChange} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCriacao ? "Criar Loja" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}

