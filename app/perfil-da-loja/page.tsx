"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, Phone, Mail, Globe, Clock, Instagram, Facebook } from "lucide-react"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"

export default function PerfilDaLojaPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loja, setLoja] = useState<any>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    endereco: "",
    telefone: "",
    email: "",
    website: "",
    horarioFuncionamento: "",
    instagram: "",
    facebook: "",
    ativo: true,
    logo: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const fetchLoja = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/loja", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error("Falha ao carregar dados da loja")
        }

        const data = await response.json()
        setLoja(data)
        setFormData({
          nome: data.nome || "",
          descricao: data.descricao || "",
          endereco: data.endereco || "",
          telefone: data.telefone || "",
          email: data.email || "",
          website: data.website || "",
          horarioFuncionamento: data.horarioFuncionamento || "",
          instagram: data.instagram || "",
          facebook: data.facebook || "",
          ativo: data.ativo !== undefined ? data.ativo : true,
          logo: data.logo || "",
        })
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da loja. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchLoja()
    }
  }, [session, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ativo: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const response = await fetch("/api/loja", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar dados da loja")
      }

      const updatedLoja = await response.json()
      setLoja(updatedLoja)

      toast({
        title: "Sucesso",
        description: "Dados da loja atualizados com sucesso!",
      })
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

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados da loja...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Perfil da Loja</h2>
      </div>

      <Tabs defaultValue="informacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Estas informações serão exibidas publicamente em seus panfletos e produtos.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
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
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      placeholder="@sualoja"
                      value={formData.instagram}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      placeholder="facebook.com/sualoja"
                      value={formData.facebook}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="ativo" checked={formData.ativo} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="ativo">Loja ativa</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Alterações
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualização</CardTitle>
              <CardDescription>Veja como suas informações serão exibidas para os clientes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                    {formData.logo ? (
                      <Image
                        src={formData.logo || "/placeholder.svg"}
                        alt={formData.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        {formData.nome.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{formData.nome || "Nome da Loja"}</h3>
                    <p className="text-sm text-muted-foreground">{formData.descricao || "Descrição da loja"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {formData.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.endereco}</span>
                    </div>
                  )}

                  {formData.telefone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.telefone}</span>
                    </div>
                  )}

                  {formData.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.email}</span>
                    </div>
                  )}

                  {formData.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.website}</span>
                    </div>
                  )}

                  {formData.horarioFuncionamento && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.horarioFuncionamento}</span>
                    </div>
                  )}

                  {formData.instagram && (
                    <div className="flex items-start gap-2">
                      <Instagram className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.instagram}</span>
                    </div>
                  )}

                  {formData.facebook && (
                    <div className="flex items-start gap-2">
                      <Facebook className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-sm">{formData.facebook}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo e Identidade Visual</CardTitle>
              <CardDescription>Personalize a aparência da sua loja.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo da Loja</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border">
                      {formData.logo ? (
                        <Image
                          src={formData.logo || "/placeholder.svg"}
                          alt="Logo da loja"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                          {formData.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <Button variant="outline">Alterar Logo</Button>
                  </div>
                </div>
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
      </Tabs>
    </div>
  )
}

