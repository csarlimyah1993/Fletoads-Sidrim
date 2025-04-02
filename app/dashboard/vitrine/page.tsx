import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isConnected } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import { DatabaseErrorFallback } from "@/components/database-error-fallback"

export const metadata: Metadata = {
  title: "Vitrine | FletoAds",
  description: "Gerencie sua vitrine online",
}

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  let dbConnected = false

  try {
    // Verificar conexão com o banco de dados
    dbConnected = await isConnected()
  } catch (error) {
    console.error("Erro ao verificar conexão com o banco de dados:", error)
    return <DatabaseErrorFallback />
  }

  if (!dbConnected) {
    return <DatabaseErrorFallback />
  }

  try {
    // Buscar a loja do usuário
    const loja = await Loja.findOne({ usuarioId: session.user.id })

    if (!loja) {
      // Se o usuário não tem loja, redirecionar para criar
      redirect("/perfil-da-loja/criar")
    }

    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vitrine Online</h1>
            <p className="text-muted-foreground">Personalize e gerencie sua vitrine online</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/vitrines/${loja._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Visualizar Vitrine
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informações da Vitrine</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Link da Vitrine</h3>
                  <p className="text-sm text-muted-foreground">
                    <a
                      href={`/vitrines/${loja._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {`${process.env.NEXT_PUBLIC_APP_URL || "https://fletoads.vercel.app"}/vitrines/${loja._id}`}
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Nome da Loja</h3>
                  <p className="text-sm text-muted-foreground">{loja.nome || "Sem nome"}</p>
                </div>

                <div>
                  <h3 className="font-medium">Descrição</h3>
                  <p className="text-sm text-muted-foreground">{loja.descricao || "Sem descrição"}</p>
                </div>

                <div>
                  <h3 className="font-medium">Status</h3>
                  <p className="text-sm text-muted-foreground">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${loja.ativo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {loja.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t">
              <a
                href="/perfil-da-loja/editar"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Editar Vitrine
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar dados da vitrine:", error)
    return <DatabaseErrorFallback />
  }
}

