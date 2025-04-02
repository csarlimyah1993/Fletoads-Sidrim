import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import VisitanteEvento from "@/lib/models/visitante-evento"
import { randomBytes } from "crypto"

export async function POST(request: Request) {
  try {
    const { nome, email, telefone, cpf } = await request.json()

    // Validar dados
    if (!nome || !email || !telefone || !cpf) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    // Conectar ao banco de dados
    try {
      await connectToDatabase()
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error)
      // Fallback para quando o banco estiver indisponível
      // Gerar token aleatório
      const token = randomBytes(32).toString("hex")
      return NextResponse.json({ token })
    }

    // Verificar se o visitante já existe
    const visitanteExistente = await VisitanteEvento.findOne({
      $or: [{ email }, { cpf }],
    })

    if (visitanteExistente) {
      // Se já existe, retornar o token existente
      return NextResponse.json({ token: visitanteExistente.token })
    }

    // Gerar token aleatório
    const token = randomBytes(32).toString("hex")

    // Criar novo visitante
    const novoVisitante = new VisitanteEvento({
      nome,
      email,
      telefone,
      cpf,
      token,
      visitasLojas: [],
      dataRegistro: new Date(),
    })

    await novoVisitante.save()

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Erro ao registrar visitante:", error)
    return NextResponse.json({ error: "Erro ao registrar visitante" }, { status: 500 })
  }
}

