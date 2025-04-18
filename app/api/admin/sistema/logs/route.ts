import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// Modelo para logs do sistema (opcional, poderia ser armazenado em um arquivo)
const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  source: String,
  details: mongoose.Schema.Types.Mixed,
})

// Verificar se o modelo já existe para evitar erros
const SystemLog = mongoose.models.SystemLog || mongoose.model("SystemLog", logSchema)

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Obter parâmetros de consulta
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const level = url.searchParams.get("level")

    // Construir consulta
    const query: any = {}
    if (level) {
      query.level = level
    }

    // Buscar logs
    const logs = await SystemLog.find(query).sort({ timestamp: -1 }).limit(limit)

    // Se não houver logs, criar alguns logs de exemplo
    if (logs.length === 0) {
      const sampleLogs = [
        {
          level: "info",
          message: "Sistema iniciado com sucesso",
          timestamp: new Date(),
          source: "system",
          details: { version: "1.0.0" },
        },
        {
          level: "warning",
          message: "Alto uso de memória detectado",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          source: "monitor",
          details: { memoryUsage: "75%" },
        },
        {
          level: "error",
          message: "Falha na conexão com o banco de dados",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          source: "database",
          details: { error: "Connection timeout" },
        },
        {
          level: "info",
          message: "Novo usuário registrado",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          source: "auth",
          details: { userId: "user123" },
        },
        {
          level: "info",
          message: "Backup do banco de dados concluído",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          source: "database",
          details: { size: "250MB" },
        },
      ]

      // Salvar logs de exemplo
      await SystemLog.insertMany(sampleLogs)

      return NextResponse.json(sampleLogs)
    }

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Erro ao buscar logs do sistema:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar logs do sistema",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    await connectToDatabase()

    // Criar novo log
    const novoLog = new SystemLog({
      level: data.level || "info",
      message: data.message,
      source: data.source || "manual",
      details: data.details || {},
    })

    await novoLog.save()

    return NextResponse.json({ message: "Log criado com sucesso", log: novoLog })
  } catch (error) {
    console.error("Erro ao criar log:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar log",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
