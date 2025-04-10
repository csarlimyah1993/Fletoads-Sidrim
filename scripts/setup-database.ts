import { connectToDatabase } from "../lib/mongodb"
import bcrypt from "bcryptjs"

async function setupDatabase() {
  try {
    console.log("Iniciando configuração do banco de dados...")
    const { db } = await connectToDatabase()

    // Listar todas as coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    console.log("Coleções existentes:", collectionNames)

    // Criar coleção "usuarios" se não existir
    if (!collectionNames.includes("usuarios")) {
      console.log("Criando coleção 'usuarios'...")
      await db.createCollection("usuarios")
      console.log("Coleção 'usuarios' criada com sucesso")
    }

    // Verificar se o usuário admin já existe
    const adminUser = await db.collection("usuarios").findOne({ email: "sidrimthiago@gmail.com" })

    if (!adminUser) {
      // Criar hash da senha
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)

      // Criar usuário admin
      const newAdmin = {
        nome: "Thiago Sidrim Melo",
        email: "sidrimthiago@gmail.com",
        senha: hashedPassword,
        role: "admin",
        cargo: "admin",
        permissoes: ["admin"],
        plano: "admin",
        ultimoLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("usuarios").insertOne(newAdmin)
      console.log("Usuário admin criado com sucesso:", result.insertedId)
    } else {
      // Atualizar usuário existente para garantir que seja admin
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)

      await db.collection("usuarios").updateOne(
        { email: "sidrimthiago@gmail.com" },
        {
          $set: {
            senha: hashedPassword,
            role: "admin",
            cargo: "admin",
            permissoes: ["admin"],
            plano: "admin",
            updatedAt: new Date(),
          },
        },
      )
      console.log("Usuário admin atualizado com sucesso")
    }

    // Verificar todas as coleções novamente
    const updatedCollections = await db.listCollections().toArray()
    console.log(
      "Coleções após setup:",
      updatedCollections.map((c) => c.name),
    )

    // Verificar usuários na coleção
    const usuarios = await db.collection("usuarios").find({}).toArray()
    console.log(`Total de usuários: ${usuarios.length}`)
    usuarios.forEach((user) => {
      console.log(`- ${user.email} (${user.role || "sem role"})`)
    })

    console.log("Configuração do banco de dados concluída com sucesso")
  } catch (error) {
    console.error("Erro ao configurar banco de dados:", error)
  } finally {
    process.exit(0)
  }
}

setupDatabase()
