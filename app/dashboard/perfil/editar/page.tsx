"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UsuarioPerfil {
  _id: string
  nome: string
  email: string
  telefone?: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  configuracoes?: {
    notificacoes?: boolean
    tema?: string
  }
}

export default function EditarPerfilPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    endereco: {
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
    },
    configuracoes: {
      notificacoes: true,
      tema: "light",
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchPerfil()
    }
  }, [status, router])

  const fetchPerfil = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/usuario/perfil")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao buscar perfil")
      }

      const data = await response.json()
      setPerfil(data)

      // Preencher o formulário com os dados do perfil
      setFormData({
        nome: data.nome || "",
        telefone: data.telefone || "",
        endereco: {
          rua: data.endereco?.rua || "",
          numero: data.endereco?.numero || "",
          complemento: data.endereco?.complemento || "",
          bairro: data.endereco?.bairro || "",
          cidade: data.endereco?.cidade || "",
          estado: data.endereco?.estado || "",
          cep: data.endereco?.cep || "",
        },
        configuracoes: {
          notificacoes: data.configuracoes?.notificacoes ?? true,
          tema: data.configuracoes?.tema || "light",
        },
      })
    } catch (error) {
      console.error("Erro ao buscar perfil:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar perfil",
        variant: "destructive",
      })

      // Usar dados mock para desenvolvimento
      const mockData = {
        _id: "123456",
        nome: "Usuário Teste",
        email: "usuario@teste.com",
        telefone: "(11) 99999-9999",
        endereco: {
          rua: "Rua Teste",
          numero: "123",
          complemento: "Apto 456",
          bairro: "Bairro Teste",
          cidade: "Cidade Teste",
          estado: "SP",
          cep: "12345-678",
        },
        configuracoes: {
          notificacoes: true,
          tema: "light",
        },
      }

      setPerfil(mockData)
      setFormData({
        nome: mockData.nome,
        telefone: mockData.telefone || "",
        endereco: {
          rua: mockData.endereco?.rua || "",
          numero: mockData.endereco?.numero || "",
          complemento: mockData.endereco?.complemento || "",
          bairro: mockData.endereco?.bairro || "",
          cidade: mockData.endereco?.cidade || "",
          estado: mockData.endereco?.estado || "",
          cep: mockData.endereco?.cep || "",
        },
        configuracoes: {
          notificacoes: mockData.configuracoes?.notificacoes ?? true,
          tema: mockData.configuracoes?.tema || "light",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData((prev) => {
        // Garantir que estamos lidando com um objeto antes de usar spread
        if (section === "endereco") {
          return {
            ...prev,
            endereco: {
              ...prev.endereco,
              [field]: value,
            },
          }
        } else if (section === "configuracoes") {
          return {
            ...prev,
            configuracoes: {
              ...prev.configuracoes,
              [field]: value,
            },
          }
        }
        // Fallback para o caso de uma seção desconhecida
        return prev
      })
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      const response = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar perfil")
      }

      const data = await response.json()
      setPerfil(data)

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      })

      router.push("/perfil-da-loja")
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando perfil...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

      <Tabs defaultValue="pessoal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pessoal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="pessoal">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Atualize suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" name="nome" value={formData.nome} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={perfil?.email || ""} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground">O email não pode ser alterado</p>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endereco">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Atualize seu endereço</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco.rua">Rua</Label>
                    <Input
                      id="endereco.rua"
                      name="endereco.rua"
                      value={formData.endereco.rua}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco.numero">Número</Label>
                    <Input
                      id="endereco.numero"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco.complemento">Complemento</Label>
                  <Input
                    id="endereco.complemento"
                    name="endereco.complemento"
                    value={formData.endereco.complemento}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco.bairro">Bairro</Label>
                    <Input
                      id="endereco.bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco.cidade">Cidade</Label>
                    <Input
                      id="endereco.cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco.estado">Estado</Label>
                    <Input
                      id="endereco.estado"
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco.cep">CEP</Label>
                    <Input
                      id="endereco.cep"
                      name="endereco.cep"
                      value={formData.endereco.cep}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>Gerencie suas preferências</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="configuracoes.notificacoes"
                    name="configuracoes.notificacoes"
                    checked={formData.configuracoes.notificacoes}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        configuracoes: {
                          ...prev.configuracoes,
                          notificacoes: e.target.checked,
                        },
                      }))
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="configuracoes.notificacoes">Receber notificações por email</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="mt-6 flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push("/perfil-da-loja")} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}

