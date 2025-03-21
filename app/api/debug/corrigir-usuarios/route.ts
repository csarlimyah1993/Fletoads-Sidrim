import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Buscar todos os usuários
    const usuarios = await Usuario.find({})

    let atualizados = 0
    let erros = 0

    // Atualizar cada usuário que não tem senha
    for (const usuario of usuarios) {
      try {
        if (!usuario.password) {
          usuario.password = "123456" // Senha padrão para desenvolvimento
          await usuario.save()
          atualizados++
        }
      } catch (error) {
        console.error(`Erro ao atualizar usuário ${usuario._id}:`, error)
        erros++
      }
    }

    return NextResponse.json({
      success: true,
      message: `${atualizados} usuários atualizados, ${erros} erros`,
      total: usuarios.length,
    })
  } catch (error) {
    console.error("Erro ao corrigir usuários:", error)
    return NextResponse.json({ error: "Erro ao corrigir usuários" }, { status: 500 })
  }
}

