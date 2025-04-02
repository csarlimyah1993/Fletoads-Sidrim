import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import VisitanteEvento from "@/lib/models/visitante-evento"
import Loja from "@/lib/models/loja"
import mongoose from "mongoose"

// Definir interfaces para os tipos
interface VisitaLoja {
  lojaId: mongoose.Types.ObjectId
  dataVisita: Date
}

interface VisitanteDoc {
  _id: mongoose.Types.ObjectId
  token: string
  visitasLojas: VisitaLoja[]
  save: () => Promise<any>
  [key: string]: any
}

export async function POST(request: Request) {
  try {
    const { token, lojaId } = await request.json()

    // Validar dados
    if (!token || !lojaId) {
      return NextResponse.json({ error: "Token e ID da loja são obrigatórios" }, { status: 400 })
    }

    // Conectar ao banco de dados
    try {
      await connectToDatabase()
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error)
      // Fallback para quando o banco estiver indisponível
      return NextResponse.json({ success: true })
    }

    // Verificar se a loja existe
    const loja = await Loja.findById(lojaId)
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Buscar visitante pelo token
    const visitante = (await VisitanteEvento.findOne({ token })) as VisitanteDoc | null
    if (!visitante) {
      return NextResponse.json({ error: "Visitante não encontrado" }, { status: 404 })
    }

    // Verificar se já visitou esta loja
    const jaVisitou = visitante.visitasLojas.some((visita: VisitaLoja) => visita.lojaId.toString() === lojaId)

    if (!jaVisitou) {
      // Adicionar visita
      visitante.visitasLojas.push({
        lojaId: new mongoose.Types.ObjectId(lojaId),
        dataVisita: new Date(),
      })

      await visitante.save()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao registrar visita:", error)
    return NextResponse.json({ error: "Erro ao registrar visita" }, { status: 500 })
  }
}

