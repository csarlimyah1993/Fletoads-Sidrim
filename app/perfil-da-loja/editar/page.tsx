import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import LojaPerfilFormServerWrapper from "@/components/perfil/loja-perfil-form-server-wrapper"

export default async function EditarPerfilLojaPage() {
  // Get the user session
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch the store data
  const { db } = await connectToDatabase()

  // Try to find the store associated with the user
  const loja = await db.collection("lojas").findOne({
    $or: [
      { usuarioId: session.user.id },
      { usuarioId: new ObjectId(session.user.id) },
      { proprietarioId: session.user.id },
      { proprietarioId: new ObjectId(session.user.id) },
    ],
  })

  if (!loja) {
    redirect("/perfil-da-loja/criar")
  }

  // Convert ObjectId to string for serialization
  const lojaData = {
    _id: loja._id.toString(),
    nome: loja.nome || "",
    descricao: loja.descricao || "",
    cnpj: loja.cnpj || "",
    endereco: loja.endereco || "",
    contato: loja.contato || {},
    categorias: loja.categorias || [],
    horarioFuncionamento: loja.horarioFuncionamento || {},
    redesSociais: loja.redesSociais || {},
    banner: loja.banner || "",
    logo: loja.logo || "",
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-8">Editar Perfil da Loja</h1>
        <LojaPerfilFormServerWrapper lojaData={lojaData} />
      </div>
    </main>
  )
}
