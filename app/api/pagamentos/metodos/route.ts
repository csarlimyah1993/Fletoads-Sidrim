import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { stripe } from "@/lib/stripe"
import { ObjectId } from "mongodb"
import type Stripe from "stripe"

// Define interfaces for our data structures
interface PixKey {
  _id: ObjectId
  chave: string
  tipo: string
  nome: string
  dataCriacao: Date
  dataAtualizacao?: Date
}

interface UserMetodosPagamento {
  pix?: PixKey[]
}

interface Usuario {
  _id: ObjectId
  email: string
  nome?: string
  stripeCustomerId?: string
  metodosPagemento?: UserMetodosPagamento
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const usuario = (await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })) as Usuario | null

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Obter métodos de pagamento do Stripe
    let cartoes: Stripe.PaymentMethod[] = []
    if (usuario.stripeCustomerId) {
      try {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: usuario.stripeCustomerId,
          type: "card",
        })
        cartoes = paymentMethods.data
      } catch (error) {
        console.error("Erro ao buscar cartões do Stripe:", error)
      }
    }

    // Obter PIX cadastrados
    const pixKeys = usuario.metodosPagemento?.pix || []

    return NextResponse.json({
      cartoes,
      pix: pixKeys,
    })
  } catch (error) {
    console.error("Erro ao buscar métodos de pagamento:", error)
    return NextResponse.json({ error: "Erro ao buscar métodos de pagamento" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo, dados } = await req.json()

    const { db } = await connectToDatabase()
    const usuario = (await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })) as Usuario | null

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (tipo === "cartao") {
      // Verificar se o paymentMethodId foi fornecido
      if (!dados.paymentMethodId) {
        return NextResponse.json({ error: "ID do método de pagamento não fornecido" }, { status: 400 })
      }

      // Verificar se o usuário tem um ID de cliente no Stripe
      if (!usuario.stripeCustomerId) {
        // Criar cliente no Stripe
        const customer = await stripe.customers.create({
          email: usuario.email,
          name: usuario.nome || usuario.email,
        })

        // Atualizar o usuário com o ID do cliente Stripe
        await db
          .collection("usuarios")
          .updateOne({ _id: new ObjectId(session.user.id) }, { $set: { stripeCustomerId: customer.id } })

        usuario.stripeCustomerId = customer.id
      }

      // Anexar o método de pagamento ao cliente
      await stripe.paymentMethods.attach(dados.paymentMethodId, {
        customer: usuario.stripeCustomerId,
      })

      // Definir como método de pagamento padrão se for o primeiro
      const paymentMethods = await stripe.paymentMethods.list({
        customer: usuario.stripeCustomerId,
        type: "card",
      })

      if (paymentMethods.data.length === 1) {
        await stripe.customers.update(usuario.stripeCustomerId, {
          invoice_settings: {
            default_payment_method: dados.paymentMethodId,
          },
        })
      }

      // Obter os detalhes do método de pagamento
      const paymentMethod = await stripe.paymentMethods.retrieve(dados.paymentMethodId)

      return NextResponse.json({
        success: true,
        message: "Cartão adicionado com sucesso",
        paymentMethod,
      })
    } else if (tipo === "pix") {
      // Validar dados do PIX
      if (!dados.chave || !dados.tipo || !dados.nome) {
        return NextResponse.json({ error: "Dados incompletos para chave PIX" }, { status: 400 })
      }

      // Inicializar o array de PIX se não existir
      if (!usuario.metodosPagemento) {
        await db
          .collection("usuarios")
          .updateOne({ _id: new ObjectId(session.user.id) }, { $set: { metodosPagemento: { pix: [] } } })
      } else if (!usuario.metodosPagemento.pix) {
        await db
          .collection("usuarios")
          .updateOne({ _id: new ObjectId(session.user.id) }, { $set: { "metodosPagemento.pix": [] } })
      }

      // Verificar se a chave já existe
      const pixExists = usuario.metodosPagemento?.pix?.some((c: PixKey) => c.chave === dados.chave)

      if (pixExists) {
        return NextResponse.json({ error: "Esta chave PIX já está cadastrada" }, { status: 400 })
      }

      // Adicionar nova chave PIX
      const novoPix: PixKey = {
        _id: new ObjectId(),
        chave: dados.chave,
        tipo: dados.tipo,
        nome: dados.nome,
        dataCriacao: new Date(),
      }

      // Usando type assertion para contornar as limitações do TypeScript com MongoDB
      await db
        .collection("usuarios")
        .updateOne(
          { _id: new ObjectId(session.user.id) },
          { $push: { "metodosPagemento.pix": novoPix } } as any
        )

      return NextResponse.json({
        success: true,
        message: "Chave PIX adicionada com sucesso",
        pix: novoPix,
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao adicionar método de pagamento:", error)
    return NextResponse.json(
      {
        error: "Erro ao adicionar método de pagamento",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const url = new URL(req.url)
    const tipo = url.searchParams.get("tipo")
    const id = url.searchParams.get("id")

    if (!tipo || !id) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const usuario = (await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })) as Usuario | null

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (tipo === "cartao") {
      // Verificar se o usuário tem um ID de cliente no Stripe
      if (!usuario.stripeCustomerId) {
        return NextResponse.json({ error: "Nenhum cartão encontrado" }, { status: 404 })
      }

      // Remover cartão do Stripe
      await stripe.paymentMethods.detach(id)

      return NextResponse.json({
        success: true,
        message: "Cartão removido com sucesso",
      })
    } else if (tipo === "pix") {
      // Verificar se o usuário tem chaves PIX
      if (!usuario.metodosPagemento?.pix || usuario.metodosPagemento.pix.length === 0) {
        return NextResponse.json({ error: "Nenhuma chave PIX encontrada" }, { status: 404 })
      }

      // Usando type assertion para contornar as limitações do TypeScript com MongoDB
      await db
        .collection("usuarios")
        .updateOne(
          { _id: new ObjectId(session.user.id) },
          { $pull: { "metodosPagemento.pix": { _id: new ObjectId(id) } } } as any
        )

      return NextResponse.json({
        success: true,
        message: "Chave PIX removida com sucesso",
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao remover método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao remover método de pagamento" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo, id, dados } = await req.json()

    const { db } = await connectToDatabase()
    const usuario = (await db.collection("usuarios").findOne({ _id: new ObjectId(session.user.id) })) as Usuario | null

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (tipo === "pix") {
      // Validar dados do PIX
      if (!dados.chave || !dados.tipo || !dados.nome) {
        return NextResponse.json({ error: "Dados incompletos para chave PIX" }, { status: 400 })
      }

      // Verificar se o usuário tem chaves PIX
      if (!usuario.metodosPagemento?.pix || usuario.metodosPagemento.pix.length === 0) {
        return NextResponse.json({ error: "Nenhuma chave PIX encontrada" }, { status: 404 })
      }

      // Verificar se a chave existe
      const pixIndex = usuario.metodosPagemento.pix.findIndex((p: PixKey) => p._id.toString() === id)

      if (pixIndex === -1) {
        return NextResponse.json({ error: "Chave PIX não encontrada" }, { status: 404 })
      }

      // Verificar se a nova chave já existe em outra entrada
      const pixExists = usuario.metodosPagemento.pix.some(
        (p: PixKey) => p.chave === dados.chave && p._id.toString() !== id,
      )

      if (pixExists) {
        return NextResponse.json({ error: "Esta chave PIX já está cadastrada" }, { status: 400 })
      }

      // Atualizar a chave PIX
      await db.collection("usuarios").updateOne(
        {
          _id: new ObjectId(session.user.id),
          "metodosPagemento.pix._id": new ObjectId(id),
        },
        {
          $set: {
            "metodosPagemento.pix.$.chave": dados.chave,
            "metodosPagemento.pix.$.tipo": dados.tipo,
            "metodosPagemento.pix.$.nome": dados.nome,
            "metodosPagemento.pix.$.dataAtualizacao": new Date(),
          },
        },
      )

      return NextResponse.json({
        success: true,
        message: "Chave PIX atualizada com sucesso",
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao atualizar método de pagamento" }, { status: 500 })
  }
}
