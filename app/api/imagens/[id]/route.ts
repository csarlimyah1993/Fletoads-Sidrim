import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { GridFSBucket, ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "ID de imagem inválido" }, { status: 400 })
    }

    // Conectar ao MongoDB
    const { db } = await connectToDatabase()
    const bucket = new GridFSBucket(db, {
      bucketName: "imagens",
    })

    // Buscar os metadados do arquivo
    const files = await db.collection("imagens.files").findOne({
      _id: new ObjectId(id),
    })

    if (!files) {
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 })
    }

    // Criar um stream para ler o arquivo
    const downloadStream = bucket.openDownloadStream(new ObjectId(id))

    // Coletar os chunks em um buffer
    const chunks: Buffer[] = []
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk))
    }

    // Combinar os chunks em um único buffer
    const buffer = Buffer.concat(chunks)

    // Retornar a imagem com o tipo de conteúdo correto
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": files.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Erro ao buscar imagem:", error)
    return NextResponse.json({ error: "Erro ao buscar imagem" }, { status: 500 })
  }
}

