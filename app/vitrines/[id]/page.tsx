import { Suspense } from "react"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import VitrinePublica from "@/components/vitrine/vitrine-publica"

interface VitrinePageProps {
  params: {
    slug: string
  }
}

export default async function VitrinePage({ params }: VitrinePageProps) {
  const { slug } = params

  // Verificar se a vitrine existe
  const { db } = await connectToDatabase()
  const loja = await db.collection("lojas").findOne({
    $or: [{ "vitrine.slug": slug }, { vitrineId: slug }],
  })

  if (!loja) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Carregando vitrine...</p>
          </div>
        </div>
      }
    >
      <VitrinePublica slug={slug} />
    </Suspense>
  )
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata({ params }: VitrinePageProps) {
  const { slug } = params

  try {
    const { db } = await connectToDatabase()
    const loja = await db.collection("lojas").findOne({
      $or: [{ "vitrine.slug": slug }, { vitrineId: slug }],
    })

    if (!loja) {
      return {
        title: "Vitrine não encontrada",
        description: "A vitrine solicitada não foi encontrada.",
      }
    }

    const vitrineConfig = loja.vitrine || {}

    return {
      title: vitrineConfig.metaTitulo || loja.nome || "Vitrine Online",
      description: vitrineConfig.metaDescricao || loja.descricao || `Conheça os produtos e serviços de ${loja.nome}`,
      openGraph: {
        title: vitrineConfig.metaTitulo || loja.nome || "Vitrine Online",
        description: vitrineConfig.metaDescricao || loja.descricao || `Conheça os produtos e serviços de ${loja.nome}`,
        images: [
          {
            url: vitrineConfig.bannerPrincipal || loja.banner || loja.logo || "/placeholder.svg",
            width: 1200,
            height: 630,
            alt: loja.nome,
          },
        ],
      },
    }
  } catch (error) {
    console.error("Erro ao gerar metadados:", error)
    return {
      title: "Vitrine Online",
      description: "Conheça nossos produtos e serviços",
    }
  }
}
