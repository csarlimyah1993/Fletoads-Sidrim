import { type NextRequest, NextResponse } from "next/server"
import Usuario from "@/lib/models/usuario"
import Notificacao from "@/lib/models/notificacao"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const { nome, email, senha, cargo = "editor" } = await req.json()

    // Verificar se o email já está em uso
    const usuarioExistente = await Usuario.findOne({ email }).maxTimeMS(20000)

    if (usuarioExistente) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Criar novo usuário
    const novoUsuario = new Usuario({
      nome,
      email,
      senha,
      cargo,
      permissoes: cargo === "admin" ? ["admin"] : ["editor"],
      dataCriacao: new Date(),
    })

    await novoUsuario.save()

    // Criar notificação de boas-vindas
    const notificacaoBemVindo = new Notificacao({
      usuario: novoUsuario._id,
      titulo: "Bem-vindo ao FletoAds!",
      mensagem: `Olá ${nome}, seja bem-vindo à plataforma FletoAds! Estamos felizes em tê-lo conosco. Explore todas as funcionalidades disponíveis e comece a gerenciar seus panfletos e campanhas.`,
      tipo: "success",
      link: "/dashboard",
    })

    await notificacaoBemVindo.save()

    // Remover a senha da resposta
    const usuarioSemSenha = {
      id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      cargo: novoUsuario.cargo,
      permissoes: novoUsuario.permissoes,
      dataCriacao: novoUsuario.dataCriacao,
    }

    return NextResponse.json(usuarioSemSenha, { status: 201 })
  } catch (error) {
    console.error("Erro ao registrar usuário:", error)

    // Fornecer mensagens de erro mais específicas
    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return NextResponse.json({ error: "Dados de usuário inválidos" }, { status: 400 })
      }
    }

    return NextResponse.json(
      { error: "Erro ao registrar usuário. Por favor, tente novamente mais tarde." },
      { status: 500 },
    )
  }
}

