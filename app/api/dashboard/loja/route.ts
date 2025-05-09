import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Buscar o usuário pelo email
    const usuario = await db.collection("usuarios").findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a loja associada ao usuário
    const loja = await db.collection("lojas").findOne({
      $or: [
        { userId: usuario._id.toString() },
        { usuarioId: usuario._id.toString() },
        { proprietarioId: usuario._id.toString() },
      ],
    })

    if (!loja) {
      return NextResponse.json({ loja: null }, { status: 200 })
    }

    // Formatar o endereço
    let enderecoFormatado = ""
    if (loja.endereco) {
      const end = loja.endereco
      const partes = []

      if (end.logradouro) partes.push(end.logradouro)
      if (end.numero) partes.push(end.numero)
      if (end.complemento) partes.push(end.complemento)
      if (end.bairro) partes.push(end.bairro)
      if (end.cidade) partes.push(end.cidade)
      if (end.estado) partes.push(end.estado)
      if (end.cep) partes.push(end.cep)

      enderecoFormatado = partes.join(", ")
    }

    // Processar horários de funcionamento para garantir compatibilidade
    if (loja.horarioFuncionamento) {
      const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]

      // Garantir que todos os dias da semana existam
      diasSemana.forEach((dia) => {
        if (!loja.horarioFuncionamento[dia]) {
          loja.horarioFuncionamento[dia] = {
            aberto: false,
            horaAbertura: "08:00",
            horaFechamento: "18:00",
          }
        }

        // Normalizar propriedades
        const horarioDia = loja.horarioFuncionamento[dia]

        // Garantir compatibilidade entre diferentes formatos
        if (horarioDia.open !== undefined && horarioDia.aberto === undefined) {
          horarioDia.aberto = horarioDia.open
        }

        if (horarioDia.abertura !== undefined && horarioDia.horaAbertura === undefined) {
          horarioDia.horaAbertura = horarioDia.abertura
        }

        if (horarioDia.fechamento !== undefined && horarioDia.horaFechamento === undefined) {
          horarioDia.horaFechamento = horarioDia.fechamento
        }
      })
    }

    // Garantir que o status seja "active" se não estiver definido
    if (!loja.status) {
      loja.status = "active"
    }

    // Retornar a loja com o endereço formatado
    return NextResponse.json(
      {
        loja: {
          ...loja,
          enderecoFormatado,
          // Garantir que o telefone não seja exibido como "não informado"
          telefone: loja.telefone || "",
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}
