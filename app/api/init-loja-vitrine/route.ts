import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    console.log("Iniciando criação de loja e vitrine")

    // Obter a sessão do usuário
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log("Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("ID do usuário da sessão:", userId)

    // Verificar se o ID do usuário é válido
    if (!userId || userId === "undefined" || userId === "null") {
      console.log("ID do usuário inválido:", userId)
      return NextResponse.json({ error: "ID do usuário inválido" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Listar todos os usuários para depuração
    const allUsers = await db.collection("usuarios").find({}).limit(5).toArray()
    console.log(
      "Primeiros 5 usuários no banco:",
      allUsers.map((u) => ({ id: u._id, email: u.email })),
    )

    // Tentar encontrar o usuário pelo ID
    let usuario
    try {
      // Tentar com ObjectId
      usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    } catch (error) {
      console.error("Erro ao buscar usuário por ObjectId:", error)

      try {
        // Tentar com ID como string
        usuario = await db.collection("usuarios").findOne({ _id: userId })
      } catch (innerError) {
        console.error("Erro ao buscar usuário por string ID:", innerError)
      }
    }

    // Se ainda não encontrou, tentar pelo email
    if (!usuario && session.user.email) {
      try {
        usuario = await db.collection("usuarios").findOne({
          email: { $regex: new RegExp(`^${session.user.email}$`, "i") },
        })
      } catch (error) {
        console.error("Erro ao buscar usuário por email:", error)
      }
    }

    if (!usuario) {
      console.log("Usuário não encontrado com ID:", userId)
      return NextResponse.json(
        {
          error: "Usuário não encontrado",
          details: {
            userId,
            userEmail: session.user.email,
          },
        },
        { status: 404 },
      )
    }

    console.log("Usuário encontrado:", usuario.email)

    // Verificar se já existe uma loja para este usuário
    const lojaExistente = await db.collection("lojas").findOne({ proprietarioId: userId })

    if (lojaExistente) {
      console.log("Loja já existe para este usuário:", lojaExistente._id)
      return NextResponse.json({
        message: "Loja já existe para este usuário",
        lojaId: lojaExistente._id,
      })
    }

    // Criar loja
    const loja = {
      nome: `Loja de ${usuario.nome || "Usuário"}`,
      proprietarioId: userId,
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

    console.log("Criando loja...")
    const resultLoja = await db.collection("lojas").insertOne(loja)
    console.log("Loja criada com ID:", resultLoja.insertedId)

    // Atualizar o usuário com o ID da loja
    await db.collection("usuarios").updateOne({ _id: usuario._id }, { $set: { lojaId: resultLoja.insertedId } })

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

    console.log("Criando vitrine...")
    const resultVitrine = await db.collection("vitrines").insertOne(vitrine)
    console.log("Vitrine criada com ID:", resultVitrine.insertedId)

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
