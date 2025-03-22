"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { planos } from "@/lib/planos"

export function PlanosSection() {
  const [planosData, setPlanosData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setIsLoading(true)

        // Usar os planos diretamente do arquivo, sem fazer requisição à API
        setPlanosData(planos)
        setError(null)
      } catch (error) {
        console.error("Erro ao buscar planos:", error)
        setError("Não foi possível carregar os planos. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanos()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800 w-full">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Escolha o plano ideal para o seu negócio</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
            Temos opções para todos os tamanhos de negócio, desde pequenos comércios até grandes empresas.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {Object.values(planosData).map((plano: any) => (
            <Card
              key={plano.id}
              className={`flex flex-col ${plano.popular ? "border-primary shadow-md" : ""}`}
              style={{ width: "min(100%, 300px)" }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-gray-900 dark:text-white">{plano.nome}</CardTitle>
                  {plano.popular && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Popular</Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {plano.preco === 0 && plano.id === "gratis" ? (
                    "Grátis"
                  ) : plano.id === "empresarial" ? (
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Personalizado</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        R$ {plano.preco.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/mês</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    {plano.vitrine > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.vitrine > 0 ? (
                        <>{plano.vitrine} produtos na vitrine</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem vitrine web</span>
                      )}
                    </span>
                  </li>

                  {/* Personalização da Vitrine */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Personalização da vitrine
                      {plano.id !== "gratis" && <span className="text-primary"> (avançada)</span>}
                    </span>
                  </li>

                  {/* Banner */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Banner personalizado</span>
                  </li>

                  {/* Layouts */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.personalizacaoVitrine.layouts} layouts de vitrine
                    </span>
                  </li>

                  {/* Widgets */}
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.personalizacaoVitrine.widgets} widgets
                    </span>
                  </li>

                  {/* Animações */}
                  <li className="flex items-start">
                    {plano.personalizacaoVitrine.animacoes ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.personalizacaoVitrine.animacoes ? (
                        <>Animações e transições</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem animações</span>
                      )}
                    </span>
                  </li>

                  {/* Fontes */}
                  <li className="flex items-start">
                    {plano.personalizacaoVitrine.fontes ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.personalizacaoVitrine.fontes ? (
                        <>Personalização de fontes</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Fonte padrão</span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start">
                    {plano.panfletos > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.panfletos > 0 ? (
                        <>{plano.panfletos} panfletos digitais</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem panfletos digitais</span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start">
                    {plano.promocoes > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.promocoes > 0 ? (
                        <>{plano.promocoes} promoções em destaque</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem promoções em destaque</span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.imagensPorProduto} imagem(ns) por produto
                    </span>
                  </li>

                  <li className="flex items-start">
                    {plano.whatsapp > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.whatsapp > 0 ? (
                        <>
                          {plano.whatsapp} conta{plano.whatsapp > 1 ? "s" : ""} WhatsApp
                        </>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem integração WhatsApp</span>
                      )}
                    </span>
                  </li>

                  <li className="flex items-start">
                    {plano.tourVirtual ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      {plano.tourVirtual ? (
                        <>Tour Virtual {typeof plano.tourVirtual === "string" ? plano.tourVirtual : ""}</>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Sem Tour Virtual</span>
                      )}
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plano.popular ? "default" : "outline"}>
                  {plano.id === "gratis"
                    ? "Plano Atual"
                    : plano.id === "empresarial"
                      ? "Entre em contato"
                      : "Escolher Plano"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

