import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Loja, Usuario } from "@/types/entities"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const fallbackMode = searchParams.get("fallback") === "true"

    // Verificar autenticação
    if (!session) {
      console.log("API /api/dashboard/loja - Não autorizado, sem sessão")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    console.log(`API /api/dashboard/loja - Buscando loja para o usuário: ${userId || "ID não disponível"}`)
    console.log(`API /api/dashboard/loja - Dados da sessão:`, JSON.stringify(session.user))

    const { db } = await connectToDatabase()

    // Buscar o usuário para verificar o lojaId
    let usuario: Usuario | null = null

    if (userId) {
      try {
        // Validação do formato do userId antes de converter para ObjectId
        let userIdObj: ObjectId | string = userId
        if (typeof userId === "string" && /^[a-fA-F0-9]{24}$/.test(userId)) {
          userIdObj = new ObjectId(userId)
        }
        usuario = await db.collection<Usuario>("usuarios").findOne({
          $or: [{ _id: userIdObj }, { _id: userId }],
        })
        console.log("API /api/dashboard/loja - Usuário encontrado:", usuario ? "Sim" : "Não")
        console.log("API /api/dashboard/loja - LojaId do usuário:", usuario?.lojaId)
      } catch (error) {
        console.error("API /api/dashboard/loja - Erro ao buscar usuário:", error)
      }
    } else {
      console.log("API /api/dashboard/loja - ID do usuário não disponível na sessão")
    }

    let loja: Loja | null = null

    // Se o usuário tiver lojaId, buscar a loja diretamente
    if (usuario && usuario.lojaId) {
      try {
        loja = await db.collection<Loja>("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        console.log("API /api/dashboard/loja - Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("API /api/dashboard/loja - Erro ao buscar loja pelo lojaId:", error)
      }
    }

    // Se não encontrou a loja pelo lojaId, buscar pela proprietarioId ou usuarioId
    if (!loja && userId) {
      try {
        loja = await db.collection<Loja>("lojas").findOne({
          $or: [
            { proprietarioId: userId },
            { proprietarioId: new ObjectId(userId) },
            { usuarioId: userId },
            { usuarioId: new ObjectId(userId) },
          ],
        })
        console.log("API /api/dashboard/loja - Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
      } catch (error) {
        console.error("API /api/dashboard/loja - Erro ao buscar loja por proprietarioId/usuarioId:", error)
      }
    }

    // Se ainda não encontrou a loja e estamos em modo fallback, buscar a primeira loja disponível
    if (!loja && fallbackMode) {
      try {
      //  console.log("API /api/dashboard/loja - Tentando buscar qualquer loja (modo fallback)")
        loja = await db.collection<Loja>("lojas").findOne({})
      //  console.log("API /api/dashboard/loja - Loja encontrada em modo fallback:", loja ? "Sim" : "Não")
      } catch (error) {
      //  console.error("API /api/dashboard/loja - Erro ao buscar loja em modo fallback:", error)
      }
    }

    if (!loja) {
      console.log("API /api/dashboard/loja - Nenhuma loja encontrada")
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

   // console.log("API /api/dashboard/loja - Loja encontrada:", loja._id.toString(), loja.nome)
   // console.log("API /api/dashboard/loja - Status da loja:", loja.status, loja.ativo)

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
      const horarioFormatado: Record<string, string> = {}

      diasSemana.forEach((dia) => {
        if (loja.horarioFuncionamento && loja.horarioFuncionamento[dia]) {
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

    // Corrigir o status da loja - verificar todos os campos possíveis
    if (loja.ativo === true || loja.status === "ativo" || loja.status === "active") {
      loja.status = "active"
    } else {
      loja.status = "inactive"
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
