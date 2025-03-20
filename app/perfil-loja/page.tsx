"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MapPin, Clock, Phone, Globe, Camera, Upload, Eye } from "lucide-react"
import { usePlanFeatures } from "@/hooks/use-plan-features"

export default function PerfilDaLojaPage() {
  const { hasFeature } = usePlanFeatures()
  const [activeTab, setActiveTab] = useState("informacoes")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Perfil da Loja</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" /> Visualizar Loja
          </Button>
          <Button>Salvar Alterações</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vitrine Digital</CardTitle>
          <CardDescription>Configure as informações da sua loja que serão exibidas para os clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="informacoes" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
              <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              <TabsTrigger value="produtos">Produtos Destacados</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="informacoes" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome-loja">Nome da Loja</Label>
                    <Input id="nome-loja" placeholder="Digite o nome da sua loja" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input id="categoria" placeholder="Ex: Supermercado, Farmácia, etc." />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" placeholder="Descreva sua loja em poucas palavras" rows={4} />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input id="telefone" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input id="website" placeholder="www.seusite.com.br" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input id="endereco" placeholder="Rua, número, bairro" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" placeholder="Sua cidade" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" placeholder="Seu estado" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="00000-000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">Horário de Funcionamento</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input id="horario" placeholder="Ex: Segunda a Sexta, 9h às 18h" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aparencia" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Logo da Loja</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-md border border-dashed flex items-center justify-center">
                      <div className="flex flex-col items-center gap-1">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Logo</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" /> Enviar Logo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  <div className="aspect-video w-full rounded-md border border-dashed flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Imagem de Capa</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="mr-2 h-4 w-4" /> Enviar Imagem de Capa
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Cores da Loja</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cor-primaria" className="text-xs">
                        Cor Primária
                      </Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md bg-violet-500"></div>
                        <Input id="cor-primaria" defaultValue="#8B5CF6" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor-secundaria" className="text-xs">
                        Cor Secundária
                      </Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                        <Input id="cor-secundaria" defaultValue="#E5E7EB" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="produtos" className="mt-6 space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione os produtos que deseja destacar na sua vitrine digital.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Produto 1</CardTitle>
                        <Switch id="produto-1" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                      <p className="mt-2 text-xs text-muted-foreground">Descrição curta do produto</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Produto 2</CardTitle>
                        <Switch id="produto-2" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                      <p className="mt-2 text-xs text-muted-foreground">Descrição curta do produto</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Produto 3</CardTitle>
                        <Switch id="produto-3" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                      <p className="mt-2 text-xs text-muted-foreground">Descrição curta do produto</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuracoes" className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Vitrine Ativa</h3>
                    <p className="text-sm text-muted-foreground">Ativar ou desativar a exibição da sua loja</p>
                  </div>
                  <Switch id="vitrine-ativa" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Exibir Preços</h3>
                    <p className="text-sm text-muted-foreground">Mostrar os preços dos produtos na vitrine</p>
                  </div>
                  <Switch id="exibir-precos" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Permitir Pedidos Online</h3>
                    <p className="text-sm text-muted-foreground">Habilitar a funcionalidade de pedidos pela vitrine</p>
                  </div>
                  <Switch id="pedidos-online" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificações de Visitas</h3>
                    <p className="text-sm text-muted-foreground">Receber notificações quando alguém visitar sua loja</p>
                  </div>
                  <Switch id="notificacoes-visitas" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Salvar Alterações</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

