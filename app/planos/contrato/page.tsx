"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, Check } from "lucide-react"

export default function ContratoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [assinaturaId, setAssinaturaId] = useState<string>("")
  const [contratoAceito, setContratoAceito] = useState(false)
  const [contratoConteudo, setContratoConteudo] = useState<string>("")
  const [assinaturaCompleta, setAssinaturaCompleta] = useState(false)

  // Obter o ID da assinatura da URL
  useEffect(() => {
    const id = searchParams.get("id")
    if (id) {
      setAssinaturaId(id)
      // Carregar os detalhes da assinatura
      carregarDetalhesAssinatura(id)
    } else {
      router.push("/planos")
    }
  }, [searchParams, router])

  // Função para carregar os detalhes da assinatura
  const carregarDetalhesAssinatura = async (id: string) => {
    try {
      // Aqui você carregaria os detalhes da assinatura da API
      // Por enquanto, vamos apenas simular o carregamento do contrato

      // Simular o carregamento do contrato
      setIsLoading(true)

      // Carregar o conteúdo do contrato (simulado)
      setTimeout(() => {
        setContratoConteudo(`
TERMO DE USO E CONTRATO DE LICENÇA DE SOFTWARE FLETOADS

Este Termo de Uso e Contrato de Licença de Software ("Contrato") é celebrado entre a FletoAds, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede na Cidade de [Cidade], Estado de [Estado], doravante denominada "LICENCIANTE", e a pessoa física ou jurídica, doravante denominada "LICENCIADO", que aceitar este Contrato.

1. OBJETO

1.1. O presente Contrato tem por objeto a concessão, pela LICENCIANTE ao LICENCIADO, de uma licença de uso do software FletoAds ("Software"), em caráter não exclusivo e intransferível, para uso em conformidade com as condições estabelecidas neste Contrato.

1.2. O Software FletoAds é uma plataforma de criação, gestão e distribuição de panfletos digitais, que permite ao LICENCIADO criar, editar, gerenciar e distribuir panfletos digitais para seus clientes.

2. PLANOS DE ASSINATURA

2.1. O LICENCIADO poderá escolher entre os seguintes planos de assinatura:

a) Plano Gratuito: Limitado a 5 panfletos por mês, 50 clientes cadastrados e 2 campanhas ativas.
b) Plano Básico: Limitado a 20 panfletos por mês, 200 clientes cadastrados e 5 campanhas ativas.
c) Plano Profissional: Limitado a 100 panfletos por mês, 1000 clientes cadastrados e 20 campanhas ativas.
d) Plano Empresarial: Panfletos, clientes e campanhas ilimitados.

2.2. Os valores dos planos de assinatura estão disponíveis no site da LICENCIANTE e podem ser alterados mediante aviso prévio de 30 (trinta) dias.

3. PAGAMENTO

3.1. O LICENCIADO deverá efetuar o pagamento da assinatura de acordo com o plano escolhido, nas datas e formas estabelecidas pela LICENCIANTE.

3.2. Em caso de atraso no pagamento, a LICENCIANTE poderá suspender o acesso do LICENCIADO ao Software até a regularização do pagamento.

4. PRAZO

4.1. O presente Contrato vigorará por prazo indeterminado, podendo ser rescindido por qualquer das partes, a qualquer tempo, mediante aviso prévio de 30 (trinta) dias.

5. OBRIGAÇÕES DO LICENCIADO

5.1. O LICENCIADO obriga-se a:

a) Utilizar o Software de acordo com as instruções fornecidas pela LICENCIANTE;
b) Não ceder, sublicenciar, vender, arrendar, dar em locação ou em garantia, ou, de qualquer outra forma, transferir, total ou parcialmente, o Software objeto deste Contrato;
c) Não modificar as características do Software;
d) Não utilizar o Software para fins ilícitos ou que violem direitos de terceiros;
e) Manter em sigilo todas as informações confidenciais relacionadas ao Software.

6. SUPORTE TÉCNICO

6.1. A LICENCIANTE fornecerá suporte técnico ao LICENCIADO, de acordo com o plano de assinatura contratado.

7. PROPRIEDADE INTELECTUAL

7.1. O Software, objeto deste Contrato, é de propriedade exclusiva da LICENCIANTE, sendo protegido pelas leis de direitos autorais e de propriedade industrial.

8. LIMITAÇÃO DE RESPONSABILIDADE

8.1. A LICENCIANTE não será responsável por quaisquer danos indiretos, incidentais, consequenciais, punitivos ou especiais, incluindo, mas não se limitando a, perda de dados, interrupção de negócios ou perda de lucros.

9. DISPOSIÇÕES GERAIS

9.1. Este Contrato constitui o acordo integral entre as partes com relação ao objeto aqui tratado, substituindo todos os acordos anteriores, verbais ou escritos.

9.2. Se qualquer disposição deste Contrato for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.

9.3. Este Contrato será regido e interpretado de acordo com as leis da República Federativa do Brasil.

10. FORO

10.1. As partes elegem o foro da Comarca de [Cidade], Estado de [Estado], para dirimir quaisquer dúvidas ou controvérsias oriundas deste Contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

Ao clicar em "Aceito os Termos do Contrato", o LICENCIADO declara ter lido, compreendido e aceito todos os termos e condições deste Contrato.
        `)
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Erro ao carregar detalhes da assinatura:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os detalhes da assinatura.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Função para baixar o contrato
  const downloadContrato = () => {
    const element = document.createElement("a")
    const file = new Blob([contratoConteudo], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "contrato_fletoads.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Função para assinar o contrato
  const assinarContrato = async () => {
    if (!contratoAceito) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos do contrato para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Enviar a assinatura para a API
      const response = await fetch("/api/planos/assinar-contrato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assinaturaId,
          aceito: true,
          dataAceite: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao assinar contrato")
      }

      // Simular o processamento da assinatura
      setTimeout(() => {
        setAssinaturaCompleta(true)
        setIsLoading(false)

        toast({
          title: "Sucesso!",
          description: "Contrato assinado com sucesso. Seu plano foi ativado.",
        })
      }, 2000)
    } catch (error) {
      console.error("Erro ao assinar contrato:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao assinar o contrato. Tente novamente.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Contrato de Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Leia atentamente e aceite os termos do contrato para ativar seu plano
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Termo de Uso e Contrato de Licença</CardTitle>
            <CardDescription>
              Este documento estabelece os termos e condições para uso do software FletoAds
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : assinaturaCompleta ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Assinatura Concluída!</h3>
                <p className="text-center text-muted-foreground">
                  Seu plano foi ativado com sucesso. Você já pode começar a aproveitar todos os recursos.
                </p>
                <Button onClick={() => router.push("/dashboard")} className="mt-4">
                  Ir para o Dashboard
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto whitespace-pre-line mb-6">
                  {contratoConteudo}
                </div>

                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={downloadContrato}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Contrato
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="termos"
                    checked={contratoAceito}
                    onCheckedChange={(checked) => setContratoAceito(checked as boolean)}
                  />
                  <Label htmlFor="termos" className="font-medium">
                    Eu li e aceito os termos do contrato
                  </Label>
                </div>
              </>
            )}
          </CardContent>
          {!isLoading && !assinaturaCompleta && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/planos")}>
                Voltar
              </Button>
              <Button onClick={assinarContrato} disabled={!contratoAceito || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Assinar Contrato"
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}

