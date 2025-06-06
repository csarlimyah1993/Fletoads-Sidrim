import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getPlanoDoUsuario } from "@/lib/planos"
import type { Loja, Produto } from "@/types/loja"

export const dynamic = "force-dynamic"

// Função para buscar a loja pelo slug (nome ou ID)
async function getLojaBySlug(slug: string): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    let loja = null

    // Tentar buscar por ID
    try {
      if (ObjectId.isValid(slug)) {
        loja = await db.collection("lojas").findOne({ _id: new ObjectId(slug) })
      } else {
        // Se não for um ID válido, buscar por nome ou slug
        loja = await db.collection("lojas").findOne({
          $or: [{ nome: slug }, { slug: slug }, { nomeNormalizado: slug.toLowerCase().replace(/\s+/g, "-") }],
        })
      }
    } catch (error) {
      console.error("Erro ao buscar loja:", error)
      return null
    }

    if (!loja) return null

    // Imprimir os dados da loja para debug
    console.log("Dados da loja encontrada:", {
      _id: loja._id.toString(),
      nome: loja.nome,
      banner: loja.banner,
      logo: loja.logo,
      planoId: loja.planoId,
    })

    // Buscar o plano do usuário
    let usuario = null
    try {
      if (loja.usuarioId) {
        if (typeof loja.usuarioId === "string") {
          if (ObjectId.isValid(loja.usuarioId)) {
            usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(loja.usuarioId) })
          } else {
            usuario = await db.collection("usuarios").findOne({ _id: loja.usuarioId as any })
          }
        } else {
          usuario = await db.collection("usuarios").findOne({ _id: loja.usuarioId })
        }
      } else if (loja.userId) {
        if (typeof loja.userId === "string") {
          if (ObjectId.isValid(loja.userId)) {
            usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(loja.userId) })
          } else {
            usuario = await db.collection("usuarios").findOne({ _id: loja.userId as any })
          }
        } else {
          usuario = await db.collection("usuarios").findOne({ _id: loja.userId })
        }
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    }

    // Obter o plano do usuário
    const planoId = usuario?.plano || usuario?.metodosPagemento?.plano || "gratis"
    const plano = getPlanoDoUsuario(typeof planoId === "object" ? "gratis" : String(planoId))

    // Buscar produtos da loja
    const produtos = await db
      .collection("produtos")
      .find({ lojaId: loja._id.toString() })
      .limit(plano.vitrine) // Limitar pelo plano
      .toArray()

    // Garantir que todos os campos necessários estejam presentes
    const lojaCompleta: Loja = {
      ...loja,
      _id: loja._id.toString(),
      id: loja._id.toString(), // Add the id property here
      nome: loja.nome || "Loja",
      ativo: loja.ativo === true ? true : false, // Garantir que seja boolean
      produtos: produtos.map((p) => ({ ...p, _id: p._id.toString() })) as Produto[],
      plano: plano.nome,
      planoId: typeof planoId === "object" ? "gratis" : String(planoId),
      banner: loja.banner || "",
      logo: loja.logo || "",
    }

    return lojaCompleta
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  // Aguardar os parâmetros antes de usá-los
  const resolvedParams = await params
  const loja = await getLojaBySlug(resolvedParams.slug)

  if (!loja) {
    return {
      title: "Loja não encontrada",
      description: "A loja que você está procurando não existe ou não está disponível.",
    }
  }

  return {
    title: `${loja.nome} | FletoAds`,
    description: loja.descricao || `Conheça os produtos e serviços de ${loja.nome}`,
    openGraph: {
      title: loja.nome,
      description: loja.descricao,
      images: loja.logo ? [loja.logo] : [],
    },
  }
}

interface VitrinePageProps {
  params: Promise<{ slug: string }>
}

export default async function VitrinePage(props: VitrinePageProps) {
  // Properly await the params
  const { slug } = await props.params

  // Redirecionar para a nova rota
  redirect(`/vitrines/${slug}`)
}
