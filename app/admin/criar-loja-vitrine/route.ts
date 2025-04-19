import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "../../../lib/auth"

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o ID do usuário do corpo da requisição
    const { userId, email } = await request.json()

    if (!userId && !email) {
      return NextResponse.json({ error: "ID do usuário ou email é obrigatório" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Buscar o usuário
    let usuario
    if (userId) {
      try {
        usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
      } catch (error) {
        console.error("Erro ao buscar usuário por ID:", error)
        usuario = await db.collection("usuarios").findOne({ _id: userId })
      }
    } else if (email) {
      usuario = await db.collection("usuarios").findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
      })
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se já existe uma loja para este usuário
    const lojaExistente = await db.collection("lojas").findOne({
      proprietarioId: usuario._id.toString(),
    })

    if (lojaExistente) {
      return NextResponse.json({
        message: "Loja já existe para este usuário",
        lojaId: lojaExistente._id,
      })
    }

    // Criar loja
    const loja = {
      nome: `Loja de ${usuario.nome || "Usuário"}`,
      proprietarioId: usuario._id.toString(),
      cnpj: "12.345.678/0001-90",
      descricao: `Loja criada automaticamente para ${usuario.nome || "o usuário"}`,
      endereco: {
        rua: usuario.endereco?.rua || "Rua Exemplo",
        numero: usuario.endereco?.numero || "123",
        bairro: usuario.endereco?.bairro || "Centro",
        cidade: usuario.endereco?.cidade || "São Paulo",
        estado: usuario.endereco?.estado || "SP",
        cep: usuario.endereco?.cep || "00000-000",
      },
      contato: {
        email: usuario.email,
        telefone: usuario.perfil?.telefone || "(00) 0000-0000",
        whatsapp: usuario.perfil?.telefone || "(00) 00000-0000",
        site: "https://exemplo.com",
        instagram: usuario.redesSociais?.instagram || "",
        facebook: usuario.redesSociais?.facebook || "",
      },
      categorias: ["Geral", "Produtos"],
      horarioFuncionamento: {
        segunda: "08:00 - 18:00",
        terca: "08:00 - 18:00",
        quarta: "08:00 - 18:00",
        quinta: "08:00 - 18:00",
        sexta: "08:00 - 18:00",
        sabado: "08:00 - 13:00",
        domingo: "Fechado",
      },
      status: "ativo",
      ativo: true,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    }

    const resultLoja = await db.collection("lojas").insertOne(loja)

    // Atualizar o usuário com o ID da loja
    await db.collection("usuarios").updateOne({ _id: usuario._id }, { $set: { lojaId: resultLoja.insertedId } })

    // Criar vitrine
    const vitrine = {
      lojaId: resultLoja.insertedId.toString(),
      userId: usuario._id.toString(),
      ativa: true,
      tema: "default",
      cores: {
        primaria: "#3b82f6",
        secundaria: "#1e40af",
        texto: "#ffffff",
        fundo: "#f3f4f6",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const resultVitrine = await db.collection("vitrines").insertOne(vitrine)

    return NextResponse.json({
      message: "Loja e vitrine criadas com sucesso",
      lojaId: resultLoja.insertedId,
      vitrineId: resultVitrine.insertedId,
    })
  } catch (error) {
    console.error("Erro ao criar loja e vitrine:", error)
    return NextResponse.json({ error: "Erro ao criar loja e vitrine" }, { status: 500 })
  }
}
