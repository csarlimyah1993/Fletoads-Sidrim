import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { allowedFileTypes, maxFileSize } from "@/blob.config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Ensure temp directory exists
const ensureTempDir = async () => {
  const fs = await import("fs/promises")
  const tempDir = path.join(process.cwd(), "public", "temp-uploads")

  try {
    await fs.access(tempDir)
  } catch (error) {
    await fs.mkdir(tempDir, { recursive: true })
  }

  return tempDir
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const tipo = formData.get("tipo") as string // 'logo' ou 'banner'

    console.log("Fallback upload request received:", {
      fileExists: !!file,
      tipo,
      fileType: file?.type,
      fileSize: file?.size,
    })

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!tipo || (tipo !== "logo" && tipo !== "banner")) {
      return NextResponse.json({ error: "Tipo de imagem inválido" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!allowedFileTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF. Tipo recebido: ${file.type}`,
        },
        { status: 400 },
      )
    }

    // Verificar tamanho do arquivo (limite de 5MB)
    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "Arquivo muito grande. O tamanho máximo é 5MB." }, { status: 400 })
    }

    // Criar um nome de arquivo único
    const userId = session.user.id
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const uniqueId = uuidv4().substring(0, 8)
    const filename = `${userId}_${tipo}_${timestamp}_${uniqueId}.${fileExtension}`

    // Ensure temp directory exists
    const tempDir = await ensureTempDir()
    const filePath = path.join(tempDir, filename)

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save file to disk
    await writeFile(filePath, buffer)

    // Generate URL for the saved file
    const baseUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000"
    const fileUrl = `${baseUrl}/api/temp-images/${filename}`

    console.log("Fallback upload successful:", { fileUrl })

    return NextResponse.json({
      success: true,
      url: fileUrl,
    })
  } catch (error) {
    console.error("Erro no fallback upload:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar o upload da imagem no sistema de fallback",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

