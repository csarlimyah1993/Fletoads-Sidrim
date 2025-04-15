import { Suspense } from "react"
import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import VitrinePublica from "@/components/vitrine/vitrine-publica"
import { ObjectId } from "mongodb"

// Definição correta do tipo para Next.js 15
interface VitrinePageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function VitrinePage(props: VitrinePageProps) {
  // Aguardar os parâmetros corretamente
  const params = props.params instanceof Promise ? await props.params : props.params
  const vitrineId = params.id

  if (!vitrineId) {
    notFound()
  }

  // Verificar se a vitrine existe
  const { db } = await connectToDatabase()

  // Tentar converter para ObjectId se for um ID válido
  let objectId = null
  try {
    if (ObjectId.isValid(vitrineId)) {
      objectId = new ObjectId(vitrineId)
    }
  } catch (error) {
    console.log("ID não é um ObjectId válido, continuando com busca por string")
  }

  // Buscar a loja com várias condições
  const loja = await db.collection("lojas").findOne({
    $or: [...(objectId ? [{ _id: objectId }] : []), { "vitrine.slug": vitrineId }, { vitrineId: vitrineId }],
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
      <VitrinePublica id={vitrineId} />
    </Suspense>
  )
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata(props: VitrinePageProps) {
  // Aguardar os parâmetros corretamente
  const params = props.params instanceof Promise ? await props.params : props.params
  const vitrineId = params.id

  if (!vitrineId) {
    return {
      title: "Vitrine não encontrada",
      description: "A vitrine solicitada não foi encontrada.",
    }
  }

  try {
    const { db } = await connectToDatabase()

    // Tentar converter para ObjectId se for um ID válido
    let objectId = null
    try {
      if (ObjectId.isValid(vitrineId)) {
        objectId = new ObjectId(vitrineId)
      }
    } catch (error) {
      console.log("ID não é um ObjectId válido, continuando com busca por string")
    }

    // Buscar a loja com várias condições
    const loja = await db.collection("lojas").findOne({
      $or: [...(objectId ? [{ _id: objectId }] : []), { "vitrine.slug": vitrineId }, { vitrineId: vitrineId }],
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
