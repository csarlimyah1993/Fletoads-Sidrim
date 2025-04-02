"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VitrineCustomizationProps {
  lojaId: string
}

export function VitrineCustomization({ lojaId }: VitrineCustomizationProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    cores: {
      primaria: "#4f46e5",
      secundaria: "#818cf8",
      texto: "#1f2937",
      fundo: "#ffffff",
      destaque: "#ef4444",
    },
    fontes: {
      titulo: "Inter",
      corpo: "Inter",
      tamanhoTitulo: "xl",
      tamanhoCorpo: "base",
    },
    layout: {
      mostrarLogo: true,
      mostrarBanner: true,
      mostrarRedes: true,
      mostrarHorarios: true,
      mostrarEndereco: true,
      mostrarContato: true,
    },
    seo: {
      titulo: "",
      descricao: "",
      palavrasChave: "",
    },
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/loja/${lojaId}/vitrine/configuracoes`)

        if (response.ok) {
          const data = await response.json()
          if (data.configuracoes) {
            setSettings(data.configuracoes)
          }
        } else {
          console.error("Erro ao buscar configurações:", await response.text())
        }
      } catch (error) {
        console.error("Erro ao buscar configurações:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações da vitrine",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (lojaId) {
      fetchSettings()
    }
  }, [lojaId, toast])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/loja/${lojaId}/vitrine/configuracoes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ configuracoes: settings }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Configurações da vitrine salvas com sucesso",
        })
      } else {
        console.error("Erro ao salvar configurações:", await response.text())
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações da vitrine",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações da vitrine",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalização da Vitrine</CardTitle>
          <CardDescription>Carregando configurações...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização da Vitrine</CardTitle>
        <CardDescription>Personalize a aparência e o comportamento da sua vitrine online</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cores">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="fontes">Fontes</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="cores" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="corPrimaria"
                    type="color"
                    value={settings.cores.primaria}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          primaria: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.cores.primaria}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          primaria: e.target.value,
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="corSecundaria"
                    type="color"
                    value={settings.cores.secundaria}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          secundaria: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.cores.secundaria}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          secundaria: e.target.value,
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corTexto">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="corTexto"
                    type="color"
                    value={settings.cores.texto}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          texto: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.cores.texto}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          texto: e.target.value,
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corFundo">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="corFundo"
                    type="color"
                    value={settings.cores.fundo}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          fundo: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.cores.fundo}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          fundo: e.target.value,
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corDestaque">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="corDestaque"
                    type="color"
                    value={settings.cores.destaque}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          destaque: e.target.value,
                        },
                      })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.cores.destaque}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cores: {
                          ...settings.cores,
                          destaque: e.target.value,
                        },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-4 rounded-md"
              style={{
                backgroundColor: settings.cores.fundo,
                color: settings.cores.texto,
                border: "1px solid #e5e7eb",
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: settings.cores.primaria }}>
                Prévia das Cores
              </h3>
              <p className="mb-2">Este é um exemplo de como as cores serão exibidas na sua vitrine.</p>
              <Button
                style={{
                  backgroundColor: settings.cores.primaria,
                  color: "#fff",
                }}
                className="mr-2"
              >
                Botão Primário
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: settings.cores.secundaria,
                  color: settings.cores.secundaria,
                }}
              >
                Botão Secundário
              </Button>
              <div
                className="mt-2 p-2 rounded-md"
                style={{ backgroundColor: settings.cores.secundaria, color: "#fff" }}
              >
                Elemento com cor secundária
              </div>
              <div className="mt-2 font-semibold" style={{ color: settings.cores.destaque }}>
                Texto em destaque
              </div>
            </div>
          </TabsContent>

          <TabsContent value="fontes" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fonteTitulo">Fonte dos Títulos</Label>
                <Select
                  value={settings.fontes.titulo}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      fontes: {
                        ...settings.fontes,
                        titulo: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="fonteTitulo">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fonteCorpo">Fonte do Corpo</Label>
                <Select
                  value={settings.fontes.corpo}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      fontes: {
                        ...settings.fontes,
                        corpo: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="fonteCorpo">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamanhoTitulo">Tamanho dos Títulos</Label>
                <Select
                  value={settings.fontes.tamanhoTitulo}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      fontes: {
                        ...settings.fontes,
                        tamanhoTitulo: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="tamanhoTitulo">
                    <SelectValue placeholder="Selecione um tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lg">Pequeno</SelectItem>
                    <SelectItem value="xl">Médio</SelectItem>
                    <SelectItem value="2xl">Grande</SelectItem>
                    <SelectItem value="3xl">Muito Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamanhoCorpo">Tamanho do Corpo</Label>
                <Select
                  value={settings.fontes.tamanhoCorpo}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      fontes: {
                        ...settings.fontes,
                        tamanhoCorpo: value,
                      },
                    })
                  }
                >
                  <SelectTrigger id="tamanhoCorpo">
                    <SelectValue placeholder="Selecione um tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Pequeno</SelectItem>
                    <SelectItem value="base">Médio</SelectItem>
                    <SelectItem value="lg">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-md border">
              <h3
                className={`text-${settings.fontes.tamanhoTitulo} font-semibold mb-2`}
                style={{ fontFamily: settings.fontes.titulo }}
              >
                Prévia do Título ({settings.fontes.titulo})
              </h3>
              <p className={`text-${settings.fontes.tamanhoCorpo}`} style={{ fontFamily: settings.fontes.corpo }}>
                Este é um exemplo de texto no corpo ({settings.fontes.corpo}) que será exibido na sua vitrine. O tamanho
                e a fonte podem afetar significativamente a legibilidade e a aparência geral da sua loja online.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarLogo" className="flex-1">
                  Mostrar Logo
                </Label>
                <Switch
                  id="mostrarLogo"
                  checked={settings.layout.mostrarLogo}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarLogo: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarBanner" className="flex-1">
                  Mostrar Banner
                </Label>
                <Switch
                  id="mostrarBanner"
                  checked={settings.layout.mostrarBanner}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarBanner: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarRedes" className="flex-1">
                  Mostrar Redes Sociais
                </Label>
                <Switch
                  id="mostrarRedes"
                  checked={settings.layout.mostrarRedes}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarRedes: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarHorarios" className="flex-1">
                  Mostrar Horários de Funcionamento
                </Label>
                <Switch
                  id="mostrarHorarios"
                  checked={settings.layout.mostrarHorarios}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarHorarios: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarEndereco" className="flex-1">
                  Mostrar Endereço
                </Label>
                <Switch
                  id="mostrarEndereco"
                  checked={settings.layout.mostrarEndereco}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarEndereco: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="mostrarContato" className="flex-1">
                  Mostrar Informações de Contato
                </Label>
                <Switch
                  id="mostrarContato"
                  checked={settings.layout.mostrarContato}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      layout: {
                        ...settings.layout,
                        mostrarContato: checked,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="p-4 rounded-md border">
              <h3 className="text-lg font-semibold mb-2">Prévia do Layout</h3>
              <div className="space-y-2">
                {settings.layout.mostrarLogo && <div className="p-2 bg-gray-100 rounded">Logo</div>}
                {settings.layout.mostrarBanner && (
                  <div className="p-2 bg-gray-100 rounded h-20 flex items-center justify-center">Banner</div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="p-2 bg-gray-100 rounded">Produtos</div>
                  </div>
                  <div className="space-y-2">
                    {settings.layout.mostrarHorarios && (
                      <div className="p-2 bg-gray-100 rounded">Horários de Funcionamento</div>
                    )}
                    {settings.layout.mostrarEndereco && <div className="p-2 bg-gray-100 rounded">Endereço</div>}
                    {settings.layout.mostrarContato && (
                      <div className="p-2 bg-gray-100 rounded">Informações de Contato</div>
                    )}
                  </div>
                </div>
                {settings.layout.mostrarRedes && <div className="p-2 bg-gray-100 rounded">Redes Sociais</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitulo">Título da Página (SEO)</Label>
                <Input
                  id="seoTitulo"
                  value={settings.seo.titulo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: {
                        ...settings.seo,
                        titulo: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: Loja XYZ - Os melhores produtos para você"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: até 60 caracteres. Atual: {settings.seo.titulo.length}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescricao">Descrição da Página (SEO)</Label>
                <Textarea
                  id="seoDescricao"
                  value={settings.seo.descricao}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: {
                        ...settings.seo,
                        descricao: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: A Loja XYZ oferece os melhores produtos com preços imbatíveis. Confira nosso catálogo e faça seu pedido!"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: até 160 caracteres. Atual: {settings.seo.descricao.length}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoPalavrasChave">Palavras-chave (SEO)</Label>
                <Input
                  id="seoPalavrasChave"
                  value={settings.seo.palavrasChave}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      seo: {
                        ...settings.seo,
                        palavrasChave: e.target.value,
                      },
                    })
                  }
                  placeholder="Ex: loja, produtos, ofertas (separadas por vírgula)"
                />
                <p className="text-xs text-muted-foreground">
                  Separe as palavras-chave por vírgulas. Recomendado: 5-10 palavras-chave relevantes.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-md border space-y-2">
              <h3 className="text-lg font-semibold">Prévia nos Resultados de Busca</h3>
              <div className="space-y-1">
                <div className="text-blue-600 text-lg font-medium truncate">
                  {settings.seo.titulo || "Título da sua loja"}
                </div>
                <div className="text-green-700 text-sm">
                  {`${process.env.NEXT_PUBLIC_APP_URL || "https://fletoads.vercel.app"}/vitrines/${lojaId}`}
                </div>
                <div className="text-sm text-gray-600 line-clamp-2">
                  {settings.seo.descricao ||
                    "Descrição da sua loja que aparecerá nos resultados de busca. Adicione uma descrição atraente para aumentar o número de cliques."}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

