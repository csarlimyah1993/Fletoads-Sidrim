import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { VitrineHeader } from "@/components/vitrine/vitrine-header"
import { VitrineProdutos } from "@/components/vitrine/vitrine-produtos"
import { VitrineInfo } from "@/components/vitrine/vitrine-info"
import { VitrineFooter } from "@/components/vitrine/vitrine-footer"
import { getPlanoDoUsuario } from "@/lib/planos"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag, Phone, MapPin, Calendar, Star } from "lucide-react"
import { createIdFilter } from "@/lib/utils/mongodb-helpers"
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
        loja = await db.collection("lojas").findOne(createIdFilter(slug))
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
            usuario = await db.collection("usuarios").findOne({ _id: loja.usuarioId })
          }
        } else {
          usuario = await db.collection("usuarios").findOne({ _id: loja.usuarioId })
        }
      } else if (loja.userId) {
        if (typeof loja.userId === "string") {
          if (ObjectId.isValid(loja.userId)) {
            usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(loja.userId) })
          } else {
            usuario = await db.collection("usuarios").findOne({ _id: loja.userId })
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
      nome: loja.nome || "Loja",
      ativo: loja.ativo !== undefined ? loja.ativo : true,
      produtos: produtos.map((p) => ({ ...p, _id: p._id.toString() })) as Produto[],
      plano,
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

export async function generateMetadata({ params }: { params: { slug: string } }) {
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

export default async function VitrinePage({ params }: { params: { slug: string } }) {
  // Aguardar os parâmetros antes de usá-los
  const resolvedParams = await params
  const loja = await getLojaBySlug(resolvedParams.slug)
  const session = await getServerSession(authOptions)

  if (!loja) {
    notFound()
  }

  // Garantir que ativo seja um booleano
  const isAtivo = loja.ativo === true

  if (!isAtivo) {
    notFound()
  }

  // Verificar se o usuário atual é o dono da loja
  let isOwner = false
  if (session?.user?.id) {
    const userId = session.user.id
    isOwner =
      (loja.usuarioId && (loja.usuarioId === userId || loja.usuarioId.toString() === userId)) ||
      (loja.userId && (loja.userId === userId || loja.userId.toString() === userId))
  }

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"

  // Verificar se há produtos
  const temProdutos = loja.produtos && loja.produtos.length > 0

  return (
    <div className="flex flex-col min-h-screen">
      <VitrineHeader loja={loja} isOwner={isOwner} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 dark:bg-gray-800 py-12 transition-colors duration-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">{loja.nome}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {loja.descricao || `Bem-vindo à ${loja.nome}. Estamos felizes em atendê-lo!`}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/vitrine/${loja._id}/produtos`}>
                    <Button className="flex items-center gap-2" style={{ backgroundColor: corPrimaria }}>
                      <ShoppingBag className="h-4 w-4" />
                      Ver Produtos
                    </Button>
                  </Link>
                  <Link href={`/vitrine/${loja._id}/contato`}>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 dark:border-gray-700 dark:text-gray-300"
                    >
                      <Phone className="h-4 w-4" />
                      Contato
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border dark:border-gray-700 w-full max-w-sm">
                <h3 className="font-medium mb-4 flex items-center gap-2 dark:text-white">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" style={{ color: corPrimaria }} />
                  Localização
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {loja.endereco || "Entre em contato para mais informações"}
                </p>

                <h3 className="font-medium mb-4 flex items-center gap-2 dark:text-white">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" style={{ color: corPrimaria }} />
                  Horário de Funcionamento
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {loja.horarioFuncionamento || "Entre em contato para mais informações"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Destaques ou Promoções */}
        {!temProdutos && (
          <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">Por que escolher {loja.nome}?</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Qualidade Garantida</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Oferecemos produtos de alta qualidade para nossos clientes.
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Variedade de Produtos</h3>
                  <p className="text-gray-600 dark:text-gray-400">Encontre tudo o que precisa em um só lugar.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 dark:text-white">Atendimento Personalizado</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Estamos sempre prontos para atender suas necessidades.
                  </p>
                </div>
              </div>

              <div className="text-center mt-10">
                <Link href={`/vitrine/${loja._id}/contato`}>
                  <Button className="px-6" style={{ backgroundColor: corPrimaria }}>
                    Entre em contato
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <VitrineInfo loja={loja} />

        {temProdutos && <VitrineProdutos loja={loja} produtos={loja.produtos || []} />}

        {/* CTA Section */}
        <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Não encontrou o que procura?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Entre em contato conosco para mais informações sobre nossos produtos e serviços.
            </p>
            <Link href={`/vitrine/${loja._id}/contato`}>
              <Button size="lg" className="px-8" style={{ backgroundColor: corPrimaria }}>
                Entre em contato
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <VitrineFooter loja={loja} />
    </div>
  )
}

