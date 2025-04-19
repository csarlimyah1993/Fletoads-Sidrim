import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase, ensureCollectionsExist } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getLoja(userId: string) {
  try {
    console.log("ID do usuário na sessão:", userId)

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()
    console.log("Conectado ao banco de dados")

    // Garantir que as coleções existam
    await ensureCollectionsExist()

    console.log("Buscando loja para usuário:", userId)

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({ proprietarioId: userId })

    if (!loja) {
      console.log("Nenhuma loja encontrada para o usuário:", userId)
    } else {
      console.log("Loja encontrada:", loja._id)
    }

    return loja
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  try {
    const loja = await getLoja(session.user.id)

    if (!loja) {
      // Se não encontrou loja, mostrar mensagem e link para criar
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Perfil da Loja</h2>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Loja não encontrada</h3>
            <p className="mb-6">
              Você ainda não possui uma loja cadastrada. Clique no botão abaixo para criar sua loja.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/init-loja-vitrine">Criar Loja e Vitrine</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Voltar para o Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Perfil da Loja</h2>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Informações Básicas</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Nome:</span> {loja.nome}
                  </p>
                  <p>
                    <span className="font-medium">CNPJ:</span> {loja.cnpj || "Não informado"}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {loja.status || "Ativo"}
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Endereço</h3>
                <div className="space-y-2">
                  {loja.endereco ? (
                    <>
                      <p>
                        <span className="font-medium">Rua:</span> {loja.endereco.rua}
                      </p>
                      <p>
                        <span className="font-medium">Número:</span> {loja.endereco.numero}
                      </p>
                      <p>
                        <span className="font-medium">Bairro:</span> {loja.endereco.bairro}
                      </p>
                      <p>
                        <span className="font-medium">Cidade:</span> {loja.endereco.cidade}
                      </p>
                      <p>
                        <span className="font-medium">Estado:</span> {loja.endereco.estado}
                      </p>
                    </>
                  ) : (
                    <p>Endereço não informado</p>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-4">Contato</h3>
                <div className="space-y-2">
                  {loja.contato ? (
                    <>
                      <p>
                        <span className="font-medium">Email:</span> {loja.contato.email}
                      </p>
                      <p>
                        <span className="font-medium">Telefone:</span> {loja.contato.telefone || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium">WhatsApp:</span> {loja.contato.whatsapp || "Não informado"}
                      </p>
                    </>
                  ) : (
                    <p>Contato não informado</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <a
                href="/perfil-da-loja/editar"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Editar Perfil
              </a>
            </div>
          </div>
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar perfil da loja:", error)
    return (
      <div className="flex-1 p-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <h3 className="font-medium">Erro ao carregar dados</h3>
          <p>Ocorreu um erro ao carregar os dados do perfil. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    )
  }
}
