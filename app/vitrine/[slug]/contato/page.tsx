import { notFound } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { VitrineHeader } from "@/components/vitrine/vitrine-header"
import { VitrineFooter } from "@/components/vitrine/vitrine-footer"
import { getPlanoDoUsuario } from "@/lib/planos"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { MapPin, Phone, Mail, Globe, Clock, Instagram, Facebook } from "lucide-react"
import { createIdFilter } from "@/lib/utils/mongodb-helpers"
import type { Loja } from "@/types/loja"

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
    console.log("Dados da loja encontrada (contato):", {
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

    // Garantir que todos os campos necessários estejam presentes
    const lojaCompleta: Loja = {
      ...loja,
      _id: loja._id.toString(),
      nome: loja.nome || "Loja",
      ativo: loja.ativo !== undefined ? loja.ativo : true,
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
    title: `Contato | ${loja.nome}`,
    description: `Entre em contato com ${loja.nome}`,
    openGraph: {
      title: `Contato | ${loja.nome}`,
      description: `Entre em contato com ${loja.nome}`,
      images: loja.logo ? [loja.logo] : [],
    },
  }
}

export default async function ContatoPage({ params }: { params: { slug: string } }) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <VitrineHeader loja={loja} isOwner={isOwner} />

      <main className="flex-1 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Entre em Contato</h1>

          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8 dark:border dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Informações de Contato</h2>

                {loja.endereco && (
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Endereço</p>
                      <p className="text-gray-600 dark:text-gray-400">{loja.endereco}</p>
                    </div>
                  </div>
                )}

                {loja.telefone && (
                  <div className="flex items-start gap-3">
                    <Phone
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Telefone</p>
                      <p className="text-gray-600 dark:text-gray-400">{loja.telefone}</p>
                    </div>
                  </div>
                )}

                {loja.email && (
                  <div className="flex items-start gap-3">
                    <Mail
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Email</p>
                      <p className="text-gray-600 dark:text-gray-400">{loja.email}</p>
                    </div>
                  </div>
                )}

                {loja.website && (
                  <div className="flex items-start gap-3">
                    <Globe
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Website</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <a href={loja.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {loja.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {loja.horarioFuncionamento && (
                  <div className="flex items-start gap-3">
                    <Clock
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Horário de Funcionamento</p>
                      <p className="text-gray-600 dark:text-gray-400">{loja.horarioFuncionamento}</p>
                    </div>
                  </div>
                )}

                {loja.instagram && (
                  <div className="flex items-start gap-3">
                    <Instagram
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Instagram</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <a
                          href={`https://instagram.com/${loja.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {loja.instagram}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                {loja.facebook && (
                  <div className="flex items-start gap-3">
                    <Facebook
                      className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                      style={{ color: corPrimaria }}
                    />
                    <div>
                      <p className="font-medium dark:text-white">Facebook</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <a href={loja.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {loja.facebook}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Envie uma Mensagem</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assunto"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Assunto
                    </label>
                    <input
                      type="text"
                      id="assunto"
                      name="assunto"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="mensagem"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VitrineFooter loja={loja} />
    </div>
  )
}

