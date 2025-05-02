import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId, type Document } from "mongodb"

// Define interfaces for our data types
interface Loja extends Document {
  _id: ObjectId | string
  nome: string
  logo?: string
  customId?: string
}

interface Evento extends Document {
  _id: ObjectId | string
  nome: string
  descricao?: string
  dataInicio?: Date
  dataFim?: Date
  customId?: string
}

interface Usuario extends Document {
  _id: ObjectId | string
  nome?: string
  email?: string
  customId?: string
}

interface Participacao extends Document {
  _id: ObjectId | string
  eventoId: string
  lojaId: string
  usuarioId: string
  status: string
  dataSolicitacao: string
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verify user is authenticated and is admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Fetch all participation requests
    const participacoes = await db.collection<Participacao>("participacoesEventos").find({}).toArray()

    // Get unique loja IDs and evento IDs
    const lojaIdsSet = new Set<string>()
    const eventoIdsSet = new Set<string>()
    const usuarioIdsSet = new Set<string>()

    participacoes.forEach((p) => {
      if (p.lojaId) lojaIdsSet.add(p.lojaId)
      if (p.eventoId) eventoIdsSet.add(p.eventoId)
      if (p.usuarioId) usuarioIdsSet.add(p.usuarioId)
    })

    const lojaIds = Array.from(lojaIdsSet)
    const eventoIds = Array.from(eventoIdsSet)
    const usuarioIds = Array.from(usuarioIdsSet)

    // Convert valid IDs to ObjectIds
    const lojaObjectIds = lojaIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))
    const eventoObjectIds = eventoIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))
    const usuarioObjectIds = usuarioIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id))

    // Fetch lojas - using separate queries for ObjectIds and string IDs
    let lojas: Loja[] = []
    if (lojaObjectIds.length > 0) {
      const lojasWithObjectIds = await db
        .collection<Loja>("lojas")
        .find({ _id: { $in: lojaObjectIds } })
        .toArray()
      lojas = [...lojas, ...lojasWithObjectIds]
    }

    // Handle string IDs if needed (using a different field or approach)
    const stringLojaIds = lojaIds.filter((id) => !ObjectId.isValid(id))
    if (stringLojaIds.length > 0) {
      // This assumes you have a field like 'customId' for string IDs
      // Adjust according to your data model
      const lojasWithStringIds = await db
        .collection<Loja>("lojas")
        .find({ customId: { $in: stringLojaIds } })
        .toArray()
      lojas = [...lojas, ...lojasWithStringIds]
    }

    // Fetch eventos - using separate queries for ObjectIds and string IDs
    let eventos: Evento[] = []
    if (eventoObjectIds.length > 0) {
      const eventosWithObjectIds = await db
        .collection<Evento>("eventos")
        .find({ _id: { $in: eventoObjectIds } })
        .toArray()
      eventos = [...eventos, ...eventosWithObjectIds]
    }

    // Handle string IDs if needed
    const stringEventoIds = eventoIds.filter((id) => !ObjectId.isValid(id))
    if (stringEventoIds.length > 0) {
      const eventosWithStringIds = await db
        .collection<Evento>("eventos")
        .find({ customId: { $in: stringEventoIds } })
        .toArray()
      eventos = [...eventos, ...eventosWithStringIds]
    }

    // Fetch usuarios - using separate queries for ObjectIds and string IDs
    let usuarios: Usuario[] = []
    if (usuarioObjectIds.length > 0) {
      const usuariosWithObjectIds = await db
        .collection<Usuario>("usuarios")
        .find({ _id: { $in: usuarioObjectIds } })
        .toArray()
      usuarios = [...usuarios, ...usuariosWithObjectIds]
    }

    // Handle string IDs if needed
    const stringUsuarioIds = usuarioIds.filter((id) => !ObjectId.isValid(id))
    if (stringUsuarioIds.length > 0) {
      const usuariosWithStringIds = await db
        .collection<Usuario>("usuarios")
        .find({ customId: { $in: stringUsuarioIds } })
        .toArray()
      usuarios = [...usuarios, ...usuariosWithStringIds]
    }

    // Create maps for quick lookup
    const lojasMap: Record<string, Loja> = {}
    lojas.forEach((loja) => {
      const id = loja._id.toString()
      lojasMap[id] = loja
    })

    const eventosMap: Record<string, Evento> = {}
    eventos.forEach((evento) => {
      const id = evento._id.toString()
      eventosMap[id] = evento
    })

    const usuariosMap: Record<string, Usuario> = {}
    usuarios.forEach((usuario) => {
      const id = usuario._id.toString()
      usuariosMap[id] = usuario
    })

    // Combine participation data with related entities
    const participacoesDetalhadas = participacoes.map((p) => {
      const lojaId = p.lojaId?.toString() || ""
      const eventoId = p.eventoId?.toString() || ""
      const usuarioId = p.usuarioId?.toString() || ""

      return {
        ...p,
        loja: lojaId ? lojasMap[lojaId] || null : null,
        evento: eventoId ? eventosMap[eventoId] || null : null,
        usuario: usuarioId ? usuariosMap[usuarioId] || null : null,
      }
    })

    return NextResponse.json({ participacoes: participacoesDetalhadas })
  } catch (error) {
    console.error("Erro ao buscar solicitações de participação:", error)
    return NextResponse.json({ error: "Erro ao buscar solicitações de participação" }, { status: 500 })
  }
}
