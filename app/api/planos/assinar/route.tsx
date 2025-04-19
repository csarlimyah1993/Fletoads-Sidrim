import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Define interface for assinatura data
interface AssinaturaData {
  userId: string
  plano: string
  periodo: string
  nome: string
  email: string
  tipoDocumento: string
  documento: string
  telefone?: string
  endereco?: {
    logradouro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  metodoPagamento?: string
  status: string
  dataAssinatura: Date
  contratoAceito: boolean
  dadosPagamento?: {
    numeroCartao?: string | null
    validadeCartao?: string | null
    nomeCartao?: string | null
  }
}

// Function to get or create Assinaturas model
async function getAssinaturasModel() {
  try {
    await connectToDatabase()

    let Assinaturas: mongoose.Model<any>
    try {
      Assinaturas = mongoose.model("Assinaturas")
    } catch (e) {
      const AssinaturaSchema = new mongoose.Schema({
        userId: String,
        plano: String,
        periodo: String,
        nome: String,
        email: String,
        tipoDocumento: String,
        documento: String,
        telefone: String,
        endereco: {
          logradouro: String,
          cidade: String,
          estado: String,
          cep: String,
        },
        metodoPagamento: String,
        status: String,
        dataAssinatura: Date,
        contratoAceito: Boolean,
        dadosPagamento: {
          numeroCartao: String,
          validadeCartao: String,
          nomeCartao: String,
        },
      })

      Assinaturas = mongoose.model("Assinaturas", AssinaturaSchema)
    }

    return Assinaturas
  } catch (error) {
    console.error("Erro ao obter modelo de assinaturas:", error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()

    // Validar dados obrigatórios
    if (!data.plano || !data.nome || !data.email || !data.documento) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Obter modelo de assinaturas
    const Assinaturas = await getAssinaturasModel()

    // Criar registro de assinatura
    const assinatura: AssinaturaData = {
      userId: session.user.id,
      plano: data.plano,
      periodo: data.periodo || "mensal",
      nome: data.nome,
      email: data.email,
      tipoDocumento: data.tipoDocumento || "cpf",
      documento: data.documento,
      telefone: data.telefone,
      endereco: {
        logradouro: data.endereco,
        cidade: data.cidade,
        estado: data.estado,
        cep: data.cep,
      },
      metodoPagamento: data.formaPagamento,
      status: "pendente",
      dataAssinatura: new Date(),
      contratoAceito: false,
      dadosPagamento: {
        numeroCartao: data.numeroCartao ? `**** **** **** ${data.numeroCartao.replace(/\D/g, "").slice(-4)}` : null,
        validadeCartao: data.validadeCartao || null,
        nomeCartao: data.nomeCartao || null,
      },
    }

    // Use a type assertion to handle the mongoose create method
    const doc = new Assinaturas(assinatura)
    const result = await doc.save()

    // Retornar ID da assinatura
    return NextResponse.json({
      success: true,
      message: "Assinatura criada com sucesso",
      assinaturaId: result._id.toString(),
    })
  } catch (error) {
    console.error("Erro ao processar assinatura:", error)
    return NextResponse.json({ error: "Erro ao processar assinatura" }, { status: 500 })
  }
}

