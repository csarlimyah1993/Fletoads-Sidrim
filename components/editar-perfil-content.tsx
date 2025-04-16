"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Definir tipos para os horários de funcionamento
interface HorarioConfig {
  open: string
  close: string
  type: string
}

interface HorariosFuncionamento {
  segunda: HorarioConfig
  terca: HorarioConfig
  quarta: HorarioConfig
  quinta: HorarioConfig
  sexta: HorarioConfig
  sabado: HorarioConfig
  domingo: HorarioConfig
  [key: string]: HorarioConfig // Índice de string para acesso dinâmico
}

// Definir o schema de validação
const perfilSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  site: z.string().url("URL inválida").optional().or(z.literal("")),
  endereco: z.string().optional(),
  redesSociais: z
    .object({
      facebook: z.string().url("URL inválida").optional().or(z.literal("")),
      instagram: z.string().url("URL inválida").optional().or(z.literal("")),
      twitter: z.string().url("URL inválida").optional().or(z.literal("")),
      youtube: z.string().url("URL inválida").optional().or(z.literal("")),
      linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
      tiktok: z.string().url("URL inválida").optional().or(z.literal("")),
    })
    .optional(),
})

type PerfilFormValues = z.infer<typeof perfilSchema>

interface EditarPerfilContentProps {
  usuario: any
  perfil: any
}

export function EditarPerfilContent({ usuario, perfil }: EditarPerfilContentProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [horarios, setHorarios] = useState<HorariosFuncionamento>({
    segunda: { open: "09:00", close: "18:00", type: "open" },
    terca: { open: "09:00", close: "18:00", type: "open" },
    quarta: { open: "09:00", close: "18:00", type: "open" },
    quinta: { open: "09:00", close: "18:00", type: "open" },
    sexta: { open: "09:00", close: "18:00", type: "open" },
    sabado: { open: "10:00", close: "14:00", type: "open" },
    domingo: { open: "00:00", close: "00:00", type: "closed" },
  })

  // Preparar valores iniciais para o formulário
  const defaultValues: PerfilFormValues = {
    nome: perfil?.nome || usuario?.name || "",
    descricao: perfil?.descricao || "",
    telefone: perfil?.telefone || "",
    whatsapp: perfil?.whatsapp || "",
    email: perfil?.email || usuario?.email || "",
    site: perfil?.site || "",
    endereco: typeof perfil?.endereco === "string" ? perfil.endereco : "",
    redesSociais: {
      facebook: perfil?.redesSociais?.facebook || "",
      instagram: perfil?.redesSociais?.instagram || "",
      twitter: perfil?.redesSociais?.twitter || "",
      youtube: perfil?.redesSociais?.youtube || "",
      linkedin: perfil?.redesSociais?.linkedin || "",
      tiktok: perfil?.redesSociais?.tiktok || "",
    },
  }

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues,
  })

  // Carregar horários existentes, se houver
  useEffect(() => {
    if (perfil?.horarioFuncionamento) {
      try {
        const horariosSalvos =
          typeof perfil.horarioFuncionamento === "string"
            ? JSON.parse(perfil.horarioFuncionamento)
            : perfil.horarioFuncionamento

        if (horariosSalvos && typeof horariosSalvos === "object") {
          setHorarios((prev) => ({ ...prev, ...horariosSalvos }))
        }
      } catch (error) {
        console.error("Erro ao carregar horários:", error)
      }
    }
  }, [perfil])

  const handleHorarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const [day, field] = name.split(".")

    setHorarios((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleHorarioTypeChange = (day: string, type: string) => {
    setHorarios((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        type,
      },
    }))
  }

  const diasDaSemana = [
    { id: "segunda", label: "Segunda-feira" },
    { id: "terca", label: "Terça-feira" },
    { id: "quarta", label: "Quarta-feira" },
    { id: "quinta", label: "Quinta-feira" },
    { id: "sexta", label: "Sexta-feira" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ]

  const copiarHorarios = (id: string) => {
    const horarioBase = horarios[id]
    const novoHorarios: Record<string, HorarioConfig> = {}

    diasDaSemana.forEach((dia) => {
      if (dia.id !== id) {
        novoHorarios[dia.id] = { ...horarioBase }
      }
    })

    setHorarios({ ...horarios, ...novoHorarios })
  }

  const limparHorarios = () => {
    setHorarios({
      segunda: { open: "09:00", close: "18:00", type: "open" },
      terca: { open: "09:00", close: "18:00", type: "open" },
      quarta: { open: "09:00", close: "18:00", type: "open" },
      quinta: { open: "09:00", close: "18:00", type: "open" },
      sexta: { open: "09:00", close: "18:00", type: "open" },
      sabado: { open: "10:00", close: "14:00", type: "open" },
      domingo: { open: "00:00", close: "00:00", type: "closed" },
    })
  }

  const onSubmit = async (data: PerfilFormValues) => {
    setIsSubmitting(true)
    try {
      // Adicionar horários ao payload
      const payload = {
        ...data,
        horarioFuncionamento: JSON.stringify(horarios),
      }

      const response = await fetch(`/api/perfil/${perfil?._id || "novo"}`, {
        method: perfil?._id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar perfil")
      }

      toast.success("Perfil atualizado com sucesso!")
      router.push("/dashboard/perfil")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || "Erro ao atualizar perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
          <TabsTrigger value="horarios">Horários de Funcionamento</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="informacoes">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
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
                          <Textarea placeholder="Uma breve descrição sobre você" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telefone"
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
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="site"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.seusite.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="horarios">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Horários de Funcionamento</h3>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={limparHorarios}>
                        Redefinir
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {diasDaSemana.map((dia) => (
                      <div key={dia.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                        <div className="flex items-center justify-between md:justify-start">
                          <span className="font-medium">{dia.label}</span>
                          <div className="md:hidden ml-auto">
                            <Select
                              value={horarios[dia.id].type}
                              onValueChange={(value) => handleHorarioTypeChange(dia.id, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Aberto</SelectItem>
                                <SelectItem value="closed">Fechado</SelectItem>
                                <SelectItem value="appointment">Agendamento</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-2">
                          <Select
                            value={horarios[dia.id].type}
                            onValueChange={(value) => handleHorarioTypeChange(dia.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Aberto</SelectItem>
                              <SelectItem value="closed">Fechado</SelectItem>
                              <SelectItem value="appointment">Agendamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              name={`${dia.id}.open`}
                              value={horarios[dia.id].open}
                              onChange={handleHorarioChange}
                              disabled={horarios[dia.id].type === "closed"}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              name={`${dia.id}.close`}
                              value={horarios[dia.id].close}
                              onChange={handleHorarioChange}
                              disabled={horarios[dia.id].type === "closed"}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copiarHorarios(dia.id)}
                            className="text-xs"
                          >
                            Aplicar a todos
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="redes">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <h3 className="text-lg font-medium">Redes Sociais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input placeholder="https://tiktok.com/@seuperfil" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/perfil")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
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
        </Form>
      </Tabs>
    </div>
  )
}
