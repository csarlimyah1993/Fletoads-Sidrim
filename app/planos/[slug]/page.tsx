import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanoDetalhes } from "@/components/planos/plano-detalhes"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

interface Plano {
  _id: string
  nome: string
  slug: string
  preco: number
  descricao: string
  recursos: string[]
  popular?: boolean
  ativo: boolean
  limitacoes: {
    produtos: number
    lojas: number
    panfletos: number
    promocoes: number
    whatsapp: number
  }
  detalhes?: string
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const unwrappedParams = await params
    await connectToDatabase()

    const Plano =
      mongoose.models.Plano ||
      mongoose.model(
        "Plano",
        new mongoose.Schema({
          nome: String,
          slug: String,
          preco: Number,
          descricao: String,
          recursos: [String],
          popular: Boolean,
          ativo: Boolean,
          limitacoes: {
            produtos: Number,
            lojas: Number,
            panfletos: Number,
            promocoes: Number,
            whatsapp: Number,
          },
        }),
      )

    const plano = await Plano.findOne({ slug: unwrappedParams.slug })

    if (!plano) {
      return {
        title: "Plano não encontrado - FletoAds",
        description: "O plano solicitado não foi encontrado.",
      }
    }

    return {
      title: `${plano.nome} - FletoAds`,
      description: plano.descricao,
    }
  } catch (error) {
    console.error("Error fetching plan for metadata:", error)
    return {
      title: "Planos - FletoAds",
      description: "Conheça nossos planos e escolha o ideal para o seu negócio.",
    }
  }
}

// Add detailed descriptions for each plan
const planoDetalhes: Record<string, string> = {
  gratis:
    "O plano gratuito do FletoAds oferece uma introdução às funcionalidades básicas da plataforma. Com ele, você pode criar uma vitrine virtual com até 10 produtos e utilizar a sinalização visual para destacar seu negócio. É perfeito para quem está começando e quer experimentar a plataforma antes de investir em um plano pago.",
  start:
    "O plano Start é ideal para pequenos negócios que estão começando sua jornada digital. Com ele, você tem acesso a uma integração com WhatsApp, assistente virtual básico com IA, CRM para gestão de clientes, vitrine virtual com até 30 produtos, 20 panfletos digitais, 5 promoções em destaque, localização no mapa interativo, notificações de pesquisa, identificação de clientes próximos e sinalização visual. Tudo isso por apenas R$ 297,00 por mês.",
  basico:
    "O plano Básico é o mais popular entre nossos clientes. Ele oferece uma integração com WhatsApp, assistente virtual básico com IA, CRM para gestão de clientes, 30 panfletos digitais, 10 promoções em destaque, localização no mapa interativo, notificações de pesquisa, identificação de clientes próximos e sinalização visual. É a escolha ideal para negócios que buscam uma presença digital efetiva com um investimento acessível de R$ 799,00 por mês.",
  completo:
    "O plano Completo oferece uma solução abrangente para negócios que desejam maximizar sua presença online. Além de todos os recursos do plano Básico, ele inclui um Tour Virtual 360° básico, permitindo que seus clientes explorem seu estabelecimento virtualmente. Você também tem acesso a uma vitrine virtual com até 60 produtos, 50 panfletos digitais e 20 promoções em destaque. Por R$ 1.599,00 por mês, é o plano ideal para negócios que buscam uma presença digital completa e imersiva.",
  premium:
    "O plano Premium é para negócios que buscam uma solução de alta qualidade com recursos avançados. Ele inclui um Tour Virtual 360° completo, 2 integrações com WhatsApp, assistente virtual completo com IA, CRM avançado, vitrine virtual com até 120 produtos, 100 panfletos digitais e 50 promoções em destaque. Além disso, você tem acesso a todos os recursos de localização e notificação. Por R$ 2.200,00 por mês, é a escolha ideal para negócios que desejam oferecer uma experiência digital premium aos seus clientes.",
  empresarial:
    "O plano Empresarial é nossa solução mais completa, projetada para grandes negócios e franquias. Ele oferece um Tour Virtual 360° premium, 4 integrações com WhatsApp, assistente virtual premium com IA, CRM empresarial, vitrine virtual com até 400 produtos, 200 panfletos digitais e 100 promoções em destaque. Com todos os recursos de localização e notificação incluídos, é a escolha ideal para empresas que buscam uma solução digital completa e escalável.",
}

export default async function PlanoPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const unwrappedParams = await params
    await connectToDatabase()

    const Plano =
      mongoose.models.Plano ||
      mongoose.model(
        "Plano",
        new mongoose.Schema({
          nome: String,
          slug: String,
          preco: Number,
          descricao: String,
          recursos: [String],
          popular: Boolean,
          ativo: Boolean,
          limitacoes: {
            produtos: Number,
            lojas: Number,
            panfletos: Number,
            promocoes: Number,
            whatsapp: Number,
          },
        }),
      )

    const plano = await Plano.findOne({ slug: unwrappedParams.slug })

    if (!plano || !plano.ativo) {
      notFound()
    }

    // Add detailed description to the plan
    const planoWithDetails = {
      ...plano.toObject(),
      detalhes: planoDetalhes[unwrappedParams.slug] || plano.descricao,
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4 dark:text-gray-300 dark:hover:text-white">
              <Link href="/planos">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar para todos os planos
              </Link>
            </Button>
          </div>

          <PlanoDetalhes plano={planoWithDetails} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching plan:", error)
    notFound()
  }
}
