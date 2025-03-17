import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Ensure temp directory exists
const ensureTempDir = async (userId: string, tipo: string) => {
  const tempDir = path.join(process.cwd(), "public", "temp-uploads", userId, tipo)

  try {
    await mkdir(tempDir, { recursive: true })
    console.log("Temp directory created or already exists:", tempDir)
  } catch (error) {
    console.error("Error creating temp directory:", error)
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
    const tipo = formData.get("tipo") as string // 'logo', 'banner' ou 'produto'

    // Log received data for debugging
    console.log("Upload request received:", {
      fileExists: !!file,
      tipo,
      fileType: file?.type,
      fileSize: file?.size,
    })

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!tipo || !["logo", "banner", "produto"].includes(tipo)) {
      return NextResponse.json({ error: "Tipo de imagem inválido" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Tipo de arquivo não permitido. Use JPEG, PNG, WEBP ou GIF. Tipo recebido: ${file.type}`,
        },
        { status: 400 },
      )
    }

    // Verificar tamanho do arquivo (limite de 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande. O tamanho máximo é 5MB." }, { status: 400 })
    }

    // Criar um nome de arquivo único
    const userId = session.user.id
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const uniqueId = uuidv4().substring(0, 8)
    const filename = `${userId}_${tipo}_${timestamp}_${uniqueId}.${fileExtension}`

    // Usar diretamente o armazenamento local
    try {
      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Ensure temp directory exists
      const tempDir = await ensureTempDir(userId, tipo)
      const filePath = path.join(tempDir, filename)

      // Save file to disk
      await writeFile(filePath, buffer)
      console.log("File saved to:", filePath)

      // Generate URL for the saved file
      const baseUrl = process.env.NEXTAUTH_URL || req.headers.get("origin") || "http://localhost:3000"
      const fileUrl = `${baseUrl}/temp-uploads/${userId}/${tipo}/${filename}`

      console.log("Local storage successful:", { fileUrl })

      return NextResponse.json({
        success: true,
        url: fileUrl,
      })
    } catch (error) {
      console.error("Local storage failed:", error)
      return NextResponse.json(
        {
          error: "Falha no sistema de armazenamento",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar o upload da imagem",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

