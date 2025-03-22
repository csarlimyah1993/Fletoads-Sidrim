"use client"

import type React from "react"
import type { Loja } from "@/types/loja"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, ExternalLink } from "lucide-react"
import { getPlanoDoUsuario } from "@/lib/planos"

interface VitrinePersonalizacaoFormProps {
  loja: Loja
}

export function VitrinePersonalizacaoForm({ loja }: VitrinePersonalizacaoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Garantir que planoId seja uma string
  const planoId = typeof loja.planoId === "string" ? loja.planoId : "gratis"
  const plano = getPlanoDoUsuario(planoId)
  const isPlanoPago = plano.id !== "gratis"

  const [formData, setFormData] = useState({
    banner: loja.banner || "",
    logo: loja.logo || "",
    cores: {
      primaria: loja.cores?.primaria || "#4f46e5",
      secundaria: loja.cores?.secundaria || "#f9fafb",
      texto: loja.cores?.texto || "#111827",
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", "banner")
      formData.append("lojaId", loja._id.toString())

      const response = await fetch("/api/upload/loja-imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem")
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        banner: data.url,
      }))

      toast({
        title: "Sucesso",
        description: "Banner enviado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", "logo")
      formData.append("lojaId", loja._id.toString())

      const response = await fetch("/api/upload/loja-imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem")
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        logo: data.url,
      }))

      toast({
        title: "Sucesso",
        description: "Logo enviado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch("/api/loja/vitrine", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar personalização")
      }

      toast({
        title: "Sucesso",
        description: "Personalização da vitrine salva com sucesso!",
      })

      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar personalização:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a personalização. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const vitrineUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vitrine/${loja._id}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalização da Vitrine</CardTitle>
          <CardDescription>Personalize a aparência da sua vitrine online para atrair mais clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Sua vitrine online</h3>
              <p className="text-sm text-muted-foreground">Compartilhe sua vitrine com seus clientes</p>
            </div>
            <Button variant="outline" onClick={() => window.open(vitrineUrl, "_blank")}>
              Visualizar Vitrine
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="imagens">
              <TabsList className="mb-4">
                <TabsTrigger value="imagens">Imagens</TabsTrigger>
                <TabsTrigger value="cores">Cores</TabsTrigger>
              </TabsList>

              <TabsContent value="imagens" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Logo da Loja</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                        {formData.logo ? (
                          <Image
                            src={formData.logo || "/placeholder.svg"}
                            alt="Logo da loja"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                            {loja.nome.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Upload className="h-4 w-4" />
                            {formData.logo ? "Alterar logo" : "Enviar logo"}
                          </div>
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recomendado: 200x200px, formato quadrado</p>
                      </div>
                    </div>
                  </div>

                  {isPlanoPago && (
                    <div>
                      <Label>Banner da Vitrine</Label>
                      <div className="mt-2 border rounded-md overflow-hidden">
                        <div className="relative h-40 w-full bg-gray-100">
                          {formData.banner ? (
                            <Image
                              src={formData.banner || "/placeholder.svg"}
                              alt="Banner da loja"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                              Nenhum banner enviado
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-gray-50">
                          <Label htmlFor="banner-upload" className="cursor-pointer">
                            <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                              <Upload className="h-4 w-4" />
                              {formData.banner ? "Alterar banner" : "Enviar banner"}
                            </div>
                          </Label>
                          <Input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleBannerUpload}
                            disabled={isUploading}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Recomendado: 1200x400px, formato paisagem
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPlanoPago && (
                    <div className="rounded-md bg-amber-50 p-4 text-amber-800 text-sm">
                      <p>O banner da vitrine está disponível apenas para planos pagos.</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-amber-800 underline"
                        onClick={() => router.push("/dashboard/planos")}
                      >
                        Fazer upgrade do plano
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cores" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cores.primaria">Cor Primária</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: formData.cores.primaria }}
                      />
                      <Input
                        id="cores.primaria"
                        name="cores.primaria"
                        type="text"
                        value={formData.cores.primaria}
                        onChange={handleChange}
                        placeholder="#4f46e5"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada para botões, links e elementos de destaque</p>
                  </div>

                  {isPlanoPago && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cores.secundaria">Cor de Fundo</Label>
                        <div className="flex gap-2">
                          <div
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: formData.cores.secundaria }}
                          />
                          <Input
                            id="cores.secundaria"
                            name="cores.secundaria"
                            type="text"
                            value={formData.cores.secundaria}
                            onChange={handleChange}
                            placeholder="#f9fafb"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Usada para o fundo do cabeçalho e rodapé</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cores.texto">Cor do Texto</Label>
                        <div className="flex gap-2">
                          <div
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: formData.cores.texto }}
                          />
                          <Input
                            id="cores.texto"
                            name="cores.texto"
                            type="text"
                            value={formData.cores.texto}
                            onChange={handleChange}
                            placeholder="#111827"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Usada para textos principais</p>
                      </div>
                    </>
                  )}
                </div>

                {!isPlanoPago && (
                  <div className="rounded-md bg-amber-50 p-4 text-amber-800 text-sm">
                    <p>Personalização completa de cores está disponível apenas para planos pagos.</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-amber-800 underline"
                      onClick={() => router.push("/dashboard/planos")}
                    >
                      Fazer upgrade do plano
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Personalização
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

