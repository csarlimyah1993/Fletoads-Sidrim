"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Schema de validação
const redefinirSenhaSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  novaSenha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type RedefinirSenhaFormValues = z.infer<typeof redefinirSenhaSchema>

export default function RedefinirSenhaPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RedefinirSenhaFormValues>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: {
      email: "",
      novaSenha: "",
    },
  })

  async function onSubmit(values: RedefinirSenhaFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/debug/redefinir-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha")
      }

      toast.success("Senha redefinida com sucesso!")
      form.reset()
    } catch (error) {
      console.error("Erro ao redefinir senha:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao redefinir senha")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>Redefina a senha de um usuário para uma senha simples</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Esta página é apenas para desenvolvimento. Não use em produção.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

