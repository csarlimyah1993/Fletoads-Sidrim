import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import VisitanteEvento from "@/lib/models/visitante-evento"
import Loja from "@/lib/models/loja"
import type mongoose from "mongoose"

// Definir interfaces para os tipos
interface LojaDoc {
  _id: mongoose.Types.ObjectId
  nome: string
  [key: string]: any
}

interface VisitaLoja {
  lojaId: mongoose.Types.ObjectId
  dataVisita: Date
}

interface VisitanteDoc {
  _id: mongoose.Types.ObjectId
  nome: string
  email: string
  telefone: string
  cpf?: string
  dataRegistro: Date
  visitasLojas: VisitaLoja[]
  [key: string]: any
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    try {
      await connectToDatabase()
    } catch (error) {
      console.error("Erro ao conectar ao banco de dados:", error)
      // Fallback para quando o banco estiver indisponível
      return NextResponse.json({
        visitantes: [],
        lojasVisitas: [],
        totalVisitantes: 0,
        lojasComVisitas: 0,
      })
    }

    // Buscar todas as lojas
    const lojasRaw = await Loja.find().lean()
    // Conversão segura de tipo usando unknown como intermediário
    const lojas = lojasRaw as unknown as LojaDoc[]

    const lojasMap = new Map(lojas.map((loja) => [loja._id.toString(), loja.nome]))

    // Buscar todos os visitantes
    const visitantesRaw = await VisitanteEvento.find().sort({ dataRegistro: -1 }).lean()
    // Conversão segura de tipo usando unknown como intermediário
    const visitantes = visitantesRaw as unknown as VisitanteDoc[]

    // Formatar dados dos visitantes
    const visitantesFormatados = visitantes.map((v) => ({
      id: v._id.toString(),
      nome: v.nome,
      email: v.email,
      telefone: v.telefone,
      cpf: v.cpf,
      dataRegistro: v.dataRegistro,
      visitasLojas: v.visitasLojas.map((vl: VisitaLoja) => ({
        lojaId: vl.lojaId.toString(),
        lojaNome: lojasMap.get(vl.lojaId.toString()),
        dataVisita: vl.dataVisita,
      })),
    }))

    // Contar visitas por loja
    const visitasPorLoja = new Map()

    visitantes.forEach((visitante) => {
      visitante.visitasLojas.forEach((visita: VisitaLoja) => {
        const lojaId = visita.lojaId.toString()
        visitasPorLoja.set(lojaId, (visitasPorLoja.get(lojaId) || 0) + 1)
      })
    })

    // Formatar dados de visitas por loja
    const lojasVisitas = lojas.map((loja) => ({
      id: loja._id.toString(),
      nome: loja.nome,
      visitas: visitasPorLoja.get(loja._id.toString()) || 0,
    }))

    // Ordenar por número de visitas (decrescente)
    lojasVisitas.sort((a, b) => b.visitas - a.visitas)

    // Contar lojas com pelo menos uma visita
    const lojasComVisitas = lojasVisitas.filter((loja) => loja.visitas > 0).length

    return NextResponse.json({
      visitantes: visitantesFormatados,
      lojasVisitas,
      totalVisitantes: visitantes.length,
      lojasComVisitas,
    })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json({ error: "Erro ao buscar métricas" }, { status: 500 })
  }
}

