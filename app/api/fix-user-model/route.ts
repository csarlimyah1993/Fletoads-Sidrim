import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectToDatabase()

    // Buscar todos os usuários
    const usuarios = await UsuarioModel.find({})

    let totalUsuarios = 0
    let senhasAtualizadas = 0
    let erros = 0

    // Iterar sobre cada usuário e verificar/corrigir a senha
    for (const usuario of usuarios) {
      totalUsuarios++

      try {
        // Verificar se a senha já é um hash bcrypt
        if (usuario.senha && !(usuario.senha.startsWith("$2a$") || usuario.senha.startsWith("$2b$"))) {
          // Se não for um hash bcrypt, converter para hash
          const senhaPlana = usuario.senha
          const salt = await bcrypt.genSalt(10)
          const senhaHash = await bcrypt.hash(senhaPlana, salt)

          // Atualizar a senha no banco de dados
          usuario.senha = senhaHash
          await usuario.save()

          senhasAtualizadas++
        }
      } catch (error) {
        console.error(`Erro ao processar usuário ${usuario.email}:`, error)
        erros++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verificação e correção de senhas concluída",
      estatisticas: {
        totalUsuarios,
        senhasAtualizadas,
        erros,
      },
    })
  } catch (error) {
    console.error("Erro ao verificar/corrigir senhas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao verificar/corrigir senhas",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Versão alternativa que usa updateMany para maior eficiência
export async function POST() {
  try {
    await connectToDatabase()

    // Buscar todos os usuários com senhas que não são hashes bcrypt
    const usuarios = await UsuarioModel.find({
      senha: { $exists: true },
      $nor: [{ senha: { $regex: /^\$2a\$/ } }, { senha: { $regex: /^\$2b\$/ } }],
    })

    let senhasAtualizadas = 0
    let erros = 0

    // Processar cada usuário individualmente para hashear a senha
    for (const usuario of usuarios) {
      try {
        const senhaPlana = usuario.senha
        const salt = await bcrypt.genSalt(10)
        const senhaHash = await bcrypt.hash(senhaPlana, salt)

        // Atualizar a senha usando updateOne para evitar middlewares
        await UsuarioModel.updateOne({ _id: usuario._id }, { $set: { senha: senhaHash } })

        senhasAtualizadas++
      } catch (error) {
        console.error(`Erro ao processar usuário ${usuario.email}:`, error)
        erros++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Conversão de senhas em texto plano para hashes concluída",
      estatisticas: {
        totalProcessados: usuarios.length,
        senhasAtualizadas,
        erros,
      },
    })
  } catch (error) {
    console.error("Erro ao converter senhas:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao converter senhas",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

