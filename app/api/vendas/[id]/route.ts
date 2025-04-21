import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Tipos para os parâmetros da rota (com Promise)
interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Aguardar a resolução da Promise dos parâmetros
    const { id: vendaId } = await context.params

    const { db } = await connectToDatabase()

    console.log("Buscando venda com ID:", vendaId)

    let objectId: ObjectId | null = null
    try {
      objectId = new ObjectId(vendaId)
      console.log("ID convertido para ObjectId com sucesso")
    } catch (err) {
      console.log("Erro ao converter ID para ObjectId:", err)
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    const venda = await db.collection("vendas").findOne({ _id: objectId })

    if (!venda) {
      return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })
    }

    let cliente = null
    if (venda.clienteId) {
      try {
        cliente = await db.collection("clientes").findOne({
          _id: new ObjectId(venda.clienteId.toString()),
        })
      } catch (err) {
        console.log("Erro ao buscar cliente:", err)
      }
    }

    const produtoIds = venda.itens?.map((item: any) => item.produtoId) || []
    const produtos =
      produtoIds.length > 0
        ? await db
            .collection("produtos")
            .find({
              _id: {
                $in: produtoIds
                  .map((id: any) => {
                    try {
                      return new ObjectId(id.toString())
                    } catch (err) {
                      return null
                    }
                  })
                  .filter(Boolean),
              },
            })
            .toArray()
        : []

    const produtosMap: Record<string, any> = {}
    produtos.forEach((produto) => {
      produtosMap[produto._id.toString()] = produto
    })

    const itensEnriquecidos =
      venda.itens?.map((item: any) => {
        const produto = item.produtoId ? produtosMap[item.produtoId.toString()] : null
        return {
          ...item,
          produto: produto
            ? {
                _id: produto._id.toString(),
                nome: produto.nome,
                preco: produto.preco,
                imagem: produto.imagem,
              }
            : undefined,
        }
      }) || []

    const vendaSerializada = {
      ...venda,
      _id: venda._id?.toString(),
      clienteId: venda.clienteId?.toString(),
      lojaId: venda.lojaId?.toString(),
      dataCriacao: venda.dataCriacao?.toISOString() || null,
      dataAtualizacao: venda.dataAtualizacao?.toISOString() || null,
      cliente: cliente
        ? {
            _id: cliente._id.toString(),
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone,
          }
        : null,
      itens: itensEnriquecidos,
    }

    return NextResponse.json(vendaSerializada)
  } catch (error) {
    console.error("Erro ao buscar venda:", error)
    return NextResponse.json({ error: "Erro ao buscar venda" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Aguardar a resolução da Promise dos parâmetros
    const { id: vendaId } = await context.params
    const data = await request.json()

    const { db } = await connectToDatabase()

    let objectId: ObjectId | null = null
    try {
      objectId = new ObjectId(vendaId)
    } catch (err) {
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    const venda = await db.collection("vendas").findOne({ _id: objectId })
    if (!venda) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })

    const camposPermitidos = ["status", "formaPagamento", "observacao"]
    const atualizacao: Record<string, any> = {}

    for (const campo of camposPermitidos) {
      if (data[campo] !== undefined) {
        atualizacao[campo] = data[campo]
      }
    }

    atualizacao["dataAtualizacao"] = new Date()

    await db.collection("vendas").updateOne({ _id: objectId }, { $set: atualizacao })

    return NextResponse.json({ success: true, message: "Venda atualizada com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar venda:", error)
    return NextResponse.json({ error: "Erro ao atualizar venda" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Aguardar a resolução da Promise dos parâmetros
    const { id: vendaId } = await context.params

    const { db } = await connectToDatabase()

    let objectId: ObjectId | null = null
    try {
      objectId = new ObjectId(vendaId)
    } catch (err) {
      return NextResponse.json({ error: "ID de venda inválido" }, { status: 400 })
    }

    const venda = await db.collection("vendas").findOne({ _id: objectId })
    if (!venda) return NextResponse.json({ error: "Venda não encontrada" }, { status: 404 })

    await db
      .collection("vendas")
      .updateOne({ _id: objectId }, { $set: { status: "cancelada", dataAtualizacao: new Date() } })

    for (const item of venda.itens || []) {
      if (item.produtoId && item.quantidade) {
        try {
          await db
            .collection("produtos")
            .updateOne({ _id: new ObjectId(item.produtoId.toString()) }, { $inc: { estoque: item.quantidade } })
        } catch (err) {
          console.log("Erro ao atualizar estoque do produto:", err)
        }
      }
    }

    if (venda.clienteId && venda.total) {
      try {
        await db.collection("clientes").updateOne(
          { _id: new ObjectId(venda.clienteId.toString()) },
          {
            $inc: {
              totalGasto: -venda.total,
              numeroPedidos: -1,
            },
          },
        )
      } catch (err) {
        console.log("Erro ao atualizar estatísticas do cliente:", err)
      }
    }

    return NextResponse.json({ success: true, message: "Venda cancelada com sucesso" })
  } catch (error) {
    console.error("Erro ao cancelar venda:", error)
    return NextResponse.json({ error: "Erro ao cancelar venda" }, { status: 500 })
  }
}