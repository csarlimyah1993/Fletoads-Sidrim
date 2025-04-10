"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Schema de validação
const lojaSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  descricao: z.string().optional(),
  endereco: z
    .object({
      rua: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
    })
    .optional(),
  contato: z
    .object({
      telefone: z.string().optional(),
      email: z.string().email().optional(),
      whatsapp: z.string().optional(),
    })
    .optional(),
})

type LojaFormValues = z.infer<typeof lojaSchema>

export interface CriarLojaFormProps {
  initialData?: any
  isEditing?: boolean
}

export function CriarLojaForm({ initialData, isEditing = false }: CriarLojaFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      endereco: {
        rua: initialData?.endereco?.rua || "",
        numero: initialData?.endereco?.numero || "",
        complemento: initialData?.endereco?.complemento || "",
        bairro: initialData?.endereco?.bairro || "",
        cidade: initialData?.endereco?.cidade || "",
        estado: initialData?.endereco?.estado || "",
        cep: initialData?.endereco?.cep || "",
      },
      contato: {
        telefone: initialData?.contato?.telefone || "",
        email: initialData?.contato?.email || "",
        whatsapp: initialData?.contato?.whatsapp || "",
      },
    },
  })

  async function onSubmit(values: LojaFormValues) {
    try {
      setIsSubmitting(true)
      console.log("Enviando dados da loja:", values)

      const endpoint = isEditing ? "/api/loja/perfil" : "/api/loja"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Falha ao ${isEditing ? "atualizar" : "criar"} loja: ${response.status}`)
      }

      const data = await response.json()
      console.log("Resposta:", data)

      toast.success(`Loja ${isEditing ? "atualizada" : "criada"} com sucesso!`)

      // Redirecionar ou atualizar a página se necessário
      if (!isEditing) {
        window.location.href = "/dashboard/perfil-da-loja"
      }
    } catch (error) {
      console.error(`Erro ao ${isEditing ? "atualizar" : "criar"} loja:`, error)
      toast.error(`Erro ao ${isEditing ? "atualizar" : "criar"} loja. Por favor, tente novamente.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                  <Textarea placeholder="Descreva sua loja" {...field} rows={4} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.rua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua" {...field} />
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
                    <Input placeholder="Complemento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado" {...field} />
                    </FormControl>
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
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="contato.whatsapp"
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
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Atualizando..." : "Criando..."}
            </>
          ) : isEditing ? (
            "Atualizar Loja"
          ) : (
            "Criar Loja"
          )}
        </Button>
      </form>
    </Form>
  )
}
