import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"
import mongoose from "mongoose"

// Modelo para notificações
const notificacaoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario" },
  titulo: { type: String, required: true },
  mensagem: { type: String, required: true },
  tipo: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  lida: { type: Boolean, default: false },
  link: { type: String },
  dataCriacao: { type: Date, default: Date.now },
})

// Verificar se o modelo já existe para evitar erros
const Notificacao = mongoose.models.Notificacao || mongoose.model("Notificacao", notificacaoSchema)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { titulo, mensagem, tipo, link, destinatario, usuarioId } = await request.json()

    if (!titulo || !mensagem) {
      return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Enviar notificação para um usuário específico
    if (destinatario === "usuario" && usuarioId) {
      const usuario = await Usuario.findById(usuarioId)

      if (!usuario) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      const notificacao = new Notificacao({
        usuario: usuarioId,
        titulo,
        mensagem,
        tipo: tipo || "info",
        link,
      })

      await notificacao.save()

      return NextResponse.json({
        message: "Notificação enviada com sucesso",
        notificacao,
      })
    }

    // Enviar notificação para todos os usuários
    if (destinatario === "todos") {
      const usuarios = await Usuario.find({}, "_id")

      const notificacoes = usuarios.map((usuario) => ({
        usuario: usuario._id,
        titulo,
        mensagem,
        tipo: tipo || "info",
        link,
      }))

      await Notificacao.insertMany(notificacoes)

      return NextResponse.json({
        message: `Notificação enviada com sucesso para ${usuarios.length} usuários`,
        count: usuarios.length,
      })
    }

    return NextResponse.json({ error: "Destinatário inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao enviar notificação:", error)
    return NextResponse.json(
      {
        error: "Erro ao enviar notificação",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

