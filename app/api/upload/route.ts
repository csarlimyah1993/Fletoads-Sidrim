import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o ID do usuário da sessão
    const userId = session.user.id

    // Verificar se o formulário contém um arquivo
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar o tipo de arquivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "O arquivo deve ser uma imagem" }, { status: 400 })
    }

    // Verificar o tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "O arquivo é muito grande. O tamanho máximo é 5MB" }, { status: 400 })
    }

    // Gerar um nome único para o arquivo
    const fileExtension = file.name.split(".").pop()
    const fileName = `${userId}/${uuidv4()}.${fileExtension}`

    console.log("Iniciando upload para Vercel Blob:", fileName)

    // Fazer upload do arquivo para o Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("Upload concluído:", blob.url)

    // Retornar a URL do arquivo
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Erro no upload de arquivo:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido no upload de arquivo" },
      { status: 500 },
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
