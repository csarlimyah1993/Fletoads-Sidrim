import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    // console.log("[API Geocode] Recebida solicitação para geocodificar:", address)

    if (!address) {
     // console.log("[API Geocode] Endereço não fornecido")
      return NextResponse.json({ error: "Endereço não fornecido" }, { status: 400 })
    }

    // Verificar se o endereço é válido (não é [object Object])
    if (address.includes("[object Object]")) {
      // console.log("[API Geocode] Endereço inválido (objeto não serializado corretamente)")
      return NextResponse.json({ error: "Formato de endereço inválido" }, { status: 400 })
    }

    // Usar a API de Geocodificação do Google Maps
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 

    const isKeyAvailable = !!apiKey
   // console.log("[API Geocode] API Key disponível:", isKeyAvailable)

    if (!isKeyAvailable) {
    //  console.log("[API Geocode] API Key do Google Maps não configurada")

      // Retornar um erro mais detalhado
      return NextResponse.json(
        {
          error: "API Key não configurada",
          details:
            "A variável de ambiente GOOGLE_MAPS_API_KEY não está configurada. Por favor, adicione-a ao seu arquivo .env ou nas variáveis de ambiente do projeto.",
        },
        { status: 500 },
      )
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
   // console.log("[API Geocode] Chamando API do Google Maps")

    const response = await fetch(url)
   // console.log("[API Geocode] Status da resposta:", response.status)

    const data = await response.json()
    console.log(
    //  "[API Geocode] Resposta recebida:",
      data.status,
      data.results ? `${data.results.length} resultados` : "sem resultados",
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Geocode] Erro na geocodificação:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
