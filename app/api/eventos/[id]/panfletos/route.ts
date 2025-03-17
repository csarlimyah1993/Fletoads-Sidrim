import { type NextRequest, NextResponse } from "next/server"

// Get available panfletos that can be added to an event
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Get the evento ID from the route parameters
  const resolvedParams = await params
  const id = resolvedParams.id

  // Here you would typically fetch data from your database
  // For demo purposes, we'll return mock data
  const availablePanfletos = [
    { id: "1", titulo: "Promoção de Verão", descricao: "Descontos especiais para o verão" },
    { id: "2", titulo: "Lançamento de Produtos", descricao: "Novos produtos disponíveis" },
    { id: "3", titulo: "Ofertas da Semana", descricao: "Ofertas válidas até domingo" },
    { id: "4", titulo: "Liquidação Total", descricao: "Tudo com até 50% de desconto" },
  ]

  return NextResponse.json({
    success: true,
    panfletos: availablePanfletos,
  })
}

// Add panfletos to an event
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id

  try {
    // Parse the request body
    const body = await request.json()
    const { panfletoIds } = body

    if (!panfletoIds || !Array.isArray(panfletoIds)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format. Expected panfletoIds array.",
        },
        { status: 400 },
      )
    }

    // Here you would typically save the association between the event and panfletos
    // in your database

    return NextResponse.json({
      success: true,
      eventoId: id,
      message: "Panfletos added successfully",
      addedCount: panfletoIds.length,
    })
  } catch (error) {
    console.error("Error adding panfletos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add panfletos to event",
      },
      { status: 500 },
    )
  }
}

