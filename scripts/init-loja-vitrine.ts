import { connectToDatabase } from "../lib/mongodb"
import { ObjectId } from "mongodb"

async function initLojaVitrine(userId: string) {
  try {
    console.log("Iniciando criação de loja e vitrine para o usuário:", userId)

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Verificar se o usuário existe
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      console.log("Usuário não encontrado")
      return { error: "Usuário não encontrado" }
    }

    console.log("Usuário encontrado:", usuario.email)

    // Verificar se já existe uma loja para este usuário
    const lojaExistente = await db.collection("lojas").findOne({ proprietarioId: userId })

    if (lojaExistente) {
      console.log("Loja já existe para este usuário:", lojaExistente._id)
      return {
        message: "Loja já existe para este usuário",
        lojaId: lojaExistente._id,
      }
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

    console.log("Criando vitrine...")
    const resultVitrine = await db.collection("vitrines").insertOne(vitrine)
    console.log("Vitrine criada com ID:", resultVitrine.insertedId)

    return {
      message: "Loja e vitrine criadas com sucesso",
      lojaId: resultLoja.insertedId,
      vitrineId: resultVitrine.insertedId,
    }
  } catch (error) {
    console.error("Erro ao inicializar loja e vitrine:", error)
    return { error: "Erro ao inicializar loja e vitrine" }
  }
}

// Executar o script se for chamado diretamente
if (require.main === module) {
  // Verificar se o ID do usuário foi fornecido
  if (process.argv.length < 3) {
    console.log("Uso: ts-node scripts/init-loja-vitrine.ts <userId>")
    process.exit(1)
  }

  const userId = process.argv[2]

  initLojaVitrine(userId)
    .then((result) => {
      console.log("Resultado:", result)
      process.exit(0)
    })
    .catch((error) => {
      console.error("Erro:", error)
      process.exit(1)
    })
}

export { initLojaVitrine }
