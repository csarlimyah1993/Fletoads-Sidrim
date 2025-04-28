import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object before accessing the id property
    const { id } = await params
    const lojaId = id

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    console.log("Buscando panfletos para a loja:", lojaId)

    const { db } = await connectToDatabase()

    // Construir uma query mais flexível que aceita tanto ObjectId quanto string
    // e remove a restrição de dataFim para debugging
    const query = {
      $or: [{ lojaId: new ObjectId(lojaId) }, { lojaId: lojaId }],
      ativo: true,
      // Remover a restrição de status para ver se encontramos algum panfleto
      // status: "active",
      // Remover temporariamente a restrição de data para debugging
      // dataFim: { $gte: new Date().toISOString() },
    }

    console.log("Query:", JSON.stringify(query))

    const panfletos = await db
      .collection("panfletos")
      .find(query)
      .sort({ destaque: -1, dataInicio: -1 })
      .limit(10)
      .toArray()

    console.log(`Encontrados ${panfletos.length} panfletos`)

    if (panfletos.length === 0) {
      // Se não encontrou nenhum panfleto, vamos fazer uma busca mais ampla para debug
      console.log("Tentando busca mais ampla para debug...")
      const allPanfletos = await db.collection("panfletos").find({ ativo: true }).limit(5).toArray()

      console.log(`Debug: Encontrados ${allPanfletos.length} panfletos ativos no total`)
      if (allPanfletos.length > 0) {
        console.log("Exemplo de lojaId armazenado:", allPanfletos[0].lojaId)
        console.log("Tipo de lojaId armazenado:", typeof allPanfletos[0].lojaId)
      }
    }

    // Converter ObjectId para string para serialização JSON
    const serializedPanfletos = panfletos.map((p) => ({
      ...p,
      _id: p._id.toString(),
      lojaId: typeof p.lojaId === "object" ? p.lojaId.toString() : p.lojaId,
      usuarioId: p.usuarioId ? (typeof p.usuarioId === "object" ? p.usuarioId.toString() : p.usuarioId) : null,
    }))

    return NextResponse.json({
      panfletos: serializedPanfletos,
      count: serializedPanfletos.length,
    })
  } catch (error) {
    console.error("Erro ao buscar panfletos:", error)
    return NextResponse.json({ error: "Erro ao buscar panfletos" }, { status: 500 })
  }
}
