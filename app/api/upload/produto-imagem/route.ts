import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { put, del } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import { ObjectId, type Document } from "mongodb"

// Definir interfaces para os tipos do MongoDB
interface ProdutoDocument extends Document {
  _id: ObjectId
  id?: string
  codigo?: string
  lojaId: string
  imagens?: string[]
  [key: string]: any
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verificar o plano do usuário
    const userId = session.user.id
    const { db } = await connectToDatabase()

    let usuario = null
    try {
      // Tentar com ObjectId
      const objectId = new ObjectId(userId)
      usuario = await db.collection("usuarios").findOne({ _id: objectId })
    } catch (error) {
      // Se falhar, tentar com string
      usuario = await db.collection("usuarios").findOne({
        $or: [{ email: userId }, { username: userId }],
      })
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar o plano e seus limites
    const planoId = usuario.plano || usuario.metodosPagemento?.plano || "gratis"

    // Obter o número de imagens permitidas pelo plano
    let imagensPorProduto = 1 // Padrão para plano gratuito

    if (planoId === "start") imagensPorProduto = 2
    else if (planoId === "basico") imagensPorProduto = 3
    else if (planoId === "completo") imagensPorProduto = 3
    else if (planoId === "premium" || planoId === "empresarial") imagensPorProduto = 5

    // Obter o ID do produto
    const formData = await request.formData()
    const file = formData.get("file") as File
    const produtoId = formData.get("produtoId") as string

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    if (!produtoId) {
      return NextResponse.json({ error: "ID do produto não fornecido" }, { status: 400 })
    }

    // Verificar se o produto existe e pertence ao usuário
    let produto: ProdutoDocument | null = null
    let produtoObjectId: ObjectId | null = null
    let produtoFilter: any = null

    try {
      // Tentar com ObjectId
      produtoObjectId = new ObjectId(produtoId)
      produtoFilter = { _id: produtoObjectId }
      produto = (await db.collection("produtos").findOne(produtoFilter)) as ProdutoDocument | null
    } catch (error) {
      // Se falhar, tentar com outras formas de identificação
      produtoFilter = {
        $or: [{ id: produtoId }, { codigo: produtoId }],
      }
      produto = (await db.collection("produtos").findOne(produtoFilter)) as ProdutoDocument | null
    }

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o produto pertence a uma loja do usuário
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    const lojaIds = lojas.map((loja) => loja._id.toString())

    if (!lojaIds.includes(produto.lojaId)) {
      return NextResponse.json({ error: "Produto não pertence ao usuário" }, { status: 403 })
    }

    // Verificar quantas imagens o produto já tem
    const imagensAtuais = produto.imagens || []

    if (imagensAtuais.length >= imagensPorProduto) {
      return NextResponse.json(
        {
          error: `Seu plano permite apenas ${imagensPorProduto} imagem(ns) por produto`,
        },
        { status: 403 },
      )
    }

    // Obter o token do Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.sidrinho_READ_WRITE_TOKEN

    if (!token) {
      console.error("Token do Vercel Blob não encontrado")
      return NextResponse.json({ error: "Configuração de armazenamento de imagens não disponível" }, { status: 500 })
    }

    // Fazer upload da imagem para o Vercel Blob
    const filename = `${uuidv4()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
      token: token,
    })

    // Atualizar o produto com a nova imagem
    const novaImagem = blob.url

    // Usar o ID correto para atualizar o produto
    try {
      // Garantir que estamos usando o ObjectId correto
      const produtoId = produto._id

      // Atualizar o produto usando $set com o array completo
      const imagensAtualizadas = [...imagensAtuais, novaImagem]

      await db.collection("produtos").updateOne({ _id: produtoId }, { $set: { imagens: imagensAtualizadas } })
    } catch (updateError) {
      console.error("Erro ao atualizar produto:", updateError)

      // Tentar uma abordagem alternativa se a primeira falhar
      try {
        // Usar o filtro que funcionou anteriormente
        await db.collection("produtos").updateOne(
          produtoFilter,
          // @ts-ignore - Ignorar erro de tipo aqui
          { $push: { imagens: novaImagem } },
        )
      } catch (fallbackError) {
        console.error("Erro na abordagem alternativa:", fallbackError)
        throw updateError // Re-lançar o erro original
      }
    }

    return NextResponse.json({
      success: true,
      url: novaImagem,
    })
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { produtoId, imageUrl } = await request.json()

    if (!produtoId || !imageUrl) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verificar se o produto existe e pertence ao usuário
    let produto: ProdutoDocument | null = null
    let produtoFilter: any = null

    try {
      // Tentar com ObjectId
      const produtoObjectId = new ObjectId(produtoId)
      produtoFilter = { _id: produtoObjectId }
      produto = (await db.collection("produtos").findOne(produtoFilter)) as ProdutoDocument | null
    } catch (error) {
      // Se falhar, tentar com outras formas de identificação
      produtoFilter = {
        $or: [{ id: produtoId }, { codigo: produtoId }],
      }
      produto = (await db.collection("produtos").findOne(produtoFilter)) as ProdutoDocument | null
    }

    if (!produto) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }

    // Verificar se o produto pertence a uma loja do usuário
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    const lojaIds = lojas.map((loja) => loja._id.toString())

    if (!lojaIds.includes(produto.lojaId)) {
      return NextResponse.json({ error: "Produto não pertence ao usuário" }, { status: 403 })
    }

    // Remover a imagem do produto usando uma abordagem alternativa
    try {
      // Filtrar a imagem a ser removida
      const imagensAtuais = produto.imagens || []
      const imagensAtualizadas = imagensAtuais.filter((img) => img !== imageUrl)

      // Atualizar o produto com o novo array de imagens
      await db.collection("produtos").updateOne({ _id: produto._id }, { $set: { imagens: imagensAtualizadas } })
    } catch (updateError) {
      console.error("Erro ao atualizar produto:", updateError)

      // Tentar uma abordagem alternativa com o filtro que funcionou
      try {
        await db.collection("produtos").updateOne(
          produtoFilter,
          // @ts-ignore - Ignorar erro de tipo aqui
          { $pull: { imagens: imageUrl } },
        )
      } catch (fallbackError) {
        console.error("Erro na abordagem alternativa:", fallbackError)
        throw updateError // Re-lançar o erro original
      }
    }

    // Obter o token do Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN || process.env.sidrinho_READ_WRITE_TOKEN

    // Tentar excluir o blob se possível
    try {
      // Extrair o nome do arquivo da URL
      const filename = imageUrl.split("/").pop()
      if (filename && token) {
        await del(filename, { token })
      }
    } catch (blobError) {
      console.error("Erro ao excluir blob:", blobError)
      // Continuar mesmo se falhar a exclusão do blob
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir imagem:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

