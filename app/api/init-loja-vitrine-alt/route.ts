import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    console.log("Iniciando criação alternativa de loja e vitrine")

    // Obter a sessão do usuário
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log("Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o email do usuário da sessão
    const userEmail = session.user.email
    console.log("Email do usuário:", userEmail)

    if (!userEmail) {
      return NextResponse.json({ error: "Email do usuário não disponível" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Verificar as coleções disponíveis
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    console.log("Coleções disponíveis:", collectionNames)

    // Determinar qual coleção usar para usuários
    let usuariosCollection = "usuarios"
    if (!collectionNames.includes("usuarios") && collectionNames.includes("users")) {
      usuariosCollection = "users"
    }
    console.log("Usando coleção:", usuariosCollection)

    // Buscar o usuário pelo email (case insensitive)
    const usuario = await db.collection(usuariosCollection).findOne({
      email: { $regex: new RegExp(`^${userEmail}$`, "i") },
    })

    if (!usuario) {
      console.log(`Usuário não encontrado com email: ${userEmail} na coleção ${usuariosCollection}`)

      // Tentar buscar em todas as coleções para diagnóstico
      for (const collection of collectionNames) {
        try {
          const result = await db
            .collection(collection)
            .findOne({ email: { $regex: new RegExp(`^${userEmail}$`, "i") } })
          if (result) {
            console.log(`Encontrado usuário na coleção: ${collection}`)
            console.log("Estrutura do documento:", Object.keys(result))
          }
        } catch (e) {
          // Ignorar erros de consulta em coleções que não têm campo email
        }
      }

      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const userId = usuario._id.toString()
    console.log("Usuário encontrado com ID:", userId)

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
      nome: `Loja de ${usuario.nome || usuario.name || "Usuário"}`,
      proprietarioId: userId,
      cnpj: "12.345.678/0001-90",
      descricao: `Loja criada automaticamente para ${usuario.nome || usuario.name || "o usuário"}`,
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
    await db.collection(usuariosCollection).updateOne({ _id: usuario._id }, { $set: { lojaId: resultLoja.insertedId } })

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
    return NextResponse.json(
      {
        error: "Erro ao inicializar loja e vitrine",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
