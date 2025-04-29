import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { VitrineForm } from "@/components/vitrine/vitrine-form"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { OfflineFallback } from "./offline-fallback"

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  try {
    // Buscar a loja diretamente do banco de dados
    const { db } = await connectToDatabase()

    // Buscar o usuário para verificar o lojaId e o plano
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    console.log("Usuário encontrado:", usuario ? "Sim" : "Não")
    console.log("LojaId do usuário:", usuario?.lojaId)
    console.log("Plano do usuário:", usuario?.plano)

    // Se o usuário tiver lojaId, buscar a loja diretamente pelo ID
    let loja = null
    if (usuario && usuario.lojaId) {
      try {
        console.log("Buscando loja pelo lojaId:", usuario.lojaId)
        loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        console.log("Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("Erro ao buscar loja pelo lojaId:", error)
      }
    }

    // Se não encontrou pelo lojaId, tentar pelos campos proprietarioId/usuarioId
    if (!loja) {
      console.log("Buscando loja por proprietarioId/usuarioId:", userId)
      loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
        ],
      })
      console.log("Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
    }

    if (!loja) {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Vitrine</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Você precisa criar uma loja antes de configurar sua vitrine.</p>
          </div>
          <Link href="/dashboard/perfil-da-loja">
            <Button>Criar Loja</Button>
          </Link>
        </div>
      )
    }

    // Adicionar informações do plano à loja
    if (usuario) {
      loja.plano = usuario.plano || loja.plano
      loja.proprietarioPlano = usuario.plano || loja.proprietarioPlano
    }

    // Serializar os dados para evitar erros de serialização
    const serializableLoja = JSON.parse(
      JSON.stringify({
        ...loja,
        _id: loja._id.toString(),
        dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
        dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
      }),
    )

    // Verificar se a loja já tem uma vitrine configurada
    // Usar o ID da loja para a URL da vitrine
    const vitrineUrl = `/vitrines/${loja._id}`

    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configurar Vitrine</h1>
          <Link href={vitrineUrl} target="_blank" passHref>
            <Button variant="outline" className="mt-2 md:mt-0 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Visualizar Vitrine
            </Button>
          </Link>
        </div>

        <VitrineForm loja={serializableLoja} />
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar dados da vitrine:", error)
    return <OfflineFallback />
  }
}
