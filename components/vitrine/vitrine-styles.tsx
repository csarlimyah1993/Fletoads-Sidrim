"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Palette, Layout, Grid3X3, Layers } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VitrineStylesProps {
  lojaId: string
}

export function VitrineStyles({ lojaId }: VitrineStylesProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [styles, setStyles] = useState({
    layout: "moderno",
    cores: {
      primaria: "#4f46e5",
      secundaria: "#f9fafb",
      texto: "#111827",
    },
    widgets: ["produtos", "contato", "mapa"],
    mostrarPrecos: true,
    mostrarEstoque: true,
    produtosPorPagina: 12,
  })

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/loja/${lojaId}/estilos`)

        if (response.ok) {
          const data = await response.json()
          setStyles(data)
        }
      } catch (error) {
        console.error("Erro ao buscar estilos da vitrine:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (lojaId) {
      fetchStyles()
    }
  }, [lojaId])

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/loja/${lojaId}/estilos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(styles),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Estilos da vitrine atualizados com sucesso!",
        })
      } else {
        throw new Error("Falha ao salvar estilos")
      }
    } catch (error) {
      console.error("Erro ao salvar estilos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os estilos da vitrine.",
        variant: "destructive",
      })
    }
  }

  const handleColorChange = (field: string, value: string) => {
    setStyles((prev) => ({
      ...prev,
      cores: {
        ...prev.cores,
        [field]: value,
      },
    }))
  }

  const handleWidgetToggle = (widget: string) => {
    setStyles((prev) => {
      const widgets = [...prev.widgets]

      if (widgets.includes(widget)) {
        return {
          ...prev,
          widgets: widgets.filter((w) => w !== widget),
        }
      } else {
        return {
          ...prev,
          widgets: [...widgets, widget],
        }
      }
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estilos da Vitrine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estilos da Vitrine</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <span className="hidden sm:inline">Layout</span>
            </TabsTrigger>
            <TabsTrigger value="cores" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Cores</span>
            </TabsTrigger>
            <TabsTrigger value="widgets" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Widgets</span>
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Estilo de Layout</Label>
                <Select
                  value={styles.layout}
                  onValueChange={(value) => setStyles((prev) => ({ ...prev, layout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="classico">Clássico</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="elegante">Elegante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="cores">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="corPrimaria"
                    value={styles.cores.primaria}
                    onChange={(e) => handleColorChange("primaria", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={styles.cores.primaria}
                    onChange={(e) => handleColorChange("primaria", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="corSecundaria"
                    value={styles.cores.secundaria}
                    onChange={(e) => handleColorChange("secundaria", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={styles.cores.secundaria}
                    onChange={(e) => handleColorChange("secundaria", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corTexto">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="corTexto"
                    value={styles.cores.texto}
                    onChange={(e) => handleColorChange("texto", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input value={styles.cores.texto} onChange={(e) => handleColorChange("texto", e.target.value)} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="widgets">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="widgetProdutos" className="flex-1">
                  Produtos
                </Label>
                <Switch
                  id="widgetProdutos"
                  checked={styles.widgets.includes("produtos")}
                  onCheckedChange={() => handleWidgetToggle("produtos")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="widgetContato" className="flex-1">
                  Contato
                </Label>
                <Switch
                  id="widgetContato"
                  checked={styles.widgets.includes("contato")}
                  onCheckedChange={() => handleWidgetToggle("contato")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="widgetMapa" className="flex-1">
                  Mapa
                </Label>
                <Switch
                  id="widgetMapa"
                  checked={styles.widgets.includes("mapa")}
                  onCheckedChange={() => handleWidgetToggle("mapa")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="widgetRedesSociais" className="flex-1">
                  Redes Sociais
                </Label>
                <Switch
                  id="widgetRedesSociais"
                  checked={styles.widgets.includes("redesSociais")}
                  onCheckedChange={() => handleWidgetToggle("redesSociais")}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="widgetTestemunhos" className="flex-1">
                  Testemunhos
                </Label>
                <Switch
                  id="widgetTestemunhos"
                  checked={styles.widgets.includes("testemunhos")}
                  onCheckedChange={() => handleWidgetToggle("testemunhos")}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="produtos">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarPrecos" className="flex-1">
                  Mostrar Preços
                </Label>
                <Switch
                  id="mostrarPrecos"
                  checked={styles.mostrarPrecos}
                  onCheckedChange={(checked) => setStyles((prev) => ({ ...prev, mostrarPrecos: checked }))}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarEstoque" className="flex-1">
                  Mostrar Estoque
                </Label>
                <Switch
                  id="mostrarEstoque"
                  checked={styles.mostrarEstoque}
                  onCheckedChange={(checked) => setStyles((prev) => ({ ...prev, mostrarEstoque: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="produtosPorPagina">Produtos por Página</Label>
                <Select
                  value={String(styles.produtosPorPagina)}
                  onValueChange={(value) => setStyles((prev) => ({ ...prev, produtosPorPagina: Number(value) }))}
                >
                  <SelectTrigger id="produtosPorPagina">
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 produtos</SelectItem>
                    <SelectItem value="12">12 produtos</SelectItem>
                    <SelectItem value="16">16 produtos</SelectItem>
                    <SelectItem value="24">24 produtos</SelectItem>
                    <SelectItem value="32">32 produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSave} className="w-full">
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

