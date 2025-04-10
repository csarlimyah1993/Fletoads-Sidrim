import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    console.log("Buscando usuários...")
    const usuarios = await Usuario.find({})
    console.log(`Encontrados ${usuarios.length} usuários`)

    let atualizados = 0
    for (const usuario of usuarios) {
      let modificado = false

      // Garantir que o perfil existe
      if (!usuario.perfil) {
        usuario.perfil = {}
        modificado = true
      }

      // Garantir que as estruturas aninhadas existem
      if (!usuario.perfil.endereco) {
        usuario.perfil.endereco = {}
        modificado = true
      }

      if (!usuario.perfil.redesSociais) {
        usuario.perfil.redesSociais = {}
        modificado = true
      }

      if (!usuario.perfil.preferencias) {
        usuario.perfil.preferencias = {
          notificacoes: true,
          temaEscuro: false,
          idioma: "pt-BR",
        }
        modificado = true
      }

      // Salvar as alterações se houve modificação
      if (modificado) {
        await usuario.save()
        atualizados++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Esquema de usuários atualizado com sucesso. ${atualizados} usuários foram modificados.`,
    })
  } catch (error) {
    console.error("Erro ao atualizar esquema de usuários:", error)
    return NextResponse.json({ error: "Erro ao atualizar esquema de usuários" }, { status: 500 })
  }
}
