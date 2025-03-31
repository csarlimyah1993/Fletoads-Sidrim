import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ status: "error", message: "Não autorizado" }, { status: 401 })
    }

    // Construir a query de busca
    const query: any = {}
    if (search) {
      query.$or = [{ nome: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    // Obter o modelo de usuário
    const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", new mongoose.Schema({}, { strict: false }))

    // Contar total de documentos para paginação
    const total = await Usuario.countDocuments(query)

    // Construir o objeto de ordenação
    const sortObj: any = {}
    sortObj[sort] = order === "asc" ? 1 : -1

    // Buscar usuários com paginação e ordenação
    const usuarios = await Usuario.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      status: "success",
      data: {
        usuarios,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { status: "error", message: "Failed to fetch users", error: (error as Error).message },
      { status: 500 },
    )
  }
}

