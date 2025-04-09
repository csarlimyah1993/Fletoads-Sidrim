import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const latitude = Number.parseFloat(searchParams.get("latitude") || "0")
    const longitude = Number.parseFloat(searchParams.get("longitude") || "0")
    const raio = Number.parseInt(searchParams.get("raio") || "10") // raio em km
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!latitude || !longitude) {
      return NextResponse.json({ error: "Latitude e longitude são obrigatórios" }, { status: 400 })
    }

    await connectToDatabase()

    // Obter o modelo de Loja
    let Loja
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
          rua: String,
          numero: String,
          complemento: String,
          bairro: String,
          cidade: String,
          estado: String,
          cep: String,
          latitude: String,
          longitude: String,
        },
        contato: {
          telefone: String,
          whatsapp: String,
          email: String,
          site: String,
        },
        redesSociais: {
          instagram: String,
          facebook: String,
          twitter: String,
          youtube: String,
          linkedin: String,
        },
        horarioFuncionamento: {
          segunda: { abertura: String, fechamento: String, open: Boolean },
          terca: { abertura: String, fechamento: String, open: Boolean },
          quarta: { abertura: String, fechamento: String, open: Boolean },
          quinta: { abertura: String, fechamento: String, open: Boolean },
          sexta: { abertura: String, fechamento: String, open: Boolean },
          sabado: { abertura: String, fechamento: String, open: Boolean },
          domingo: { abertura: String, fechamento: String, open: Boolean },
        },
        estilos: {
          layout: String,
          cores: {
            primaria: String,
            secundaria: String,
            texto: String,
          },
          widgets: [String],
        },
        destaque: Boolean,
        ativo: { type: Boolean, default: true },
        dataCriacao: { type: Date, default: Date.now },
      })

      Loja = mongoose.model("Loja", LojaSchema)
    }

    // Buscar lojas com coordenadas
    const lojas = await Loja.find({
      "endereco.latitude": { $exists: true, $ne: "" },
      "endereco.longitude": { $exists: true, $ne: "" },
      ativo: true,
    }).lean()

    // Calcular distância e filtrar por raio
    const lojasProximas = lojas
      .map((loja) => {
        const lojaLat = Number.parseFloat(loja.endereco?.latitude || "0")
        const lojaLng = Number.parseFloat(loja.endereco?.longitude || "0")

        if (!lojaLat || !lojaLng) return null

        // Calcular distância usando a fórmula de Haversine
        const distancia = calcularDistancia(latitude, longitude, lojaLat, lojaLng)

        return {
          ...loja,
          distancia,
        }
      })
      .filter((loja) => loja !== null && loja.distancia <= raio)
      .sort((a, b) => (a?.distancia || 0) - (b?.distancia || 0))
      .slice(0, limit)

    return NextResponse.json({ lojas: lojasProximas })
  } catch (error) {
    console.error("Erro ao buscar lojas próximas:", error)
    return NextResponse.json({ error: "Erro ao buscar lojas próximas" }, { status: 500 })
  }
}

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c // Distância em km

  return Number.parseFloat(distancia.toFixed(2))
}

