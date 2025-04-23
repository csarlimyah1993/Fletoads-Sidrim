import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Excluir da coleção de usuários
    const result = await db.collection("usuarios").deleteOne({
      email: session.user.email,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Também excluir da coleção users se existir
    await db.collection("users").deleteOne({
      email: session.user.email,
    })

    return NextResponse.json({ success: true, message: "Conta excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir conta:", error)
    return NextResponse.json({ error: "Erro ao excluir conta" }, { status: 500 })
  }
}
