import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Define interfaces for better type safety
interface Loja {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  categorias?: string[]
  endereco?: {
    cidade?: string
    estado?: string
  }
  destaque?: boolean
  ativo?: boolean
  dataCriacao?: Date
}

// Function to get models
async function getModels() {
  try {
    // Connect to database
    await connectToDatabase()

    // Get or create Loja model
    let Loja: mongoose.Model<any>
    try {
      Loja = mongoose.model("Loja")
    } catch (e) {
      const LojaSchema = new mongoose.Schema({
        nome: String,
        descricao: String,
        logo: String,
        banner: String,
        categorias: [String],
        endereco: {
          cidade: String,
          estado: String,
        },
        destaque: Boolean,
        ativo: { type: Boolean, default: true },
        dataCriacao: { type: Date, default: Date.now },
      })

      Loja = mongoose.model("Loja", LojaSchema)
    }

    return { Loja }
  } catch (error) {
    console.error("Error getting models:", error)
    throw error
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = Number.parseInt(searchParams.get("pagina") || "1")
    const limite = Number.parseInt(searchParams.get("limite") || "12")
    const categoria = searchParams.get("categoria")
    const cidade = searchParams.get("cidade")
    const estado = searchParams.get("estado")
    const busca = searchParams.get("busca")

    const skip = (pagina - 1) * limite

    // Get models
    const { Loja } = await getModels()

    // Build filter
    const filtro: any = { ativo: true }

    if (categoria) {
      filtro.categorias = categoria
    }

    if (cidade && cidade !== "all") {
      filtro["endereco.cidade"] = { $regex: cidade, $options: "i" }
    }

    if (estado && estado !== "all") {
      filtro["endereco.estado"] = { $regex: estado, $options: "i" }
    }

    if (busca) {
      filtro.$or = [{ nome: { $regex: busca, $options: "i" } }, { descricao: { $regex: busca, $options: "i" } }]
    }

    // Get lojas
    const lojas = await Loja.find(filtro).sort({ destaque: -1, dataCriacao: -1 }).skip(skip).limit(limite).lean()

    // Count total
    const total = await Loja.countDocuments(filtro)

    // Get available categories
    const categorias = await Loja.distinct("categorias", { ativo: true })

    // Get available cities and states
    const cidades = await Loja.distinct("endereco.cidade", { ativo: true })
    const estados = await Loja.distinct("endereco.estado", { ativo: true })

    return NextResponse.json({
      lojas,
      paginacao: {
        total,
        paginas: Math.ceil(total / limite),
        atual: pagina,
        porPagina: limite,
      },
      filtros: {
        categorias,
        cidades,
        estados,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar vitrines:", error)
    return NextResponse.json({ error: "Erro ao buscar vitrines" }, { status: 500 })
  }
}

