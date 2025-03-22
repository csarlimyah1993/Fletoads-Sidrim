import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const tipo = formData.get("tipo") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!tipo) {
      return NextResponse.json({ error: "Tipo de imagem não especificado" }, { status: 400 })
    }

    // Obter o token do Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.sidrinho_READ_WRITE_TOKEN

    if (!token) {
      console.error("Token do Vercel Blob não encontrado")
      return NextResponse.json({ error: "Configuração de armazenamento de imagens não disponível" }, { status: 500 })
    }

    // Fazer upload da imagem para o Vercel Blob
    const filename = `${tipo}-${uuidv4()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
      token: token,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

