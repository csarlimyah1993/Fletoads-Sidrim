import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// GET - Obter todos os planos
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    // Get the Plano model
    const Plano =
      mongoose.models.Plano ||
      mongoose.model(
        "Plano",
        new mongoose.Schema({
          nome: String,
          slug: { type: String, unique: true },
          preco: Number,
          descricao: String,
          recursos: [String],
          popular: Boolean,
          ativo: { type: Boolean, default: true },
          limitacoes: {
            produtos: { type: Number, default: 0 },
            lojas: { type: Number, default: 1 },
            panfletos: { type: Number, default: 0 },
            promocoes: { type: Number, default: 0 },
            whatsapp: { type: Number, default: 0 },
          },
        }),
      )

    const planos = await Plano.find({})
    return NextResponse.json(planos)
  } catch (error) {
    console.error("Erro ao buscar planos:", error)
    return NextResponse.json({ error: "Erro ao buscar planos" }, { status: 500 })
  }
}

// POST - Criar um novo plano
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Get the Plano model
    const Plano =
      mongoose.models.Plano ||
      mongoose.model(
        "Plano",
        new mongoose.Schema({
          nome: String,
          slug: { type: String, unique: true },
          preco: Number,
          descricao: String,
          recursos: [String],
          popular: Boolean,
          ativo: { type: Boolean, default: true },
          limitacoes: {
            produtos: { type: Number, default: 0 },
            lojas: { type: Number, default: 1 },
            panfletos: { type: Number, default: 0 },
            promocoes: { type: Number, default: 0 },
            whatsapp: { type: Number, default: 0 },
          },
        }),
      )

    const data = await req.json()
    const plano = new Plano(data)
    await plano.save()

    return NextResponse.json(plano, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar plano:", error)
    return NextResponse.json({ error: "Erro ao criar plano" }, { status: 500 })
  }
}

