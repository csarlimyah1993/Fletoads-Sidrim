import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import { LojaPerfilContent } from "@/components/perfil/loja-perfil-content"

// Interface para mapear o documento do MongoDB para o tipo Loja
interface LojaDocument {
  _id: mongoose.Types.ObjectId
  nome?: string
  descricao?: string
  logo?: string
  banner?: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  contato?: {
    telefone?: string
    email?: string
    whatsapp?: string
    site?: string
  }
  horarioFuncionamento?: Record<
    string,
    {
      abertura: string
      fechamento: string
      open: boolean
    }
  >
  usuarioId?: string
}

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Connect to database
  await connectToDatabase()

  // Check if user has a store profile
  let hasStore = false
  let lojaDoc: LojaDocument | null = null

  try {
    // Get database connection
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Database connection not established")
    }

    const db = connection.db

    // Find user
    const usuario = await db.collection("usuarios").findOne({
      email: session.user.email,
    })

    if (!usuario) {
      throw new Error("User not found")
    }

    // Check if user has a store
    lojaDoc = (await db.collection("lojas").findOne({
      usuarioId: usuario._id.toString(),
    })) as LojaDocument | null

    hasStore = !!lojaDoc
  } catch (error) {
    console.error("Error checking store profile:", error)
  }

  // Converter o documento do MongoDB para o formato esperado pelo componente
  const loja = lojaDoc
    ? {
        _id: lojaDoc._id.toString(), // Converter ObjectId para string
        nome: lojaDoc.nome,
        descricao: lojaDoc.descricao,
        logo: lojaDoc.logo,
        banner: lojaDoc.banner,
        endereco: lojaDoc.endereco,
        contato: lojaDoc.contato,
        horarioFuncionamento: lojaDoc.horarioFuncionamento,
      }
    : null

  // Redirect based on whether user has a store or not
  if (hasStore) {
    return (
      <div className="container mx-auto py-6">
        <LojaPerfilContent
          loja={loja}
          plano={{}}
          uso={{
            panfletos: 0,
            produtos: 0,
            clientes: 0,
            integracoes: 0,
          }}
          vitrine={null}
        />
      </div>
    )
  } else {
    redirect("/dashboard/perfil-da-loja/criar")
  }

  // This will never be reached due to redirects, but TypeScript requires a return
  return null
}
