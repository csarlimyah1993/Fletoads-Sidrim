"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import ImageUpload from "@/components/ui/image-upload"

const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1, { message: "A rua é obrigatória." }),
    numero: z.string().min(1, { message: "O número é obrigatório." }),
    complemento: z.string().optional(),
    bairro: z.string().min(1, { message: "O bairro é obrigatório." }),
    cidade: z.string().min(1, { message: "A cidade é obrigatória." }),
    estado: z.string().min(1, { message: "O estado é obrigatório." }),
    cep: z.string().min(1, { message: "O CEP é obrigatório." }),
  }),
  contato: z.object({
    telefone: z.string().min(1, { message: "O telefone é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
  }),
  horarioFuncionamento: z.object({
    segunda: z.string().optional(),
    terca: z.string().optional(),
    quarta: z.string().optional(),
    quinta: z.string().optional(),
    sexta: z.string().optional(),
    sabado: z.string().optional(),
    domingo: z.string().optional(),
  }),
  configuracoes: z.object({
    mostrarHorarios: z.boolean().default(true),
    mostrarEndereco: z.boolean().default(true),
    mostrarContatos: z.boolean().default(true),
    permitirComentarios: z.boolean().default(true),
  }),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

export function LojaForm() {
  const [logoUrl, setLogoUrl] = useState<string[]>([])
  const [bannerUrl, setBannerUrl] = useState<string[]>([])

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      endereco: {
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
      contato: {
        telefone: "",
        email: "",
        whatsapp: "",
        instagram: "",
        facebook: "",
      },
      horarioFuncionamento: {
        segunda: "",
        terca: "",
        quarta: "",
        quinta: "",
        sexta: "",
        sabado: "",
        domingo: "",
      },
      configuracoes: {
        mostrarHorarios: true,
        mostrarEndereco: true,
        mostrarContatos: true,
        permitirComentarios: true,
      },
    },
  })

  function onSubmit(data: LojaFormValues) {
    // Include the logo and banner URLs
    const lojaData = {
      ...data,
      logo: logoUrl[0],
      banner: bannerUrl[0],
    }

    console.log(lojaData)

    toast({
      title: "Perfil da loja atualizado",
      description: "As informações da sua loja foram atualizadas com sucesso.",
    })
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Perfil da Loja</CardTitle>
            <CardDescription>Configure as informações da sua loja que serão exibidas para os clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="informacoes">
              <TabsList className="mb-6">
                <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="horarios">Horários</TabsTrigger>
                <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes" className="space-y-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Loja</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da sua loja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva sua loja em poucas palavras..." {...field} />
                      </FormControl>
                      <FormDescription>Esta descrição será exibida na página principal da sua loja.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Logo</h3>
                    <ImageUpload
                      value={logoUrl}
                      endpoint="upload"
                      onChange={handleLogoChange}
                      onRemove={handleLogoRemove}
                      onUploadComplete={(url: string) => handleLogoChange(url)}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Banner</h3>
                    <ImageUpload
                      value={bannerUrl}
                      endpoint="upload"
                      onChange={handleBannerChange}
                      onRemove={handleBannerRemove}
                      onUploadComplete={(url: string) => handleBannerChange(url)}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recomendamos uma imagem de pelo menos 1200x400 pixels.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="endereco" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endereco.rua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rua" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="endereco.complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Complemento (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endereco.bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endereco.estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contato" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contato.telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 0000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@sualoja.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contato.whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormDescription>Inclua o código do país (ex: +55).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="contato.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <Input placeholder="@sualoja" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="facebook.com/sualoja" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="horarios" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.segunda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Segunda-feira</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 18:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.terca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Terça-feira</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 18:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.quarta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quarta-feira</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 18:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.quinta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quinta-feira</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 18:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.sexta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexta-feira</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 18:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horarioFuncionamento.sabado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sábado</FormLabel>
                        <FormControl>
                          <Input placeholder="08:00 - 12:00" {...field} />
                        </FormControl>
                        <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="horarioFuncionamento.domingo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domingo</FormLabel>
                      <FormControl>
                        <Input placeholder="Fechado" {...field} />
                      </FormControl>
                      <FormDescription>Deixe em branco para "Fechado".</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="configuracoes" className="space-y-6">
                <FormField
                  control={form.control}
                  name="configuracoes.mostrarHorarios"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar Horários</FormLabel>
                        <FormDescription>Exibir os horários de funcionamento na sua loja.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuracoes.mostrarEndereco"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar Endereço</FormLabel>
                        <FormDescription>Exibir o endereço físico da sua loja.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuracoes.mostrarContatos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mostrar Contatos</FormLabel>
                        <FormDescription>Exibir informações de contato na sua loja.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="configuracoes.permitirComentarios"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Permitir Comentários</FormLabel>
                        <FormDescription>Permitir que clientes deixem comentários nos produtos.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Salvar Alterações</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
