"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

interface DiagnosticoItem {
  nome: string
  status: "success" | "error" | "pending"
  mensagem: string
}

export default function DiagnosticoPage() {
  const { data: session, status } = useSession()
  const [diagnosticos, setDiagnosticos] = useState<DiagnosticoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const executarDiagnostico = async () => {
    if (!session) {
      return
    }

    setIsLoading(true)
    setDiagnosticos([
      { nome: "Verificando sessão", status: "pending", mensagem: "Verificando dados da sessão..." },
      {
        nome: "Verificando banco de dados",
        status: "pending",
        mensagem: "Verificando conexão com o banco de dados...",
      },
      { nome: "Verificando loja", status: "pending", mensagem: "Verificando se existe uma loja para o usuário..." },
      { nome: "Verificando vitrine", status: "pending", mensagem: "Verificando se existe uma vitrine para a loja..." },
    ])

    // Verificar sessão
    setTimeout(() => {
      setDiagnosticos((prev) => {
        const newDiagnosticos = [...prev]
        newDiagnosticos[0] = {
          nome: "Verificando sessão",
          status: session ? "success" : "error",
          mensagem: session ? `Sessão válida para ${session.user.email}` : "Sessão inválida ou expirada",
        }
        return newDiagnosticos
      })

      // Verificar banco de dados
      fetch("/api/check-connection")
        .then((res) => res.json())
        .then((data) => {
          setDiagnosticos((prev) => {
            const newDiagnosticos = [...prev]
            newDiagnosticos[1] = {
              nome: "Verificando banco de dados",
              status: data.success ? "success" : "error",
              mensagem: data.success
                ? "Conexão com o banco de dados estabelecida"
                : `Erro na conexão com o banco de dados: ${data.error}`,
            }
            return newDiagnosticos
          })

          // Verificar loja
          if (data.success) {
            fetch("/api/loja/perfil")
              .then((res) => res.json())
              .then((data) => {
                setDiagnosticos((prev) => {
                  const newDiagnosticos = [...prev]
                  newDiagnosticos[2] = {
                    nome: "Verificando loja",
                    status: data.loja ? "success" : "error",
                    mensagem: data.loja
                      ? `Loja encontrada: ${data.loja.nome}`
                      : "Nenhuma loja encontrada para o usuário",
                  }
                  return newDiagnosticos
                })

                // Verificar vitrine
                if (data.loja) {
                  fetch(`/api/loja/${data.loja._id}/vitrine/configuracoes`)
                    .then((res) => res.json())
                    .then((data) => {
                      setDiagnosticos((prev) => {
                        const newDiagnosticos = [...prev]
                        newDiagnosticos[3] = {
                          nome: "Verificando vitrine",
                          status: data.vitrine ? "success" : "error",
                          mensagem: data.vitrine
                            ? `Vitrine encontrada com tema: ${data.vitrine.tema}`
                            : "Nenhuma vitrine encontrada para a loja",
                        }
                        return newDiagnosticos
                      })
                      setIsLoading(false)
                    })
                    .catch((error) => {
                      setDiagnosticos((prev) => {
                        const newDiagnosticos = [...prev]
                        newDiagnosticos[3] = {
                          nome: "Verificando vitrine",
                          status: "error",
                          mensagem: `Erro ao verificar vitrine: ${error.message}`,
                        }
                        return newDiagnosticos
                      })
                      setIsLoading(false)
                    })
                } else {
                  setDiagnosticos((prev) => {
                    const newDiagnosticos = [...prev]
                    newDiagnosticos[3] = {
                      nome: "Verificando vitrine",
                      status: "error",
                      mensagem: "Não foi possível verificar a vitrine pois não há loja",
                    }
                    return newDiagnosticos
                  })
                  setIsLoading(false)
                }
              })
              .catch((error) => {
                setDiagnosticos((prev) => {
                  const newDiagnosticos = [...prev]
                  newDiagnosticos[2] = {
                    nome: "Verificando loja",
                    status: "error",
                    mensagem: `Erro ao verificar loja: ${error.message}`,
                  }
                  newDiagnosticos[3] = {
                    nome: "Verificando vitrine",
                    status: "error",
                    mensagem: "Não foi possível verificar a vitrine devido a erro na loja",
                  }
                  return newDiagnosticos
                })
                setIsLoading(false)
              })
          } else {
            setDiagnosticos((prev) => {
              const newDiagnosticos = [...prev]
              newDiagnosticos[2] = {
                nome: "Verificando loja",
                status: "error",
                mensagem: "Não foi possível verificar a loja devido a erro no banco de dados",
              }
              newDiagnosticos[3] = {
                nome: "Verificando vitrine",
                status: "error",
                mensagem: "Não foi possível verificar a vitrine devido a erro no banco de dados",
              }
              return newDiagnosticos
            })
            setIsLoading(false)
          }
        })
        .catch((error) => {
          setDiagnosticos((prev) => {
            const newDiagnosticos = [...prev]
            newDiagnosticos[1] = {
              nome: "Verificando banco de dados",
              status: "error",
              mensagem: `Erro ao verificar banco de dados: ${error.message}`,
            }
            newDiagnosticos[2] = {
              nome: "Verificando loja",
              status: "error",
              mensagem: "Não foi possível verificar a loja devido a erro no banco de dados",
            }
            newDiagnosticos[3] = {
              nome: "Verificando vitrine",
              status: "error",
              mensagem: "Não foi possível verificar a vitrine devido a erro no banco de dados",
            }
            return newDiagnosticos
          })
          setIsLoading(false)
        })
    }, 1000)
  }

  useEffect(() => {
    if (status === "authenticated") {
      executarDiagnostico()
    }
  }, [status])

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Diagnóstico do Sistema</CardTitle>
          <CardDescription>Verificação de componentes e serviços</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando sessão...</span>
            </div>
          ) : status === "unauthenticated" ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
              Você precisa estar autenticado para executar o diagnóstico.
            </div>
          ) : (
            <div className="space-y-4">
              {diagnosticos.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md ${
                    item.status === "success"
                      ? "bg-green-50 border border-green-200"
                      : item.status === "error"
                        ? "bg-red-50 border border-red-200"
                        : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        item.status === "success"
                          ? "text-green-700"
                          : item.status === "error"
                            ? "text-red-700"
                            : "text-blue-700"
                      }`}
                    >
                      {item.nome}
                    </h3>
                    {item.status === "pending" && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  <p
                    className={`mt-1 text-sm ${
                      item.status === "success"
                        ? "text-green-600"
                        : item.status === "error"
                          ? "text-red-600"
                          : "text-blue-600"
                    }`}
                  >
                    {item.mensagem}
                  </p>
                </div>
              ))}

              {diagnosticos.some((item) => item.status === "error") && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md mt-4">
                  <h3 className="font-medium">Problemas detectados</h3>
                  <p className="mt-1 text-sm">
                    Foram encontrados problemas no diagnóstico. Você pode tentar inicializar a loja e vitrine
                    automaticamente clicando no botão abaixo.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Voltar para o Dashboard
          </Button>
          {status === "authenticated" && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={executarDiagnostico} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  "Executar Novamente"
                )}
              </Button>
              <Button onClick={() => (window.location.href = "/init-loja-vitrine")} disabled={isLoading}>
                Inicializar Loja e Vitrine
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
