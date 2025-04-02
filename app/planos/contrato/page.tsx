"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { WhatsAppButton } from "@/components/whatsapp-button"

// Nomes dos planos
const nomesPlanos = {
  gratis: "Grátis",
  start: "Start",
  basico: "Básico",
  completo: "Completo",
  premium: "Premium",
  empresarial: "Empresarial",
}

export default function ContratoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [planoId, setPlanoId] = useState<string>(searchParams.get("plano") || "")
  const [periodo, setPeriodo] = useState<string>(searchParams.get("periodo") || "mensal")

  const handleAssinar = async () => {
    if (!aceitouTermos) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simular o processamento da assinatura
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Aqui você faria a chamada para a API para finalizar a assinatura
      // const response = await fetch("/api/planos/finalizar-assinatura", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ planoId, periodo }),
      // })
      // const data = await response.json()

      // Redirecionar para a página de sucesso
      toast({
        title: "Assinatura concluída!",
        description: `Seu plano ${nomesPlanos[planoId as keyof typeof nomesPlanos]} foi ativado com sucesso.`,
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao finalizar assinatura:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao finalizar a assinatura. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl">FletoAds</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planos/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para checkout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Termos e Condições
              </CardTitle>
              <CardDescription>
                Por favor, leia atentamente os termos e condições antes de finalizar sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="texto" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="texto">Texto</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                </TabsList>
                <TabsContent value="texto" className="border rounded-md p-4">
                  <div className="h-[500px] overflow-y-auto text-sm">
                    <h2 className="text-xl font-bold mb-4">TERMOS E CONDIÇÕES GERAIS DE USO</h2>
                    <p className="mb-4">
                      Os serviços da Plataforma "Fleto" são fornecidos pela RESZON – SERVIÇOS EM TECNOLOGIA E
                      DESENVOLVIMENTO DE SOFTWARE LTDA, inscrita no CNPJ nº 40.276.868/0001-33, titular da propriedade
                      intelectual sobre website, conteúdos e demais ativos relacionados aos serviços por ela prestados.
                    </p>

                    <h3 className="text-lg font-bold mt-6 mb-2">1 DAS DEFINIÇÕES</h3>
                    <p className="mb-2">
                      1.1 Para os efeitos deste instrumento, os vocábulos e expressões abaixo têm as seguintes
                      definições:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                      <li>
                        Lojista: Parceiro usuário da plataforma e suas funções, na condição de fornecedor e/ou prestador
                        do serviço e/ou produto divulgado, de acordo com o plano contratado;
                      </li>
                      <li>Consumidor final: a pessoa física que utiliza o produto e/ou serviço do parceiro Lojista;</li>
                      <li>Atualização de versão: É a disponibilização de novas versões do software;</li>
                      <li>Software/Plataforma(s): É a aplicação de autoria da RESZON;</li>
                      <li>Internet: É a rede mundial de computadores;</li>
                      <li>
                        Informações confidenciais: toda e qualquer informação verbal ou escrita, obtida direta ou
                        indiretamente pelas partes, em virtude do presente contrato e relativas a este;
                      </li>
                      <li>
                        Plano: oferta de serviços do produto de acordo com a grade de comercial dos respectivos
                        produtos.
                      </li>
                    </ul>

                    <h3 className="text-lg font-bold mt-6 mb-2">2 DO OBJETO</h3>
                    <p className="mb-2">
                      1.1 A plataforma visa permitir para o lojista o acesso aos serviços da RESZON – SERVIÇOS EM
                      TECNOLOGIA E DESENVOLVIMENTO DE SOFTWARE LTDA, inscrita no CNPJ nº 40.276.868/0001-33, mediante o
                      preenchimento do cadastro e a concordância expressa aos Termos e Condições de Uso e à Política de
                      Privacidade.
                    </p>
                    <p className="mb-4">
                      1.2 A plataforma caracteriza-se pela oferta da prestação dos seguintes serviços: Sistema de Gestão
                      de Conteúdo, Sistema de Gestão de Publicidade, Sistema de Ofertas de produtos e conteúdos de lojas
                      participantes e parceiros com inserções em mapas, marcos, com localização geográfica através de
                      GPS e Fotos.
                    </p>

                    <h3 className="text-lg font-bold mt-6 mb-2">3 DA ACEITAÇÃO</h3>
                    <p className="mb-2">
                      3.1 O presente Termo estabelece obrigações contratadas e conteúdos de livre e espontânea vontade,
                      por tempo indeterminado, entre a plataforma e as pessoas físicas ou jurídicas, na condição de
                      lojistas.
                    </p>
                    <p className="mb-2">
                      3.2 Ao utilizar a plataforma o usuário aceita integralmente as presentes normas e compromete-se a
                      observá-las, sob o risco de aplicação das penalidades cabíveis. Caso o Lojista não concorde com
                      qualquer condição aqui prevista, não deverá utilizar a Plataforma.
                    </p>
                    <p className="mb-4">
                      3.3 A aceitação do presente instrumento é imprescindível para o acesso e para a utilização de
                      quaisquer serviços fornecidos pela empresa. Caso não concorde com as disposições deste
                      instrumento, o usuário não deve utilizá-los.
                    </p>

                    {/* Continuar com o restante do texto do contrato... */}
                    <h3 className="text-lg font-bold mt-6 mb-2">4 DO ACESSO DOS LOJISTAS</h3>
                    <p className="mb-4">
                      4.1 Serão utilizadas todas as soluções técnicas à disposição da RESZON – SERVIÇOS EM TECNOLOGIA E
                      DESENVOLVIMENTO DE SOFTWARE LTDA para permitir o acesso aos serviços. No entanto, a navegação na
                      plataforma ou em alguma de suas páginas poderá ser interrompida, limitada ou suspensa para
                      atualizações, modificações ou qualquer ação necessária ao seu bom funcionamento.
                    </p>

                    {/* Texto truncado para brevidade */}
                    <p className="text-sm text-muted-foreground mt-6">
                      O texto completo do contrato está disponível para download nos formatos PDF e DOCX.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="pdf">
                  <div className="border rounded-md p-4 h-[500px]">
                    <iframe
                      src="/assets/termos_de_uso_lojista.pdf"
                      className="w-full h-full"
                      title="Termos e Condições"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-center mt-6">
                <Button variant="outline" className="flex items-center" asChild>
                  <a href="/assets/termos_de_uso_lojista.docx" download>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar contrato em Word (DOCX)
                  </a>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="aceite-termos"
                  checked={aceitouTermos}
                  onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                />
                <label
                  htmlFor="aceite-termos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Li e aceito os termos e condições acima e a política de privacidade
                </label>
              </div>
            </CardFooter>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/planos/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button onClick={handleAssinar} disabled={isLoading || !aceitouTermos}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Assinar e Ativar
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}

