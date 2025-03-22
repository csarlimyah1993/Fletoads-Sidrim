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
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Escolha o plano ideal para o seu negócio</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Temos opções para todos os tamanhos de negócio, desde pequenos comércios até grandes empresas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Object.values(planosData).map((plano: any) => (
            <Card key={plano.id} className={`flex flex-col ${plano.popular ? "border-primary shadow-md" : ""}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-gray-900">{plano.nome}</CardTitle>
                  {plano.popular && <Badge className="bg-green-100 text-green-800">Popular</Badge>}
                </div>
                <CardDescription className="text-gray-600">
                  {plano.preco === 0 ? (
                    "Grátis"
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-gray-900">
                        R$ {plano.preco.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-gray-500">/mês</span>
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
                    <span className="text-gray-700">
                      {plano.vitrine > 0 ? (
                        <>{plano.vitrine} produtos na vitrine</>
                      ) : (
                        <span className="text-gray-500">Sem vitrine web</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plano.panfletos > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700">
                      {plano.panfletos > 0 ? (
                        <>{plano.panfletos} panfletos digitais</>
                      ) : (
                        <span className="text-gray-500">Sem panfletos digitais</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plano.promocoes > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700">
                      {plano.promocoes > 0 ? (
                        <>{plano.promocoes} promoções em destaque</>
                      ) : (
                        <span className="text-gray-500">Sem promoções em destaque</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span className="text-gray-700">{plano.imagensPorProduto} imagem(ns) por produto</span>
                  </li>
                  <li className="flex items-start">
                    {plano.whatsapp > 0 ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700">
                      {plano.whatsapp > 0 ? (
                        <>
                          {plano.whatsapp} conta{plano.whatsapp > 1 ? "s" : ""} WhatsApp
                        </>
                      ) : (
                        <span className="text-gray-500">Sem integração WhatsApp</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    {plano.tourVirtual ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className="text-gray-700">
                      {plano.tourVirtual ? (
                        <>Tour Virtual {typeof plano.tourVirtual === "string" ? plano.tourVirtual : ""}</>
                      ) : (
                        <span className="text-gray-500">Sem Tour Virtual</span>
                      )}
                    </span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plano.popular ? "default" : "outline"}>
                  {plano.id === "gratis" ? "Plano Atual" : "Escolher Plano"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

