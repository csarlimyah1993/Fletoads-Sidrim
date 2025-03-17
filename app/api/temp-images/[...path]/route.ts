import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Obter o caminho completo do arquivo
    const filePath = path.join(process.cwd(), "public", "temp-uploads", ...params.path)

    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    // Ler o arquivo
    const fileBuffer = await readFile(filePath)

    // Determinar o tipo MIME com base na extensão do arquivo
    const extension = path.extname(filePath).toLowerCase()
    let contentType = "application/octet-stream"

    if (extension === ".jpg" || extension === ".jpeg") {
      contentType = "image/jpeg"
    } else if (extension === ".png") {
      contentType = "image/png"
    } else if (extension === ".gif") {
      contentType = "image/gif"
    } else if (extension === ".webp") {
      contentType = "image/webp"
    }

    // Retornar o arquivo com o tipo MIME apropriado
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Erro ao servir imagem temporária:", error)
    return new NextResponse("Erro ao servir imagem", { status: 500 })
  }
}

