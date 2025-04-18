import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { GridFSBucket, ObjectId } from "mongodb"

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de imagem inválido" }, { status: 400 })
    }

    // Conectar ao MongoDB
    const { db } = await connectToDatabase()
    const bucket = new GridFSBucket(db, {
      bucketName: "imagens",
    })

    // Buscar os metadados do arquivo
    const file = await db.collection("imagens.files").findOne({ _id: new ObjectId(id) })

    if (!file) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    // Criar um stream para ler o arquivo
    const downloadStream = bucket.openDownloadStream(new ObjectId(id))

    // Coletar os chunks em um buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk))
    }

    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Erro ao buscar imagem:", error)
    return NextResponse.json({ error: "Erro ao buscar imagem" }, { status: 500 })
  }
}
