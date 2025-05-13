import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    console.log("API user-profile: Iniciando busca de perfil")
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("API user-profile: Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log(`API user-profile: Buscando perfil para ${session.user.email}`)

    try {
      const { db } = await connectToDatabase()

      // Primeiro, tentar buscar por ID
      let usuario = null

      if (session.user.id) {
        try {
          // Verificar se o ID é um ObjectId válido
          if (typeof session.user.id === "string" && ObjectId.isValid(session.user.id)) {
            usuario = await db.collection("usuarios").findOne({
              _id: new ObjectId(session.user.id),
            })
            console.log(`API user-profile: Busca por ID ObjectId: ${usuario ? "encontrado" : "não encontrado"}`)
          } else {
            // Se não for um ObjectId válido, tentar buscar como string
            usuario = await db.collection("usuarios").findOne({
              // @ts-ignore
              _id: session.user.id,
            })
            console.log(`API user-profile: Busca por ID string: ${usuario ? "encontrado" : "não encontrado"}`)
          }
        } catch (error) {
          console.error("API user-profile: Erro ao buscar por ID:", error)
        }
      }

      // Se não encontrou por ID, buscar por email
      if (!usuario && session.user.email) {
        usuario = await db.collection("usuarios").findOne({
          email: session.user.email,
        })

        console.log(`API user-profile: Busca por email: ${usuario ? "encontrado" : "não encontrado"}`)
      }

      if (!usuario) {
        console.log("API user-profile: Usuário não encontrado no banco")
        // Retornar dados da sessão como fallback
        return NextResponse.json({
          _id: session.user.id,
          email: session.user.email,
          nome: session.user.name || "Usuário",
          plano: "gratuito",
          role: session.user.role || "user",
        })
      }

      // Log detalhado dos dados do usuário (sem informações sensíveis)
      console.log("API user-profile: Dados do usuário encontrados:", {
        _id: usuario._id,
        email: usuario.email,
        plano: usuario.plano || "gratuito",
        role: usuario.role || "user",
      })

      // Remover campos sensíveis
      const { senha, password, ...usuarioSemSenha } = usuario

      // Converter _id para string se for ObjectId
      const userData = {
        ...usuarioSemSenha,
        _id: typeof usuarioSemSenha._id === "object" ? usuarioSemSenha._id.toString() : usuarioSemSenha._id,
        plano: usuarioSemSenha.plano || "gratuito",
      }

      return NextResponse.json(userData)
    } catch (dbError) {
      console.error("API user-profile: Erro de banco de dados:", dbError)
      // Retornar dados da sessão como fallback
      return NextResponse.json({
        _id: session.user.id,
        email: session.user.email,
        nome: session.user.name || "Usuário",
        plano: "gratuito",
        role: session.user.role || "user",
      })
    }
  } catch (error) {
    console.error("API user-profile: Erro ao buscar perfil:", error)
    // Retornar erro
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}
