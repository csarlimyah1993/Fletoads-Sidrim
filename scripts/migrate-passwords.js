// Importar o módulo mongodb diretamente
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

// Obter a URI do MongoDB das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:070794Rl!@168.228.4.84:27017/prod-db?authSource=admin"

// Função para verificar se uma senha está em formato hash bcrypt
function isPasswordHashed(password) {
  return password && (password.startsWith("$2a$") || password.startsWith("$2b$"))
}

// Função para gerar hash de senha
async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

async function connectToDatabase() {
  try {
    console.log("Conectando ao MongoDB...")
    const client = await MongoClient.connect(MONGODB_URI, {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })

    // Extrair o nome do banco de dados da URI
    const dbName = MONGODB_URI.split("/").pop().split("?")[0]
    console.log(`Nome do banco de dados: ${dbName}`)

    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

async function migratePasswords() {
  let client
  try {
    const { client: mongoClient, db } = await connectToDatabase()
    client = mongoClient

    // Buscar todos os usuários com senhas em texto plano
    const usuarios = await db
      .collection("usuarios")
      .find({
        senha: { $exists: true },
        $expr: {
          $and: [
            { $ne: [{ $type: "$senha" }, "null"] },
            { $ne: [{ $substr: ["$senha", 0, 4] }, "$2a$"] },
            { $ne: [{ $substr: ["$senha", 0, 4] }, "$2b$"] },
          ],
        },
      })
      .toArray()

    console.log(`Encontrados ${usuarios.length} usuários com senhas em texto plano na coleção 'usuarios'.`)

    // Migrar senhas da coleção 'usuarios'
    for (const usuario of usuarios) {
      if (usuario.senha && !isPasswordHashed(usuario.senha)) {
        const hashedPassword = await hashPassword(usuario.senha)
        await db.collection("usuarios").updateOne(
          { _id: usuario._id },
          {
            $set: {
              senha: hashedPassword,
              updatedAt: new Date(),
            },
          },
        )
        console.log(`Senha atualizada para o usuário: ${usuario.email}`)
      }
    }

    // Verificar também na coleção 'users'
    const users = await db
      .collection("users")
      .find({
        $or: [
          {
            senha: {
              $exists: true,
              $not: /^\$2[aby]\$/,
            },
          },
          {
            password: {
              $exists: true,
              $not: /^\$2[aby]\$/,
            },
          },
        ],
      })
      .toArray()

    console.log(`Encontrados ${users.length} usuários com senhas em texto plano na coleção 'users'.`)

    // Migrar senhas da coleção 'users'
    for (const user of users) {
      const passwordField = user.senha ? "senha" : "password"
      if (user[passwordField] && !isPasswordHashed(user[passwordField])) {
        const hashedPassword = await hashPassword(user[passwordField])
        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              [passwordField]: hashedPassword,
              updatedAt: new Date(),
            },
          },
        )
        console.log(`Senha atualizada para o usuário: ${user.email}`)
      }
    }

    console.log("Migração de senhas concluída com sucesso!")
  } catch (error) {
    console.error("Erro ao migrar senhas:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Conexão com o MongoDB fechada.")
    }
  }
}

// Executar o script
migratePasswords()
