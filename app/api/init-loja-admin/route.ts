import { NextResponse } from "next/server"
import { connectToDatabase, ensureCollectionsExist } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    const { db } = await connectToDatabase()
    await ensureCollectionsExist()

    // Verificar se o usuário existe
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se já existe uma loja para este usuário
    const lojaExistente = await db.collection("lojas").findOne({ proprietarioId: userId })

    if (lojaExistente) {
      return NextResponse.json({
        message: "Loja já existe para este usuário",
        lojaId: lojaExistente._id,
      })
    }

    // Criar loja
    const loja = {
      nome: "Loja do " + usuario.nome,
      proprietarioId: userId,
      cnpj: "12.345.678/0001-90",
      descricao: "Loja criada automaticamente para o usuário " + usuario.nome,
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
    await db
      .collection("usuarios")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { lojaId: resultLoja.insertedId } })

    // Criar vitrine
    const vitrine = {
      lojaId: resultLoja.insertedId.toString(),
      userId: userId,
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
    console.error("Erro ao inicializar loja e vitrine:", error)
    return NextResponse.json({ error: "Erro ao inicializar loja e vitrine" }, { status: 500 })
  }
}
