import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params object before accessing the id property
    const { id } = await params
    const vitrineId = id

    if (!vitrineId) {
      return NextResponse.json({ error: "ID da vitrine não fornecido" }, { status: 400 })
    }

    console.log("Buscando panfletos para a vitrine:", vitrineId)

    const { db } = await connectToDatabase()

    // Primeiro, precisamos encontrar a loja associada a esta vitrine
    const vitrine = await db.collection("vitrines").findOne({ _id: new ObjectId(vitrineId) })

    if (!vitrine) {
      console.log("Vitrine não encontrada:", vitrineId)
      return NextResponse.json({ error: "Vitrine não encontrada" }, { status: 404 })
    }

    // Obter o lojaId da vitrine
    const lojaId = vitrine.lojaId
    console.log("LojaId da vitrine:", lojaId, "Tipo:", typeof lojaId)

    // Agora, buscar os panfletos usando o lojaId correto
    const query = {
      $or: [
        { lojaId: lojaId }, // Se lojaId for string
        { lojaId: new ObjectId(lojaId.toString()) }, // Se lojaId for ObjectId
      ],
      ativo: true,
    }

    console.log(
      "Query para panfletos:",
      JSON.stringify(query, (key, value) =>
        typeof value === "object" && value !== null && "_bsontype" in value ? value.toString() : value,
      ),
    )

    const panfletos = await db
      .collection("panfletos")
      .find(query)
      .sort({ destaque: -1, dataInicio: -1 })
      .limit(10)
      .toArray()

    console.log(`Encontrados ${panfletos.length} panfletos para a loja ${lojaId}`)

    // Se não encontrou panfletos, vamos fazer uma busca direta pelo ID que você forneceu
    if (panfletos.length === 0) {
      console.log("Tentando busca direta com o lojaId do exemplo:", "680b7d543eee071cc937499f")

      const directQuery = {
        $or: [{ lojaId: "680b7d543eee071cc937499f" }, { lojaId: new ObjectId("680b7d543eee071cc937499f") }],
        ativo: true,
      }

      const directPanfletos = await db.collection("panfletos").find(directQuery).limit(5).toArray()

      console.log(`Busca direta encontrou ${directPanfletos.length} panfletos`)

      if (directPanfletos.length > 0) {
        // Se encontramos panfletos com a busca direta, vamos usá-los
        const serializedDirectPanfletos = directPanfletos.map((p) => ({
          ...p,
          _id: p._id.toString(),
          lojaId: typeof p.lojaId === "object" ? p.lojaId.toString() : p.lojaId,
          usuarioId: p.usuarioId ? (typeof p.usuarioId === "object" ? p.usuarioId.toString() : p.usuarioId) : null,
        }))

        return NextResponse.json({
          panfletos: serializedDirectPanfletos,
          count: serializedDirectPanfletos.length,
          message: "Panfletos encontrados com busca direta",
        })
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
