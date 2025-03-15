import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import PerfilEditorClient from "./perfil-editor-client"

export const metadata = {
  title: "Editar Perfil",
  description: "Edite seu perfil e informações da loja",
}

export default async function PerfilEditorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { db } = await connectToDatabase()

  // Buscar dados do usuário
  const usuario = await db.collection("usuarios").findOne({
    email: session.user.email,
  })

  // Buscar dados da loja
  let loja = await db.collection("lojas").findOne({
    proprietarioId: usuario._id,
  })

  // Se não existir loja, criar uma padrão
  if (!loja) {
    try {
      // Criar loja padrão
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/loja/criar-padrao`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuarioId: usuario._id.toString() }),
      })

      if (!response.ok) {
        throw new Error("Falha ao criar loja padrão")
      }

      const data = await response.json()
      loja = data.loja
    } catch (error) {
      console.error("Erro ao criar loja padrão:", error)
      // Criar um objeto loja vazio para evitar erros
      loja = {
        nome: "",
        descricao: "",
        endereco: {
          rua: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
        },
        contato: {
          telefone: "",
          email: "",
          whatsapp: "",
          instagram: "",
          facebook: "",
          site: "",
        },
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Perfil</h1>
        <p className="text-muted-foreground">Atualize suas informações pessoais e da sua loja</p>
      </div>

      <PerfilEditorClient
        initialUsuario={JSON.parse(JSON.stringify(usuario))}
        initialLoja={JSON.parse(JSON.stringify(loja))}
      />
    </div>
  )
}

