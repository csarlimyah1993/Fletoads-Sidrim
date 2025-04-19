import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import VisitanteEvento from "@/lib/models/visitante-evento"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"
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
  dataRegistro: Date
  visitasLojas: VisitaLoja[]
  [key: string]: any
}

interface UsuarioDoc {
  _id: mongoose.Types.ObjectId
  lojaId?: mongoose.Types.ObjectId
  [key: string]: any
}

// Interface para o retorno da API
interface LojaVisitaStats {
  id: string
  nome: string
  visitas: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
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
        visitasMinhaLoja: 0,
      })
    }

    // Verificar se é admin
    const isAdmin = session.user.role === "admin"

    // Buscar loja do usuário (se não for admin)
    let minhaLojaId: mongoose.Types.ObjectId | null = null
    if (!isAdmin && userId) {
      const usuarioRaw = await Usuario.findById(userId)
      const usuario = usuarioRaw as unknown as UsuarioDoc | null
      if (usuario?.lojaId) {
        minhaLojaId = usuario.lojaId
      }
    }

    // Buscar total de visitantes
    const totalVisitantes = await VisitanteEvento.countDocuments()

    // Buscar visitantes da minha loja
    let visitantes: VisitanteDoc[] = []
    let visitasMinhaLoja = 0

    if (isAdmin) {
      // Admin vê todos os visitantes
      const visitantesRaw = await VisitanteEvento.find().sort({ dataRegistro: -1 }).limit(100).lean()
      visitantes = visitantesRaw as unknown as VisitanteDoc[]
    } else if (minhaLojaId) {
      // Usuário comum vê apenas visitantes da sua loja
      const visitantesRaw = await VisitanteEvento.find({
        "visitasLojas.lojaId": minhaLojaId,
      })
        .sort({ dataRegistro: -1 })
        .limit(100)
        .lean()
      visitantes = visitantesRaw as unknown as VisitanteDoc[]

      visitasMinhaLoja = visitantes.length
    }

    // Formatar dados dos visitantes
    const visitantesFormatados = visitantes.map((v) => ({
      id: v._id.toString(),
      nome: v.nome,
      email: v.email,
      telefone: v.telefone,
      dataRegistro: v.dataRegistro,
      visitasLojas: v.visitasLojas.map((vl: VisitaLoja) => ({
        lojaId: vl.lojaId.toString(),
        dataVisita: vl.dataVisita,
      })),
    }))

    // Buscar estatísticas por loja
    let lojasVisitas: LojaVisitaStats[] = []

    if (isAdmin) {
      // Contar visitas por loja
      const lojasRaw = await Loja.find().lean()
      const lojas = lojasRaw as unknown as LojaDoc[]

      // Mapear lojas com contagem de visitas
      lojasVisitas = await Promise.all(
        lojas.map(async (loja) => {
          const visitas = await VisitanteEvento.countDocuments({
            "visitasLojas.lojaId": loja._id,
          })

          return {
            id: loja._id.toString(),
            nome: loja.nome,
            visitas,
          }
        }),
      )

      // Ordenar por número de visitas (decrescente)
      lojasVisitas.sort((a, b) => b.visitas - a.visitas)
    }

    return NextResponse.json({
      visitantes: visitantesFormatados,
      lojasVisitas,
      totalVisitantes,
      visitasMinhaLoja,
    })
  } catch (error) {
    console.error("Erro ao buscar métricas:", error)
    return NextResponse.json({ error: "Erro ao buscar métricas" }, { status: 500 })
  }
}

