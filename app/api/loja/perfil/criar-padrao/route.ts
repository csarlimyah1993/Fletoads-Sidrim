import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Verificar se o usuário já tem uma loja
    const lojaExistente = await Loja.findOne({ proprietarioId: session.user.id })

    if (lojaExistente) {
      return NextResponse.json(lojaExistente)
    }

    // Criar loja padrão
    const loja = new Loja({
      proprietarioId: session.user.id,
      nome: "Minha Loja",
      status: "pendente",
      cnpj: "",
      categorias: [],
      descricao: "",
      logo: "",
      banner: "",
      endereco: {
        cep: "00000-000",
        rua: "Rua Exemplo",
        numero: "123",
        complemento: "",
        bairro: "Centro",
        cidade: "Cidade Exemplo",
        estado: "UF",
      },
      contato: {
        telefone: "(00) 0000-0000",
        whatsapp: "",
        email: session.user.email || "exemplo@email.com",
        site: "",
        instagram: "",
        facebook: "",
      },
      horarioFuncionamento: {
        segunda: "Fechado",
        terca: "08:00 - 18:00",
        quarta: "08:00 - 18:00",
        quinta: "08:00 - 18:00",
        sexta: "08:00 - 18:00",
        sabado: "08:00 - 13:00",
        domingo: "Fechado",
      },
      dataCriacao: new Date(),
    })

    await loja.save()
    console.log("Loja padrão criada com sucesso")

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao criar loja padrão:", error)
    return NextResponse.json({ error: "Erro ao criar loja padrão" }, { status: 500 })
  }
}

