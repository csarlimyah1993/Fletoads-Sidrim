import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("latitude")
    const lng = searchParams.get("longitude")
    const raio = searchParams.get("raio") || "10" // Raio em km, padrão 10km
    const categoria = searchParams.get("categoria")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Verificar se latitude e longitude foram fornecidos
    if (!lat || !lng) {
      console.error("Parâmetros de latitude e longitude são obrigatórios")
      return NextResponse.json({ error: "Parâmetros de latitude e longitude são obrigatórios" }, { status: 400 })
    }

    // Verificar se são números válidos
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("Latitude e longitude devem ser números válidos")
      return NextResponse.json({ error: "Latitude e longitude devem ser números válidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const raioKm = Number.parseFloat(raio)

    // Criar índice geoespacial se não existir
    try {
      await db.collection("lojas").createIndex({ "localizacao.coordinates": "2dsphere" })
      console.log("Índice geoespacial criado ou já existente")
    } catch (error) {
      console.log("Erro ao criar índice geoespacial:", error)
    }

    // Construir a query sem usar $near para evitar problemas com índices
    const query: any = {
      ativo: true,
    }

    // Adicionar filtro por categoria se fornecido
    if (categoria) {
      query.categorias = { $in: [categoria] }
    }

    console.log("Query de busca:", JSON.stringify(query))

    // Buscar todas as lojas ativas
    const lojas = await db.collection("lojas").find(query).skip(skip).limit(limit).toArray()

    // Calcular distância para cada loja e filtrar pelo raio
    const lojasComDistancia = lojas
      .map((loja: any) => {
        let distancia = 0
        if (loja.localizacao && loja.localizacao.coordinates) {
          // Calcular distância em km usando a fórmula de Haversine
          const [lonLoja, latLoja] = loja.localizacao.coordinates
          distancia = calcularDistancia(latitude, longitude, latLoja, lonLoja)
        }

        return {
          ...loja,
          _id: loja._id.toString(),
          distancia: Number.parseFloat(distancia.toFixed(2)), // Arredondar para 2 casas decimais
        }
      })
      .filter((loja: any) => loja.distancia <= raioKm) // Filtrar pelo raio
      .sort((a: any, b: any) => a.distancia - b.distancia) // Ordenar por distância

    // Contar total de resultados para paginação
    const total = lojasComDistancia.length

    return NextResponse.json({
      lojas: lojasComDistancia,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar lojas próximas:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distância em km
  return d
}
