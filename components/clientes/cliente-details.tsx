"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, Tag, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Cliente {
  _id: string
  nome: string
  email?: string | null
  telefone?: string | null
  documento?: string | null
  status?: string
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
  preferencias?: {
    cores?: string
    estilos?: string
    tamanhos?: string
    marcas?: string
  }
  marketing?: {
    canalAquisicao?: string
    campanhaOrigem?: string
    etapaFunil?: string
    pontuacao?: number
    permiteEmail?: boolean
    permiteSMS?: boolean
    permiteWhatsapp?: boolean
    permiteInstagram?: boolean
  }
  demograficos?: {
    dataNascimento?: string | Date
    genero?: string
    estadoCivil?: string
    profissao?: string
    faixaRenda?: string
  }
  relacionamento?: {
    ultimoContato?: string | Date
    proximoContato?: string | Date
    frequenciaIdeal?: string
    responsavel?: string
    notas?: string
  }
  camposPersonalizados?: Record<string, string>
  dataCriacao?: string | Date
  dataAtualizacao?: string | Date
}

interface ClienteDetailsProps {
  cliente: Cliente
}

export function ClienteDetails({ cliente }: ClienteDetailsProps) {
  const [activeTab, setActiveTab] = useState("informacoes")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/clientes/${cliente._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir cliente")
      }

      router.push("/dashboard/clientes")
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
      alert("Erro ao excluir cliente")
    }
  }

  const formatDate = (date?: string | Date) => {
    if (!date) return "Não informado"
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
    } catch (e) {
      return "Data inválida"
    }
  }

  // Função para formatar o endereço completo
  const formatarEndereco = () => {
    if (!cliente.endereco) return "Endereço não informado"

    const { rua, numero, complemento, bairro, cidade, estado, cep } = cliente.endereco

    const partes = []
    if (rua) partes.push(rua)
    if (numero) partes.push(numero)
    if (complemento) partes.push(complemento)
    if (bairro) partes.push(bairro)
    if (cidade) partes.push(cidade)
    if (estado) partes.push(estado)
    if (cep) partes.push(`CEP: ${cep}`)

    return partes.length > 0 ? partes.join(", ") : "Endereço incompleto"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/clientes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{cliente.nome}</h2>
          <Badge variant={cliente.status === "ativo" ? "default" : "secondary"}>{cliente.status || "Sem status"}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/dashboard/clientes/${cliente._id}/editar`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="demograficos">Dados Pessoais</TabsTrigger>
        </TabsList>

        {/* Aba de Informações Básicas */}
        <TabsContent value="informacoes">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nome:</span>
                  <span>{cliente.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{cliente.email || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{cliente.telefone || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Documento:</span>
                  <span>{cliente.documento || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Data de Cadastro:</span>
                  <span>{formatDate(cliente.dataCriacao)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <span className="font-medium">Endereço Completo:</span>
                    <p className="text-sm text-muted-foreground mt-1">{formatarEndereco()}</p>
                  </div>
                </div>

                {cliente.endereco && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                    <div>
                      <span className="font-medium text-sm">Rua:</span>
                      <p className="text-sm">{cliente.endereco.rua || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Número:</span>
                      <p className="text-sm">{cliente.endereco.numero || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Complemento:</span>
                      <p className="text-sm">{cliente.endereco.complemento || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Bairro:</span>
                      <p className="text-sm">{cliente.endereco.bairro || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Cidade:</span>
                      <p className="text-sm">{cliente.endereco.cidade || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Estado:</span>
                      <p className="text-sm">{cliente.endereco.estado || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">CEP:</span>
                      <p className="text-sm">{cliente.endereco.cep || "Não informado"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{cliente.observacoes || "Nenhuma observação registrada."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Preferências */}
        <TabsContent value="preferencias">
          <Card>
            <CardHeader>
              <CardTitle>Preferências e Gostos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Categorias Preferidas</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.categoriasPreferidasArray && cliente.categoriasPreferidasArray.length > 0 ? (
                      cliente.categoriasPreferidasArray.map((categoria, index) => (
                        <Badge key={index} variant="outline">
                          {categoria}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Nenhuma categoria informada</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Cores Preferidas</h3>
                  <p className="text-sm">{cliente.preferencias?.cores || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Estilos Preferidos</h3>
                  <p className="text-sm">{cliente.preferencias?.estilos || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Tamanhos</h3>
                  <p className="text-sm">{cliente.preferencias?.tamanhos || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Marcas Preferidas</h3>
                  <p className="text-sm">{cliente.preferencias?.marcas || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Marketing */}
        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Marketing e Funil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Canal de Aquisição</h3>
                  <p className="text-sm">{cliente.marketing?.canalAquisicao || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Campanha de Origem</h3>
                  <p className="text-sm">{cliente.marketing?.campanhaOrigem || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Etapa no Funil</h3>
                  <p className="text-sm">{cliente.marketing?.etapaFunil || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Pontuação (Lead Score)</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${cliente.marketing?.pontuacao || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{cliente.marketing?.pontuacao || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-2">Permissões de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={cliente.marketing?.permiteEmail ? "default" : "outline"}>
                      {cliente.marketing?.permiteEmail ? "Permite" : "Não permite"} Email Marketing
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cliente.marketing?.permiteSMS ? "default" : "outline"}>
                      {cliente.marketing?.permiteSMS ? "Permite" : "Não permite"} SMS
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cliente.marketing?.permiteWhatsapp ? "default" : "outline"}>
                      {cliente.marketing?.permiteWhatsapp ? "Permite" : "Não permite"} WhatsApp
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cliente.marketing?.permiteInstagram ? "default" : "outline"}>
                      {cliente.marketing?.permiteInstagram ? "Permite" : "Não permite"} Instagram
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Dados Demográficos */}
        <TabsContent value="demograficos">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais e Demográficos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Data de Nascimento</h3>
                  <p className="text-sm">
                    {cliente.demograficos?.dataNascimento
                      ? formatDate(cliente.demograficos.dataNascimento)
                      : "Não informado"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Gênero</h3>
                  <p className="text-sm">{cliente.demograficos?.genero || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Estado Civil</h3>
                  <p className="text-sm">{cliente.demograficos?.estadoCivil || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Profissão</h3>
                  <p className="text-sm">{cliente.demograficos?.profissao || "Não informado"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Faixa de Renda</h3>
                  <p className="text-sm">{cliente.demograficos?.faixaRenda || "Não informado"}</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-2">Relacionamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Último Contato</h4>
                    <p className="text-sm">
                      {cliente.relacionamento?.ultimoContato
                        ? formatDate(cliente.relacionamento.ultimoContato)
                        : "Não informado"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Próximo Contato</h4>
                    <p className="text-sm">
                      {cliente.relacionamento?.proximoContato
                        ? formatDate(cliente.relacionamento.proximoContato)
                        : "Não informado"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Frequência Ideal</h4>
                    <p className="text-sm">{cliente.relacionamento?.frequenciaIdeal || "Não informado"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Responsável</h4>
                    <p className="text-sm">{cliente.relacionamento?.responsavel || "Não informado"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
