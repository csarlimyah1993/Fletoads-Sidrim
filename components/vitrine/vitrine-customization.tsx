"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import ImageUpload from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ColorPicker } from "@/components/ui/color-picker"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  businessName: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  primaryColor: z.string().default("#4F46E5"),
  secondaryColor: z.string().default("#10B981"),
  showSocialMedia: z.boolean().default(true),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  whatsapp: z.string().optional(),
})

export default function VitrineCustomization() {
  const [logoUrl, setLogoUrl] = useState<string[]>([])
  const [bannerUrl, setBannerUrl] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      description: "",
      primaryColor: "#4F46E5",
      secondaryColor: "#10B981",
      showSocialMedia: true,
      instagram: "",
      facebook: "",
      whatsapp: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({
      ...values,
      logo: logoUrl,
      banner: bannerUrl,
    })
    // TODO: Submit to API
  }

  const handleLogoChange = (url: string) => {
    setLogoUrl([url])
  }

  const handleLogoRemove = (url: string) => {
    setLogoUrl([])
  }

  const handleBannerChange = (url: string) => {
    setBannerUrl([url])
  }

  const handleBannerRemove = (url: string) => {
    setBannerUrl([])
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Personalização da Vitrine</CardTitle>
          <CardDescription>Configure a aparência da sua vitrine online.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
              <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            </TabsList>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <TabsContent value="general">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua Empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descreva sua empresa em poucas palavras..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">Logo</h3>
                        <p className="text-sm text-muted-foreground mb-2">Faça upload do logo da sua empresa.</p>
                        <ImageUpload
                          value={logoUrl}
                          endpoint="upload"
                          onChange={handleLogoChange}
                          onRemove={handleLogoRemove}
                          onUploadComplete={(url: string) => handleLogoChange(url)}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Banner</h3>
                        <p className="text-sm text-muted-foreground mb-2">Faça upload de um banner para sua vitrine.</p>
                        <ImageUpload
                          value={bannerUrl}
                          endpoint="upload"
                          onChange={handleBannerChange}
                          onRemove={handleBannerRemove}
                          onUploadComplete={(url: string) => handleBannerChange(url)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="appearance">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Primária</FormLabel>
                          <FormControl>
                            <ColorPicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor Secundária</FormLabel>
                          <FormControl>
                            <ColorPicker value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="social">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="showSocialMedia"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exibir Redes Sociais</FormLabel>
                            <FormDescription>Mostrar links para suas redes sociais na vitrine.</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch("showSocialMedia") && (
                      <>
                        <FormField
                          control={form.control}
                          name="instagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <FormControl>
                                <Input placeholder="@seuinstagram" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="facebook"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facebook</FormLabel>
                              <FormControl>
                                <Input placeholder="facebook.com/suapagina" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="+5511999999999" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </TabsContent>
                <Button type="submit">Salvar Alterações</Button>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
