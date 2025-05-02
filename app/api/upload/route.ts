import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Lista de tipos de arquivo permitidos
    const allowedTypes = [
      // Imagens
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      // Documentos
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // Word
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // Excel
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint
      "text/plain",
      "text/csv",
      "text/html",
      "text/rtf",
      "application/zip",
      "application/x-zip-compressed",
    ]

    // Verificar o tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido: ${file.type}. Tipos permitidos: imagens, PDF, Word, Excel, PowerPoint, texto e ZIP.`,
        },
        { status: 400 },
      )
    }

    // Gerar um nome único para o arquivo
    const fileName = `${session.user.id}/${uuidv4()}-${file.name}`

    // Fazer upload para o Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: "public",
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Erro ao fazer upload:", error)
    return NextResponse.json({ error: "Erro ao fazer upload do arquivo" }, { status: 500 })
  }
}
