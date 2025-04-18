"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"

// Define the form schema with zod
const formSchema = z.object({
  nomeLoja: z.string().min(1, "Nome da loja é obrigatório"),
  descricao: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface LojaPerfilFormProps {
  onSubmit: (data: FormValues) => void
  initialValues?: Partial<FormValues>
}

export default function LojaPerfilForm({ onSubmit, initialValues = {} }: LojaPerfilFormProps) {
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeLoja: initialValues.nomeLoja || "",
      descricao: initialValues.descricao || "",
      logoUrl: initialValues.logoUrl || "",
      bannerUrl: initialValues.bannerUrl || "",
    },
  })

  // Handle form submission
  function handleSubmit(data: FormValues) {
    onSubmit(data)
  }

  return (
    <div className="container max-w-3xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Informações da Loja</h2>
        <p className="text-muted-foreground">Preencha as informações básicas da sua loja</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nomeLoja"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Loja</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da sua loja" {...field} />
                    </FormControl>
                    <FormDescription>Este é o nome que será exibido para seus clientes.</FormDescription>
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
                      <Textarea
                        placeholder="Descreva sua loja em poucas palavras"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Uma breve descrição sobre sua loja e produtos.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={(url) => field.onChange(typeof url === "string" ? url : url[0] || "")}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormDescription>Recomendamos uma imagem quadrada de pelo menos 200x200 pixels.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bannerUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={(url) => field.onChange(typeof url === "string" ? url : url[0] || "")}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormDescription>Recomendamos uma imagem de 1200x300 pixels.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
