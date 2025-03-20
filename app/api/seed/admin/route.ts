import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== "development") {
      const session = await getServerSession(authOptions)

      // Em produção, apenas um admin existente pode criar outro admin
      if (!session || session.user.cargo !== "admin") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
    }

    await connectToDatabase()

    // Verificar se o usuário admin já existe
    const adminExists = await Usuario.findOne({ email: "adminfletoads@gmail.com" })

    if (adminExists) {
      // Atualizar cargo para admin
      adminExists.cargo = "admin"
      await adminExists.save()

      return NextResponse.json({
        message: "Usuário admin já existe e foi atualizado",
        admin: {
          id: adminExists._id,
          nome: adminExists.nome,
          email: adminExists.email,
          cargo: adminExists.cargo,
        },
      })
    }

    // Criar usuário admin
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("kkZMk411WDkv", salt)

    const admin = new Usuario({
      nome: "Administrador FletoAds",
      email: "adminfletoads@gmail.com",
      senha: hashedPassword,
      cargo: "admin",
      permissoes: ["admin", "gerenciar_usuarios", "gerenciar_planos", "gerenciar_sistema"],
      ativo: true,
      perfil: {
        foto: "",
        telefone: "",
        bio: "Administrador da plataforma FletoAds",
        preferencias: {
          notificacoes: true,
          temaEscuro: false,
          idioma: "pt-BR",
        },
      },
    })

    await admin.save()

    return NextResponse.json({
      message: "Usuário admin criado com sucesso",
      admin: {
        id: admin._id,
        nome: admin.nome,
        email: admin.email,
        cargo: admin.cargo,
      },
    })
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar usuário admin",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

