import { type NextRequest, NextResponse } from "next/server"
import Panfleto from "@/lib/models/panfleto"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const categoria = url.searchParams.get("categoria")
    const status = url.searchParams.get("status")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const query: any = {}

    if (categoria) query.categoria = categoria
    if (status) query.status = status

    const skip = (page - 1) * limit

    const panfletos = await Panfleto.find(query).sort({ dataPublicacao: -1 }).skip(skip).limit(limit)

    const total = await Panfleto.countDocuments(query)

    return NextResponse.json({
      panfletos,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar panfletos:", error)
    return NextResponse.json({ error: "Erro ao buscar panfletos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    const novoPanfleto = new Panfleto({
      ...body,
      autor: session.user.email,
    })

    await novoPanfleto.save()

    return NextResponse.json(novoPanfleto, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar panfleto:", error)
    return NextResponse.json({ error: "Erro ao criar panfleto" }, { status: 500 })
  }
}

