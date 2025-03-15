import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import { redirect } from "next/navigation"
import PerfilLojaClient from "./perfil-loja-client"

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/login")
  }

  await connectToDatabase()
  let loja = null

  try {
    loja = await Loja.findOne({ proprietarioId: session.user.id })
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
  }

  // Se não encontrou loja, tenta criar uma padrão
  if (!loja) {
    try {
      // Criar loja padrão
      loja = new Loja({
        proprietarioId: session.user.id,
        nome: "Minha Loja",
        status: "pendente",
        cnpj: "",
        categorias: [],
        descricao: "",
        logo: "",
        banner: "",
        endereco: {
          cep: "00000-000",
          rua: "Rua Exemplo",
          numero: "123",
          complemento: "",
          bairro: "Centro",
          cidade: "Cidade Exemplo",
          estado: "UF",
        },
        contato: {
          telefone: "(00) 0000-0000",
          whatsapp: "",
          email: session.user.email || "exemplo@email.com",
          site: "",
          instagram: "",
          facebook: "",
        },
        horarioFuncionamento: {
          segunda: "Fechado",
          terca: "08:00 - 18:00",
          quarta: "08:00 - 18:00",
          quinta: "08:00 - 18:00",
          sexta: "08:00 - 18:00",
          sabado: "08:00 - 13:00",
          domingo: "Fechado",
        },
        dataCriacao: new Date(),
      })

      await loja.save()
      console.log("Loja padrão criada com sucesso")
    } catch (error) {
      console.error("Erro ao criar loja padrão:", error)
    }
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
        <PerfilLojaClient initialLoja={JSON.parse(JSON.stringify(loja))} />
      </Suspense>
    </div>
  )
}

