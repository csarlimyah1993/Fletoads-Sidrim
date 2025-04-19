import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const formData = await request.formData()
    const file = formData.get("file") as File
    const tipo = formData.get("tipo") as string
    const lojaId = formData.get("lojaId") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!tipo || !["logo", "banner"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de imagem inválido" }, { status: 400 })
    }

    if (!lojaId) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se a loja pertence ao usuário
    let loja = null

    try {
      // Tentar com ObjectId
      const lojaObjectId = new ObjectId(lojaId)
      loja = await db.collection("lojas").findOne({ _id: lojaObjectId })
    } catch (error) {
      return NextResponse.json({ error: "ID da loja inválido" }, { status: 400 })
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se a loja pertence ao usuário
    let pertenceAoUsuario = false

    if (loja.usuarioId) {
      if (typeof loja.usuarioId === "string") {
        pertenceAoUsuario = loja.usuarioId === userId
      } else {
        pertenceAoUsuario = loja.usuarioId.toString() === userId
      }
    }

    if (loja.userId && !pertenceAoUsuario) {
      if (typeof loja.userId === "string") {
        pertenceAoUsuario = loja.userId === userId
      } else {
        pertenceAoUsuario = loja.userId.toString() === userId
      }
    }

    if (!pertenceAoUsuario) {
      return NextResponse.json({ error: "Loja não pertence ao usuário" }, { status: 403 })
    }

    // Obter o token do Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.sidrinho_READ_WRITE_TOKEN

    if (!token) {
      console.error("Token do Vercel Blob não encontrado")
      return NextResponse.json({ error: "Configuração de armazenamento de imagens não disponível" }, { status: 500 })
    }

    // Fazer upload da imagem para o Vercel Blob
    const filename = `loja-${lojaId}-${tipo}-${uuidv4()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
      token: token,
    })

    // Atualizar a loja com a nova imagem
    const updateField = tipo === "logo" ? "logo" : "banner"

    await db
      .collection("lojas")
      .updateOne({ _id: loja._id }, { $set: { [updateField]: blob.url, dataAtualizacao: new Date() } })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

