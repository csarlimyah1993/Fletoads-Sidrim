import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import fs from "fs"
import os from "os"

// Função para salvar temporariamente o arquivo no servidor
async function saveTempFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Criar um nome de arquivo único
  const tempDir = path.join(os.tmpdir(), "fletoads-uploads")

  // Garantir que o diretório existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const filename = path.join(tempDir, `${uuidv4()}-${file.name}`)
  fs.writeFileSync(filename, buffer)

  return filename
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF." }, { status: 400 })
    }

    // Verificar tamanho do arquivo (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. O tamanho máximo é 5MB." }, { status: 400 })
    }

    // Gerar nome de arquivo único
    const ext = file.name.split(".").pop()
    const filename = `${session.user.id}-${uuidv4()}.${ext}`

    let url = ""
    let isTempUrl = false

    try {
      // Tentar fazer upload para o Vercel Blob
      console.log("Tentando fazer upload para o Vercel Blob...")
      const blob = await put(filename, file, {
        access: "public",
        contentType: file.type,
        metadata: {
          userId: session.user.id,
          originalName: file.name,
        },
      })

      url = blob.url
      console.log("Upload para o Vercel Blob concluído com sucesso:", url)
    } catch (error) {
      console.error("Erro ao fazer upload para o Vercel Blob:", error)

      // Fallback: salvar localmente e servir via API
      console.log("Usando fallback para armazenamento local...")
      const tempFilePath = await saveTempFile(file)
      const tempFileName = path.basename(tempFilePath)
      url = `${request.headers.get("origin")}/api/temp-images/${tempFileName}`
      isTempUrl = true

      console.log("Arquivo salvo localmente:", tempFilePath)
      console.log("URL temporária:", url)
    }

    return NextResponse.json({
      success: true,
      url,
      isTempUrl,
      message: isTempUrl
        ? "Imagem salva temporariamente. Considere configurar o Vercel Blob para armazenamento permanente."
        : "Upload concluído com sucesso!",
    })
  } catch (error) {
    console.error("Erro no processamento do upload:", error)
    return NextResponse.json(
      { error: `Erro ao processar o upload: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

