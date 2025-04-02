"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Check,
  X,
  ArrowRight,
  Star,
  Phone,
  ShoppingCart,
  Zap,
  BarChart4,
  Users,
  Layout,
  Smartphone,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { WhatsAppButton } from "@/components/whatsapp-button"

// Definição dos recursos por plano
const planos = [
  {
    id: "gratis",
    nome: "Grátis",
    preco: "Grátis",
    popular: false,
    recursos: [
      { nome: "10 produtos na vitrine", disponivel: true },
      { nome: "Personalização da vitrine", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "2 layouts de vitrine", disponivel: true },
      { nome: "3 widgets", disponivel: true },
      { nome: "Sem animações", disponivel: false },
      { nome: "Fonte padrão", disponivel: true },
      { nome: "Sem panfletos digitais", disponivel: false },
      { nome: "Sem promoções em destaque", disponivel: false },
      { nome: "1 imagem(ns) por produto", disponivel: true },
      { nome: "Sem integração WhatsApp", disponivel: false },
      { nome: "Sem Tour Virtual", disponivel: false },
    ],
    botao: "Plano Atual",
    cor: "bg-gray-100 dark:bg-gray-800",
    destaque: false,
  },
  {
    id: "start",
    nome: "Start",
    preco: "R$ 297,00/mês",
    popular: false,
    recursos: [
      { nome: "30 produtos na vitrine", disponivel: true },
      { nome: "Personalização da vitrine (avançada)", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "4 layouts de vitrine", disponivel: true },
      { nome: "5 widgets", disponivel: true },
      { nome: "Sem animações", disponivel: false },
      { nome: "Personalização de fontes", disponivel: true },
      { nome: "20 panfletos digitais", disponivel: true },
      { nome: "5 promoções em destaque", disponivel: true },
      { nome: "2 imagem(ns) por produto", disponivel: true },
      { nome: "1 conta WhatsApp", disponivel: true },
      { nome: "Sem Tour Virtual", disponivel: false },
    ],
    botao: "Escolher Plano",
    cor: "bg-blue-50 dark:bg-blue-950",
    destaque: false,
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 799,00/mês",
    popular: true,
    recursos: [
      { nome: "Sem vitrine web", disponivel: false },
      { nome: "Personalização da vitrine (avançada)", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "4 layouts de vitrine", disponivel: true },
      { nome: "5 widgets", disponivel: true },
      { nome: "Sem animações", disponivel: false },
      { nome: "Personalização de fontes", disponivel: true },
      { nome: "30 panfletos digitais", disponivel: true },
      { nome: "10 promoções em destaque", disponivel: true },
      { nome: "3 imagem(ns) por produto", disponivel: true },
      { nome: "1 conta WhatsApp", disponivel: true },
      { nome: "Sem Tour Virtual", disponivel: false },
    ],
    botao: "Escolher Plano",
    cor: "bg-primary/5",
    destaque: true,
  },
  {
    id: "completo",
    nome: "Completo",
    preco: "R$ 1599,00/mês",
    popular: false,
    recursos: [
      { nome: "60 produtos na vitrine", disponivel: true },
      { nome: "Personalização da vitrine (avançada)", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "6 layouts de vitrine", disponivel: true },
      { nome: "7 widgets", disponivel: true },
      { nome: "Animações e transições", disponivel: true },
      { nome: "Personalização de fontes", disponivel: true },
      { nome: "50 panfletos digitais", disponivel: true },
      { nome: "20 promoções em destaque", disponivel: true },
      { nome: "3 imagem(ns) por produto", disponivel: true },
      { nome: "1 conta WhatsApp", disponivel: true },
      { nome: "Tour Virtual Básico", disponivel: true },
    ],
    botao: "Escolher Plano",
    cor: "bg-green-50 dark:bg-green-950",
    destaque: false,
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$ 2200,00/mês",
    popular: false,
    recursos: [
      { nome: "120 produtos na vitrine", disponivel: true },
      { nome: "Personalização da vitrine (avançada)", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "8 layouts de vitrine", disponivel: true },
      { nome: "10 widgets", disponivel: true },
      { nome: "Animações e transições", disponivel: true },
      { nome: "Personalização de fontes", disponivel: true },
      { nome: "100 panfletos digitais", disponivel: true },
      { nome: "50 promoções em destaque", disponivel: true },
      { nome: "5 imagem(ns) por produto", disponivel: true },
      { nome: "2 contas WhatsApp", disponivel: true },
      { nome: "Tour Virtual Completo", disponivel: true },
    ],
    botao: "Escolher Plano",
    cor: "bg-purple-50 dark:bg-purple-950",
    destaque: false,
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    preco: "Personalizado",
    popular: false,
    recursos: [
      { nome: "400 produtos na vitrine", disponivel: true },
      { nome: "Personalização da vitrine (avançada)", disponivel: true },
      { nome: "Banner personalizado", disponivel: true },
      { nome: "12 layouts de vitrine", disponivel: true },
      { nome: "12 widgets", disponivel: true },
      { nome: "Animações e transições", disponivel: true },
      { nome: "Personalização de fontes", disponivel: true },
      { nome: "200 panfletos digitais", disponivel: true },
      { nome: "100 promoções em destaque", disponivel: true },
      { nome: "5 imagem(ns) por produto", disponivel: true },
      { nome: "4 contas WhatsApp", disponivel: true },
      { nome: "Tour Virtual Premium", disponivel: true },
    ],
    botao: "Entre em contato",
    cor: "bg-amber-50 dark:bg-amber-950",
    destaque: false,
  },
]

// Benefícios do FletoAds
const beneficios = [
  {
    titulo: "Aumente suas vendas",
    descricao: "Crie panfletos digitais interativos que convertem visitantes em clientes.",
    icone: <ShoppingCart className="h-10 w-10 text-primary" />,
  },
  {
    titulo: "Economize tempo",
    descricao: "Automatize a criação e distribuição de seus materiais promocionais.",
    icone: <Zap className="h-10 w-10 text-primary" />,
  },
  {
    titulo: "Alcance mais clientes",
    descricao: "Distribua seus panfletos em múltiplos canais digitais simultaneamente.",
    icone: <Users className="h-10 w-10 text-primary" />,
  },
  {
    titulo: "Análise em tempo real",
    descricao: "Acompanhe o desempenho de suas campanhas com métricas detalhadas.",
    icone: <BarChart4 className="h-10 w-10 text-primary" />,
  },
]

// Recursos destacados
const recursosDestacados = [
  {
    titulo: "Vitrine Digital Personalizada",
    descricao: "Crie uma vitrine digital atraente e totalmente personalizada para seus produtos.",
    icone: <Layout className="h-12 w-12 text-primary" />,
  },
  {
    titulo: "Panfletos Digitais Interativos",
    descricao: "Transforme seus panfletos tradicionais em experiências digitais interativas.",
    icone: <Smartphone className="h-12 w-12 text-primary" />,
  },
  {
    titulo: "Promoções em Destaque",
    descricao: "Destaque suas melhores ofertas e aumente a conversão de vendas.",
    icone: <Gift className="h-12 w-12 text-primary" />,
  },
]

// Depoimentos de clientes
const depoimentos = [
  {
    nome: "Carlos Silva",
    empresa: "Supermercado Bom Preço",
    texto: "O FletoAds revolucionou nossa forma de divulgar ofertas. Aumentamos nossas vendas em 35% no primeiro mês!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    nome: "Ana Oliveira",
    empresa: "Farmácia Saúde Total",
    texto:
      "A facilidade de criar panfletos digitais e a integração com WhatsApp nos ajudou a alcançar muito mais clientes.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    nome: "Roberto Mendes",
    empresa: "Magazine Eletrônicos",
    texto: "O tour virtual trouxe uma nova dimensão para nossa loja online. Os clientes adoram a experiência imersiva!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

// Perguntas frequentes
const faq = [
  {
    pergunta: "Como funciona o período de teste?",
    resposta:
      "Oferecemos 14 dias de teste gratuito em qualquer plano. Você pode experimentar todos os recursos sem compromisso e decidir se o FletoAds é a solução ideal para o seu negócio.",
  },
  {
    pergunta: "Posso mudar de plano a qualquer momento?",
    resposta:
      "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente e o valor é ajustado proporcionalmente.",
  },
  {
    pergunta: "Como funciona o suporte técnico?",
    resposta:
      "Todos os planos incluem suporte por email. Os planos pagos também oferecem suporte por chat e os planos Premium e Empresarial contam com suporte telefônico prioritário.",
  },
  {
    pergunta: "Preciso ter conhecimentos técnicos para usar o FletoAds?",
    resposta:
      "Não! O FletoAds foi desenvolvido para ser intuitivo e fácil de usar. Nossa interface drag-and-drop permite criar panfletos digitais profissionais sem conhecimento técnico.",
  },
  {
    pergunta: "Como funciona a integração com WhatsApp?",
    resposta:
      "A integração permite enviar seus panfletos digitais diretamente para seus clientes via WhatsApp, além de automatizar respostas e coletar dados de interação.",
  },
  {
    pergunta: "O que é o Tour Virtual?",
    resposta:
      "O Tour Virtual permite criar uma experiência 3D interativa da sua loja ou estabelecimento, permitindo que clientes explorem seu espaço virtualmente antes de visitá-lo fisicamente.",
  },
]

// Estatísticas
const estatisticas = [
  { numero: "500+", texto: "Empresas utilizando" },
  { numero: "10.000+", texto: "Panfletos criados" },
  { numero: "2M+", texto: "Visualizações mensais" },
  { numero: "35%", texto: "Aumento médio em vendas" },
]

export default function PlanosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null)
  const [periodoFaturamento, setPeriodoFaturamento] = useState<"mensal" | "anual">("mensal")

  const handleSelectPlan = (planoId: string) => {
    setPlanoSelecionado(planoId)

    // Se for o plano gratuito, apenas mostra uma mensagem
    if (planoId === "gratis") {
      toast({
        title: "Plano Gratuito",
        description: "Você já está no plano gratuito. Não é necessário fazer nada.",
      })
      return
    }

    // Se for o plano empresarial, redireciona para WhatsApp
    if (planoId === "empresarial") {
      const phoneNumber = "+92992210808"
      const message = "Olá! Estou interessado no plano Empresarial do FletoAds."
      const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
      return
    }

    // Redireciona para a página de checkout com o plano selecionado
    router.push(`/planos/checkout?plano=${planoId}&periodo=${periodoFaturamento}`)
  }

  const handleContactConsultant = () => {
    const phoneNumber = "+92992210808"
    const message = "Olá! Gostaria de falar com um consultor sobre o FletoAds."
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl">FletoAds</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
              Início
            </Link>
            <a href="#recursos" className="text-sm font-medium hover:underline underline-offset-4">
              Recursos
            </a>
            <Link href="/planos" className="text-sm font-medium text-primary hover:underline underline-offset-4">
              Planos
            </Link>
            <a href="#contato" className="text-sm font-medium hover:underline underline-offset-4">
              Contato
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="sm">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                Escolha o plano ideal para o seu negócio
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[800px]">
                Temos opções para todos os tamanhos de negócio, desde pequenos comércios até grandes empresas.
              </p>
            </div>

            {/* Tabs para período de faturamento */}
            <div className="flex justify-center mb-12">
              <Tabs
                defaultValue="mensal"
                value={periodoFaturamento}
                onValueChange={(value) => setPeriodoFaturamento(value as "mensal" | "anual")}
                className="w-[400px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mensal">Mensal</TabsTrigger>
                  <TabsTrigger value="anual">
                    Anual{" "}
                    <span className="ml-1.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                      -20%
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Cards de Planos - Aumentando a largura e melhorando o layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {planos.slice(0, 6).map((plano) => (
                <Card
                  key={plano.id}
                  className={`flex flex-col h-full ${plano.destaque ? "border-primary shadow-lg" : ""} ${plano.cor}`}
                >
                  <CardHeader className="pb-4">
                    {plano.popular && (
                      <div className="mb-2 flex justify-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-primary text-primary-foreground font-medium flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-current" /> Popular
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-xl">{plano.nome}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plano.preco}</span>
                      {plano.preco !== "Grátis" && plano.preco !== "Personalizado" && (
                        <span className="text-muted-foreground ml-1 text-sm">
                          /{periodoFaturamento === "mensal" ? "mês" : "ano"}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-2 text-sm">
                      {plano.recursos.map((recurso, index) => (
                        <li key={index} className="flex items-start">
                          {recurso.disponivel ? (
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                          )}
                          <span className={recurso.disponivel ? "" : "text-muted-foreground"}>{recurso.nome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleSelectPlan(plano.id)}
                      className="w-full"
                      variant={plano.destaque ? "default" : "outline"}
                    >
                      {plano.botao}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {estatisticas.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-4xl font-bold">{stat.numero}</div>
                  <div className="text-primary-foreground/80">{stat.texto}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recursos Destacados Section */}
        <section id="recursos" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter">Recursos Exclusivos</h2>
              <p className="text-muted-foreground md:text-lg max-w-[800px]">
                Conheça os recursos que fazem do FletoAds a plataforma ideal para sua empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {recursosDestacados.map((recurso, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">{recurso.icone}</div>
                  <h3 className="text-xl font-bold">{recurso.titulo}</h3>
                  <p className="text-muted-foreground">{recurso.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios Section */}
        <section className="py-20 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Por que escolher o FletoAds?</h2>
              <p className="text-muted-foreground md:text-lg max-w-[800px]">
                Nossa plataforma oferece tudo o que você precisa para criar, gerenciar e distribuir panfletos digitais
                eficientes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {beneficios.map((beneficio, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-3 p-6 bg-background rounded-lg shadow-sm"
                >
                  <div>{beneficio.icone}</div>
                  <h3 className="text-xl font-bold">{beneficio.titulo}</h3>
                  <p className="text-muted-foreground">{beneficio.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">O que nossos clientes dizem</h2>
              <p className="text-muted-foreground md:text-lg max-w-[800px]">
                Veja como o FletoAds tem ajudado empresas a aumentar suas vendas e alcançar mais clientes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {depoimentos.map((depoimento, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={depoimento.avatar || "/placeholder.svg"}
                          alt={depoimento.nome}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                        <div>
                          <h4 className="font-bold">{depoimento.nome}</h4>
                          <p className="text-sm text-muted-foreground">{depoimento.empresa}</p>
                        </div>
                      </div>
                      <p className="text-muted-foreground italic">"{depoimento.texto}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Perguntas Frequentes</h2>
              <p className="text-muted-foreground md:text-lg max-w-[800px]">
                Encontre respostas para as dúvidas mais comuns sobre o FletoAds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {faq.map((item, index) => (
                <div key={index} className="space-y-2 p-6 bg-background rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold">{item.pergunta}</h3>
                  <p className="text-muted-foreground">{item.resposta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contato" className="py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Pronto para transformar seu negócio com panfletos digitais?
              </h2>
              <p className="md:text-lg">
                Comece hoje mesmo com nosso plano gratuito ou escolha o plano que melhor atende às necessidades do seu
                negócio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/registro">
                    Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                  onClick={handleContactConsultant}
                >
                  <Phone className="mr-2 h-4 w-4" /> Falar com um Consultor
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Logo className="h-6 w-6" />
                <span className="font-bold">FletoAds</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transformando a maneira como empresas criam e distribuem panfletos digitais.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#recursos" className="text-muted-foreground hover:text-foreground">
                    Recursos
                  </a>
                </li>
                <li>
                  <Link href="/planos" className="text-muted-foreground hover:text-foreground">
                    Planos e Preços
                  </Link>
                </li>
                <li>
                  <Link href="/integracoes" className="text-muted-foreground hover:text-foreground">
                    Integrações
                  </Link>
                </li>
                <li>
                  <Link href="/casos-de-sucesso" className="text-muted-foreground hover:text-foreground">
                    Casos de Sucesso
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/sobre" className="text-muted-foreground hover:text-foreground">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/carreiras" className="text-muted-foreground hover:text-foreground">
                    Carreiras
                  </Link>
                </li>
                <li>
                  <a href="#contato" className="text-muted-foreground hover:text-foreground">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/termos" className="text-muted-foreground hover:text-foreground">
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-muted-foreground hover:text-foreground">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground hover:text-foreground">
                    Política de Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}

