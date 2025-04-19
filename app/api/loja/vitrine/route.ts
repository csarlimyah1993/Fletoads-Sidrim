import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getPlanoDoUsuario } from "@/lib/planos"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    console.log("Dados recebidos para atualização:", data)

    try {
      const { db } = await connectToDatabase()

      // Buscar a loja do usuário
      let loja = null

      try {
        // Criar um filtro que funcione tanto com ObjectId quanto com string
        const lojaFilter: any = { $or: [] }

        // Adicionar condições para ObjectId se for válido
        if (ObjectId.isValid(userId)) {
          const objectId = new ObjectId(userId)
          lojaFilter.$or.push({ usuarioId: objectId })
          lojaFilter.$or.push({ userId: objectId })
        }

        // Adicionar condições para string
        lojaFilter.$or.push({ usuarioId: userId })
        lojaFilter.$or.push({ userId: userId })

        loja = await db.collection("lojas").findOne(lojaFilter)
      } catch (error) {
        console.error("Erro ao buscar loja:", error)
      }

      if (!loja) {
        return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
      }

      console.log("Loja encontrada:", loja._id.toString())

      // Buscar o plano do usuário para verificar permissões
      let usuario = null
      try {
        // Criar um filtro que funcione tanto com ObjectId quanto com string
        const userFilter: any = { $or: [] }

        // Adicionar condição para ObjectId se for válido
        if (ObjectId.isValid(userId)) {
          userFilter.$or.push({ _id: new ObjectId(userId) })
        }

        // Adicionar outras possíveis condições de busca
        userFilter.$or.push({ email: session.user.email })

        // Se não houver email, tentar com o ID como string em outros campos
        if (!session.user.email) {
          userFilter.$or.push({ userId: userId })
          userFilter.$or.push({ identificador: userId })
        }

        usuario = await db.collection("usuarios").findOne(userFilter)
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      }

      // Obter o plano do usuário
      const planoId = usuario?.plano || usuario?.metodosPagemento?.plano || "gratis"
      const plano = getPlanoDoUsuario(typeof planoId === "object" ? "gratis" : String(planoId))

      // Validar os dados com base no plano
      const dadosValidados = {
        banner: data.banner,
        logo: data.logo,
        cores: {
          primaria: data.cores?.primaria,
          secundaria: data.cores?.secundaria,
          texto: data.cores?.texto,
          // Apenas incluir destaque se o plano permitir
          ...(plano.personalizacaoVitrine?.cores?.destaque && { destaque: data.cores?.destaque }),
        },
        // Incluir campos adicionais apenas se o plano permitir
        ...(data.layout && { layout: data.layout }),
        ...(plano.personalizacaoVitrine?.fontes && data.fonte && { fonte: data.fonte }),
        ...(plano.personalizacaoVitrine?.animacoes && { animacoes: data.animacoes }),
        // Garantir que widgets seja sempre um array
        widgets: Array.isArray(data.widgets)
          ? // Limitar o número de widgets com base no plano
            data.widgets.slice(0, plano.personalizacaoVitrine?.widgets || 1)
          : ["produtos"],
        dataAtualizacao: new Date(),
      }

      console.log("Dados validados para atualização:", dadosValidados)

      // Atualizar os dados da vitrine
      const resultado = await db.collection("lojas").updateOne({ _id: loja._id }, { $set: dadosValidados })

      console.log("Resultado da atualização:", resultado)

      if (!resultado.acknowledged) {
        return NextResponse.json({ error: "Falha ao atualizar vitrine" }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Vitrine atualizada com sucesso",
        plano: plano.id,
      })
    } catch (dbError) {
      console.error("Erro de banco de dados:", dbError)
      return NextResponse.json(
        {
          error: "Erro ao conectar ao banco de dados",
          details: dbError instanceof Error ? dbError.message : "Erro desconhecido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao atualizar vitrine:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
