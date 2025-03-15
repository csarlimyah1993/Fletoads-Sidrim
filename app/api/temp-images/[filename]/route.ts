import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"
import os from "os"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // Verificar se o nome do arquivo é válido (evitar path traversal)
    if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Nome de arquivo inválido" }, { status: 400 })
    }

    const tempDir = path.join(os.tmpdir(), "fletoads-uploads")
    const filePath = path.join(tempDir, filename)

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath)

    // Determinar o tipo MIME com base na extensão
    const ext = path.extname(filename).toLowerCase()
    let contentType = "application/octet-stream"

    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".gif") contentType = "image/gif"
    else if (ext === ".webp") contentType = "image/webp"

    // Retornar o arquivo com o tipo MIME apropriado
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache por 24 horas
      },
    })
  } catch (error) {
    console.error("Erro ao servir imagem temporária:", error)
    return NextResponse.json({ error: "Erro ao servir imagem" }, { status: 500 })
  }
}

