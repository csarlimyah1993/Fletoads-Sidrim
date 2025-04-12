import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lojaId = params.id
    console.log(`API /vitrine - Salvando vitrine para loja: ${lojaId}, usuário: ${session.user.id}`)

    const { db } = await connectToDatabase()

    // Verificar se a loja existe
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(lojaId),
    })

    if (!loja) {
      console.log("API /vitrine - Loja não encontrada")
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para editar a loja
    // Convertemos os IDs para string para comparação consistente
    const proprietarioId =
      typeof loja.proprietarioId === "string" ? loja.proprietarioId : loja.proprietarioId?.toString()
    const usuarioId = typeof loja.usuarioId === "string" ? loja.usuarioId : loja.usuarioId?.toString()
    const sessionUserId = session.user.id

    console.log("API /vitrine - Verificando permissões:")
    console.log(`- proprietarioId: ${proprietarioId}`)
    console.log(`- usuarioId: ${usuarioId}`)
    console.log(`- sessionUserId: ${sessionUserId}`)
    console.log(`- role: ${session.user.role}`)

    if (proprietarioId !== sessionUserId && usuarioId !== sessionUserId && session.user.role !== "admin") {
      console.log("API /vitrine - Usuário não autorizado")
      return NextResponse.json({ error: "Não autorizado para editar esta loja" }, { status: 403 })
    }

    const vitrineData = await request.json()
    console.log("API /vitrine - Dados recebidos:", JSON.stringify(vitrineData).substring(0, 100) + "...")

    // Validar slug único
    if (vitrineData.slug) {
      const existingVitrine = await db.collection("lojas").findOne({
        "vitrine.slug": vitrineData.slug,
        _id: { $ne: new ObjectId(lojaId) },
      })

      if (existingVitrine) {
        return NextResponse.json({ error: "Esta URL já está em uso. Escolha outra." }, { status: 400 })
      }
    }

    // Atualizar a loja com as configurações da vitrine
    await db.collection("lojas").updateOne(
      { _id: new ObjectId(lojaId) },
      {
        $set: {
          vitrine: vitrineData,
          vitrineId: vitrineData.slug,
          dataAtualizacao: new Date(),
        },
      },
    )

    console.log("API /vitrine - Configurações salvas com sucesso")
    return NextResponse.json({ message: "Configurações da vitrine salvas com sucesso" })
  } catch (error) {
    console.error("Erro ao salvar configurações da vitrine:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lojaId = params.id
    const { db } = await connectToDatabase()

    // Verificar se a loja existe
    const loja = await db.collection("lojas").findOne({
      _id: new ObjectId(lojaId),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem permissão para visualizar a loja
    const proprietarioId =
      typeof loja.proprietarioId === "string" ? loja.proprietarioId : loja.proprietarioId?.toString()
    const usuarioId = typeof loja.usuarioId === "string" ? loja.usuarioId : loja.usuarioId?.toString()
    const sessionUserId = session.user.id

    if (proprietarioId !== sessionUserId && usuarioId !== sessionUserId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    return NextResponse.json({ vitrine: loja.vitrine || {} })
  } catch (error) {
    console.error("Erro ao buscar configurações da vitrine:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
