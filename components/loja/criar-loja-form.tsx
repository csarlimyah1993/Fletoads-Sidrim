"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Store, MapPin, Phone, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { CriarLojaFormProps } from "@/types/loja"

export function CriarLojaForm({ userId }: CriarLojaFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeStep, setActiveStep] = useState(1)
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    descricao: "Minha loja online com os melhores produtos e serviços.",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    whatsapp: "",
    categoria: "Geral",
  })
  const router = useRouter()

  // Funções de formatação para máscaras
  const formatCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "")

    // Limita a 14 dígitos
    const cnpj = numbers.slice(0, 14)

    // Aplica a máscara: 00.000.000/0000-00
    if (cnpj.length <= 2) {
      return cnpj
    } else if (cnpj.length <= 5) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`
    } else if (cnpj.length <= 8) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`
    } else if (cnpj.length <= 12) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`
    } else {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
    }
  }

  const formatCEP = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "")

    // Limita a 8 dígitos
    const cep = numbers.slice(0, 8)

    // Aplica a máscara: 00000-000
    if (cep.length <= 5) {
      return cep
    } else {
      return `${cep.slice(0, 5)}-${cep.slice(5)}`
    }
  }

  const formatTelefone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "")

    // Limita a 11 dígitos (com DDD)
    const tel = numbers.slice(0, 11)

    // Aplica a máscara: (00) 0000-0000 ou (00) 00000-0000
    if (tel.length <= 2) {
      return tel
    } else if (tel.length <= 6) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2)}`
    } else if (tel.length <= 10) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`
    } else {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Aplica as máscaras conforme o campo
    let formattedValue = value

    if (name === "cnpj") {
      formattedValue = formatCNPJ(value)
    } else if (name === "cep") {
      formattedValue = formatCEP(value)
    } else if (name === "telefone" || name === "whatsapp") {
      formattedValue = formatTelefone(value)
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    setActiveStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setActiveStep((prev) => prev - 1)
  }

  // Função para remover formatação antes de enviar ao backend
  const removeFormatting = (value: string) => {
    return value.replace(/\D/g, "")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const lojaData = {
      nome: formData.nome,
      cnpj: removeFormatting(formData.cnpj), // Remove formatação
      descricao: formData.descricao,
      proprietarioId: userId,
      usuarioId: userId,
      endereco: {
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: removeFormatting(formData.cep), // Remove formatação
      },
      contato: {
        telefone: removeFormatting(formData.telefone), // Remove formatação
        email: formData.email,
        whatsapp: removeFormatting(formData.whatsapp), // Remove formatação
      },
      categorias: [formData.categoria],
      status: "ativo",
      ativo: true,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
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

  const categorias = [
    "Geral",
    "Alimentação",
    "Moda",
    "Eletrônicos",
    "Saúde e Beleza",
    "Casa e Decoração",
    "Serviços",
    "Outros",
  ]

  const estados = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Criar Nova Loja</CardTitle>
        <CardDescription>
          Preencha os dados principais da sua loja. Você poderá completar as informações adicionais depois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form id="lojaForm" onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={`step-${activeStep}`} className="w-full">
            {/* Etapa 1: Informações Básicas */}
            <TabsContent value="step-1" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <Store className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold">Informações Básicas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Loja *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Calçado modas"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números, a formatação é automática</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Loja</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Ex: Loja de roupas"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria Principal</Label>
                <Select
                  name="categoria"
                  value={formData.categoria}
                  onValueChange={(value) => handleSelectChange("categoria", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Etapa 2: Endereço */}
            <TabsContent value="step-2" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold">Endereço</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    placeholder="00000-000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números, a formatação é automática</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua/Logradouro *</Label>
                  <Input
                    id="rua"
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                    placeholder="Ex: Rua Arapuá"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Ex: 367"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    name="complemento"
                    value={formData.complemento}
                    onChange={handleChange}
                    placeholder="Sala, Apto, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    placeholder="Ex: Cidade Nova"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    placeholder="Ex: Manaus"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    name="estado"
                    value={formData.estado}
                    onValueChange={(value) => handleSelectChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Etapa 3: Contato */}
            <TabsContent value="step-3" className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </div>
                <h3 className="text-xl font-semibold">Informações de Contato</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números, a formatação é automática</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                  />
                  <p className="text-xs text-muted-foreground">Digite apenas os números, a formatação é automática</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email de Contato *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ex: contato@calcadomodas.com.br"
                  required
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Revisão</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verifique se todas as informações estão corretas antes de criar sua loja. Você poderá adicionar mais
                  detalhes como horário de funcionamento, redes sociais e imagens após a criação.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${activeStep >= 1 ? "bg-primary" : "bg-gray-300"}`}></span>
          <span className={`w-3 h-3 rounded-full ${activeStep >= 2 ? "bg-primary" : "bg-gray-300"}`}></span>
          <span className={`w-3 h-3 rounded-full ${activeStep >= 3 ? "bg-primary" : "bg-gray-300"}`}></span>
        </div>
        <div className="flex gap-2">
          {activeStep > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={loading}>
              Voltar
            </Button>
          )}
          {activeStep < 3 ? (
            <Button onClick={nextStep}>Próximo</Button>
          ) : (
            <Button type="submit" form="lojaForm" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Criando..." : "Criar Loja"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
