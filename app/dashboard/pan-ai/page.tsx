import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import PanAIClient from "./pan-ai-client"

export default async function PanAIPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Verificar se o usuário tem acesso ao recurso premium
  const { db } = await connectToDatabase()
  const userId = session.user.id

  // Buscar o usuário no banco de dados para obter o plano atual
  const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

  if (!usuario) {
    redirect("/dashboard")
  }

  // Verificar se o plano do usuário é premium
  const plano = usuario.plano || "gratuito"
  const isPremium = ["premium", "profissional", "empresarial"].includes(plano.toLowerCase())

  // Serializar os dados do usuário para passar ao componente cliente
  const userData = {
    id: usuario._id.toString(),
    nome: usuario.nome || "",
    email: usuario.email || "",
    plano: plano,
    isPremium: isPremium,
  }

  return <PanAIClient userData={userData} />
}
