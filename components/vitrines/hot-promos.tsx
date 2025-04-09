"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { CalendarDays, Tag, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Promocao {
  _id: string
  titulo: string
  descricao?: string
  imagem?: string
  dataInicio: string
  dataFim: string
  desconto: number
  tipoDesconto: "percentual" | "valor"
  codigoPromocional?: string
}

interface HotPromosProps {
  lojaId: string
}

export function HotPromos({ lojaId }: HotPromosProps) {
  const { toast } = useToast()
  const [promocoes, setPromocoes] = useState<Promocao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromocoes()
  }, [lojaId])

  const fetchPromocoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/promocoes?lojaId=${lojaId}&ativas=true`)

      if (response.ok) {
        const data = await response.json()
        setPromocoes(data.promocoes)
      }
    } catch (error) {
      console.error("Erro ao buscar promoções:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as promoções",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("pt-BR")
  }

  const formatarDesconto = (valor: number, tipo: "percentual" | "valor") => {
    if (tipo === "percentual") {
      return `${valor}%`
    } else {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)
    }
  }

  const calcularTempoRestante = (dataFim: string) => {
    const agora = new Date()
    const fim = new Date(dataFim)
    const diferenca = fim.getTime() - agora.getTime()

    if (diferenca <= 0) {
      return "Encerrado"
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (dias > 0) {
      return `${dias} dia${dias > 1 ? "s" : ""} e ${horas} hora${horas > 1 ? "s" : ""}`
    } else {
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60))
      return `${horas} hora${horas > 1 ? "s" : ""} e ${minutos} minuto${minutos > 1 ? "s" : ""}`
    }
  }

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    toast({
      title: "Código copiado!",
      description: "O código promocional foi copiado para a área de transferência",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Promoções Especiais</CardTitle>
          <CardDescription>Carregando promoções...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-muted rounded-md mb-3"></div>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (promocoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Promoções Especiais</CardTitle>
          <CardDescription>Fique de olho nas ofertas especiais desta loja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Não há promoções ativas no momento.</p>
            <p className="text-sm mt-1">Volte em breve para conferir as novidades!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Promoções Especiais</CardTitle>
        <CardDescription>Aproveite estas ofertas por tempo limitado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {promocoes.map((promocao) => (
            <Card
              key={promocao._id}
              className="overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-colors"
            >
              {promocao.imagem && (
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={promocao.imagem || "/placeholder.svg"}
                    alt={promocao.titulo}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-white font-bold px-3 py-1">
                      {formatarDesconto(promocao.desconto, promocao.tipoDesconto)} OFF
                    </Badge>
                  </div>
                </div>
              )}
              <CardHeader className={promocao.imagem ? "pt-3" : "pt-4"}>
                <CardTitle className="text-lg">{promocao.titulo}</CardTitle>
                {promocao.descricao && <CardDescription>{promocao.descricao}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    De {formatarData(promocao.dataInicio)} até {formatarData(promocao.dataFim)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Termina em: {calcularTempoRestante(promocao.dataFim)}</span>
                </div>
                {promocao.codigoPromocional && (
                  <div className="mt-4 pt-2 border-t border-border">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Código promocional:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-3 py-1 rounded font-mono text-sm">{promocao.codigoPromocional}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarCodigo(promocao.codigoPromocional || "")}
                      >
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full">Ver detalhes</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

