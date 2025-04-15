import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    console.log(`API /api/dashboard/loja - Buscando loja para o usuário: ${userId}`)

    const { db } = await connectToDatabase()

    // Buscar o usuário para verificar o lojaId
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    console.log("API /api/dashboard/loja - Usuário encontrado:", usuario ? "Sim" : "Não")
    console.log("API /api/dashboard/loja - LojaId do usuário:", usuario?.lojaId)

    let loja = null

    // Se o usuário tiver lojaId, buscar a loja diretamente
    if (usuario && usuario.lojaId) {
      try {
        loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        console.log("API /api/dashboard/loja - Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("API /api/dashboard/loja - Erro ao buscar loja pelo lojaId:", error)
      }
    }

    // Se não encontrou a loja pelo lojaId, buscar pela proprietarioId ou usuarioId
    if (!loja) {
      loja = await db.collection("lojas").findOne({
        $or: [
          { proprietarioId: userId },
          { proprietarioId: new ObjectId(userId) },
          { usuarioId: userId },
          { usuarioId: new ObjectId(userId) },
        ],
      })
      console.log("API /api/dashboard/loja - Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
    }

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    console.log("API /api/dashboard/loja - Loja encontrada:", loja._id.toString(), loja.nome)

    // Formatar endereço se for um objeto
    if (loja.endereco && typeof loja.endereco === "object") {
      const { rua, numero, complemento, bairro, cidade, estado } = loja.endereco
      let enderecoFormatado = ""

      if (rua) enderecoFormatado += rua
      if (numero) enderecoFormatado += `, ${numero}`
      if (complemento) enderecoFormatado += ` - ${complemento}`
      if (bairro) enderecoFormatado += `, ${bairro}`
      if (cidade) enderecoFormatado += `, ${cidade}`
      if (estado) enderecoFormatado += ` - ${estado}`

      loja.enderecoFormatado = enderecoFormatado || "—"
    }

    // Formatar horário de funcionamento para strings
    if (loja.horarioFuncionamento) {
      const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
      const horarioFormatado = {}

      diasSemana.forEach((dia) => {
        if (loja.horarioFuncionamento[dia]) {
          const horario = loja.horarioFuncionamento[dia]
          if (typeof horario === "object" && horario.open) {
            horarioFormatado[dia] = `${horario.abertura} - ${horario.fechamento}`
          } else {
            horarioFormatado[dia] = "Fechado"
          }
        } else {
          horarioFormatado[dia] = "Não definido"
        }
      })

      loja.horarioFormatado = horarioFormatado
    }

    // Serializar os dados para evitar erros de serialização
    const serializableLoja = {
      ...loja,
      _id: loja._id.toString(),
      dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
      dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
    }

    return NextResponse.json({ loja: serializableLoja })
  } catch (error) {
    console.error("API /api/dashboard/loja - Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
