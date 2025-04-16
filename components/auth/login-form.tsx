"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPInput } from "@/components/ui/otp-input"
import { sendEmailVerificationCode, verifyEmailOTP } from "@/app/actions/auth-actions"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

const otpSchema = z.object({
  otp: z.string().min(6, "O código deve ter 6 dígitos"),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState<"credentials" | "email-verification" | "two-factor">("credentials")
  const [userEmail, setUserEmail] = useState("")
  const [error, setError] = useState("")
  const [otpValue, setOtpValue] = useState("")
  const [verificationMethod, setVerificationMethod] = useState<"email" | "app">("email")

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    setError("")
    setUserEmail(data.email)

    try {
      // First, try to sign in with credentials
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error === "2FA_REQUIRED") {
        // If 2FA is required, check if it's app-based or email-based
        setCurrentStep("two-factor")
        setVerificationMethod("app") // Default to app-based
        setIsLoading(false)
      } else if (result?.error === "EMAIL_VERIFICATION_REQUIRED") {
        // If email verification is required
        setCurrentStep("email-verification")
        // Send verification code to email
        const emailResult = await sendEmailVerificationCode(data.email)
        if (!emailResult.success) {
          setError(emailResult.message)
        } else {
          toast.info("Código de verificação enviado para seu email")
        }
        setIsLoading(false)
      } else if (result?.error) {
        setError(`Credenciais inválidas. Por favor, tente novamente.`)
        setIsLoading(false)
      } else {
        toast.success("Login realizado com sucesso")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError("Ocorreu um erro ao fazer login. Por favor, tente novamente.")
      setIsLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Verify the email OTP
      const verificationResult = await verifyEmailOTP(userEmail, otpValue)

      if (!verificationResult.success) {
        setError(verificationResult.message)
        setIsLoading(false)
        return
      }

      // If verification is successful, complete the login
      const result = await signIn("credentials", {
        redirect: false,
        email: userEmail,
        emailVerified: "true",
      })

      if (result?.error) {
        setError(`Erro ao completar login: ${result.error}`)
        setIsLoading(false)
      } else {
        toast.success("Login realizado com sucesso")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error)
      setError("Ocorreu um erro ao verificar o código. Por favor, tente novamente.")
      setIsLoading(false)
    }
  }

  const handleTwoFactorVerification = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Complete login with 2FA token
      const result = await signIn("credentials", {
        redirect: false,
        email: userEmail,
        twoFactorToken: otpValue,
      })

      if (result?.error) {
        setError(`Código inválido. Por favor, tente novamente.`)
        setIsLoading(false)
      } else {
        toast.success("Login realizado com sucesso")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error)
      setError("Ocorreu um erro ao verificar o código. Por favor, tente novamente.")
      setIsLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await sendEmailVerificationCode(userEmail)
      if (result.success) {
        toast.success("Código reenviado com sucesso")
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error("Erro ao reenviar código:", error)
      setError("Ocorreu um erro ao reenviar o código. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Acesse sua conta para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === "credentials" && (
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
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} placeholder="Sua senha" {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Esconder senha" : "Mostrar senha"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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
        )}

        {currentStep === "email-verification" && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" className="p-0 mr-2" onClick={() => setCurrentStep("credentials")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">Verificação por Email</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Enviamos um código de verificação para <strong>{userEmail}</strong>. Por favor, verifique sua caixa de
              entrada e insira o código abaixo.
            </p>

            <div className="my-6">
              <label className="block text-sm font-medium mb-2">Código de verificação</label>
              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                numInputs={6}
                renderInput={(props) => <Input {...props} className="w-12 h-12 text-center mx-1" />}
                containerStyle="flex justify-center gap-2"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handleEmailVerification} disabled={isLoading || otpValue.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-2">Não recebeu o código?</p>
              <Button variant="outline" size="sm" onClick={resendVerificationCode} disabled={isLoading}>
                Reenviar código
              </Button>
            </div>
          </div>
        )}

        {currentStep === "two-factor" && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" className="p-0 mr-2" onClick={() => setCurrentStep("credentials")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium">Autenticação de Dois Fatores</h3>
            </div>

            <p className="text-sm text-muted-foreground">
              Digite o código de verificação do seu aplicativo autenticador.
            </p>

            <div className="my-6">
              <label className="block text-sm font-medium mb-2">Código de verificação</label>
              <OTPInput
                value={otpValue}
                onChange={setOtpValue}
                numInputs={6}
                renderInput={(props) => <Input {...props} className="w-12 h-12 text-center mx-1" />}
                containerStyle="flex justify-center gap-2"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              onClick={handleTwoFactorVerification}
              disabled={isLoading || otpValue.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-center">
          <Link href="/esqueci-senha" className="text-primary hover:underline">
            Esqueceu sua senha?
          </Link>
        </div>
        <div className="text-sm text-center">
          Não tem uma conta?{" "}
          <Link href="/registro" className="text-primary hover:underline">
            Registre-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
