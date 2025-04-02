"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  nome: string
  descricao: string
  logo: string
  banner: string
  endereco: string
  telefone: string
  email: string
  website: string
  horarioFuncionamento: string
  dataFundacao: string
  numeroFuncionarios: number
  categorias: string[]
  redesSociais: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  widgets: string[]
}

export default function CriarLojaPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    descricao: "",
    logo: "",
    banner: "",
    endereco: "",
    telefone: "",
    email: "",
    website: "",
    horarioFuncionamento: "",
    dataFundacao: "",
    numeroFuncionarios: 1,
    categorias: [],
    redesSociais: {},
    widgets: [],
  })
  const [novaCategoria, setNovaCategoria] = useState("")

  // Manipuladores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault()
    if (novaCategoria.trim()) {
      const categoriaFormatada = novaCategoria.trim()
      if (!formData.categorias.includes(categoriaFormatada)) {
        setFormData((prev) => ({
          ...prev,
          categorias: [...prev.categorias, categoriaFormatada],
        }))
      }
      setNovaCategoria("")
    }
  }

  const handleRemoveCategoria = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((t) => t !== tag),
    }))
  }

  const handleImageUpload = (field: string, url: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: url,
    }))
  }

  const handleRedesSociaisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      redesSociais: {
        ...prev.redesSociais,
        [name]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error("Você precisa estar logado para criar uma loja")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar loja")
      }

      toast.success("Loja criada com sucesso!")
      router.push("/dashboard/perfil-da-loja")
    } catch (error) {
      console.error("Erro ao criar loja:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar loja")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Criar Perfil da Loja</h1>
        <p className="text-muted-foreground">
          Preencha as informações abaixo para criar o perfil da sua loja e começar a vender.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
            <TabsTrigger value="contato">Contato e Localização</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Preencha as informações básicas da sua loja.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Loja *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome da sua loja"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descreva sua loja em poucas palavras"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categorias</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.categorias.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveCategoria(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                      placeholder="Adicionar categoria"
                    />
                    <Button type="button" size="sm" onClick={handleAddCategoria}>
                      <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="button" onClick={() => setActiveTab("contato")}>
                  Próximo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contato">
            <Card>
              <CardHeader>
                <CardTitle>Contato e Localização</CardTitle>
                <CardDescription>Informe os dados de contato e localização da sua loja.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    placeholder="Endereço completo da loja"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contato@sualoja.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.sualoja.com"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setActiveTab("informacoes")}>
                  Voltar
                </Button>
                <Button type="button" onClick={() => setActiveTab("aparencia")}>
                  Próximo
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a aparência da sua loja.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Logo da Loja</Label>
                  <ImageUpload value={formData.logo} onChange={(url) => handleImageUpload("logo", url)} />
                </div>

                <div className="space-y-2">
                  <Label>Banner da Loja</Label>
                  <ImageUpload value={formData.banner} onChange={(url) => handleImageUpload("banner", url)} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setActiveTab("contato")}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
                    </>
                  ) : (
                    "Criar Loja"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}

