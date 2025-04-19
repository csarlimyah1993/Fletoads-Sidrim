import { type NextRequest, NextResponse } from "next/server"
import Campanha from "@/lib/models/campanha"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const query: any = {}

    if (status) query.status = status

    const skip = (page - 1) * limit

    const campanhas = await Campanha.find(query)
      .sort({ dataInicio: -1 })
      .skip(skip)
      .limit(limit)
      .populate("responsavel", "nome email")
      .populate("panfletos", "titulo imagem")
      .populate("clientes", "nome empresa")

    const total = await Campanha.countDocuments(query)

    return NextResponse.json({
      campanhas,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error)
    return NextResponse.json({ error: "Erro ao buscar campanhas" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const novaCampanha = new Campanha({
      ...body,
      responsavel: session.user.id,
    })

    await novaCampanha.save()

    return NextResponse.json(novaCampanha, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar campanha:", error)
    return NextResponse.json({ error: "Erro ao criar campanha" }, { status: 500 })
  }
}

