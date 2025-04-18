import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import Promocao from "@/lib/models/promocao"
import Loja from "@/lib/models/loja"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // Esperar a resolução do parâmetro 'params'

    await connectToDatabase()

    // Buscar promoção
    const promocao = await Promocao.findById(id).lean()

    if (!promocao) {
      return NextResponse.json({ error: "Promoção não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ promocao })
  } catch (error) {
    console.error("Erro ao buscar promoção:", error)
    return NextResponse.json({ error: "Erro ao buscar promoção" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params // Esperar a resolução do parâmetro 'params'
    const data = await request.json()
    const {
      titulo,
      descricao,
      imagem,
      dataInicio,
      dataFim,
      desconto,
      tipoDesconto,
      codigoPromocional,
      produtosAplicaveis,
      categoriasAplicaveis,
      limitePorCliente,
      quantidadeDisponivel,
      destaque,
      ativo,
    } = data

    if (!titulo || !dataInicio || !dataFim || !desconto) {
      return NextResponse.json({ error: "Campos obrigatórios não preenchidos" }, { status: 400 })
    }

    await connectToDatabase()

    // Buscar promoção
    const promocao = await Promocao.findById(id)

    if (!promocao) {
      return NextResponse.json({ error: "Promoção não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à loja
    const loja = await Loja.findOne({
      _id: promocao.lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para editar esta promoção" }, { status: 403 })
    }

    // Atualizar promoção
    promocao.titulo = titulo
    promocao.descricao = descricao
    promocao.imagem = imagem
    promocao.dataInicio = new Date(dataInicio)
    promocao.dataFim = new Date(dataFim)
    promocao.desconto = desconto
    promocao.tipoDesconto = tipoDesconto || "percentual"
    promocao.codigoPromocional = codigoPromocional
    promocao.produtosAplicaveis = produtosAplicaveis
    promocao.categoriasAplicaveis = categoriasAplicaveis
    promocao.limitePorCliente = limitePorCliente
    promocao.quantidadeDisponivel = quantidadeDisponivel
    promocao.destaque = destaque || false

    if (ativo !== undefined) {
      promocao.ativo = ativo
    }

    await promocao.save()

    return NextResponse.json({
      message: "Promoção atualizada com sucesso",
      promocao,
    })
  } catch (error) {
    console.error("Erro ao atualizar promoção:", error)
    return NextResponse.json({ error: "Erro ao atualizar promoção" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params // Esperar a resolução do parâmetro 'params'

    await connectToDatabase()

    // Buscar promoção
    const promocao = await Promocao.findById(id)

    if (!promocao) {
      return NextResponse.json({ error: "Promoção não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à loja
    const loja = await Loja.findOne({
      _id: promocao.lojaId,
      usuarioId: session.user.id,
    })

    if (!loja && session.user.role !== "admin") {
      return NextResponse.json({ error: "Você não tem permissão para excluir esta promoção" }, { status: 403 })
    }

    // Excluir promoção (soft delete)
    promocao.ativo = false
    await promocao.save()

    return NextResponse.json({
      message: "Promoção excluída com sucesso",
    })
  } catch (error) {
    console.error("Erro ao excluir promoção:", error)
    return NextResponse.json({ error: "Erro ao excluir promoção" }, { status: 500 })
  }
}
