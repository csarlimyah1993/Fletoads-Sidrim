"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
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
const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    try {
      console.log("Tentando login com:", values.email)

      // Adicionar informações de debug
      setDebugInfo(`Tentando login com email: ${values.email}`)

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        console.error("Erro no login:", result.error)
        setError("Credenciais inválidas. Por favor, tente novamente.")
        toast.error("Credenciais inválidas. Por favor, tente novamente.")

        // Adicionar mais informações de debug
        setDebugInfo((prev) => `${prev}\nErro no login: ${result.error}`)
      } else {
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError("Ocorreu um erro ao fazer login. Por favor, tente novamente.")
      toast.error("Ocorreu um erro ao fazer login. Por favor, tente novamente.")

      // Adicionar mais informações de debug
      setDebugInfo((prev) => `${prev}\nErro ao fazer login: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Entre com seu email e senha para acessar sua conta</CardDescription>
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
                      <Input placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              {debugInfo && process.env.NODE_ENV === "development" && (
                <div className="mt-2 rounded-md bg-gray-100 p-2 text-xs font-mono dark:bg-gray-800">
                  <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Button variant="link" className="p-0" onClick={() => router.push("/cadastro")}>
              Cadastre-se
            </Button>
          </div>
          <div className="text-center text-sm">
            <Button variant="link" className="p-0" onClick={() => router.push("/debug/redefinir-senha")}>
              Redefinir senha (Debug)
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

