import { connectToDatabase } from "../lib/mongodb"
import bcrypt from "bcryptjs"

async function updateUserToAdmin() {
  try {
    console.log("Conectando ao MongoDB...")
    const { db } = await connectToDatabase()

    // Verificar se o usuário existe
    const email = "sidrimthiago@gmail.com"
    const userCollection = db.collection("usuarios")

    let user = await userCollection.findOne({ email })

    if (user) {
      console.log("Usuário encontrado:", user)

      // Atualizar para admin
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)
      await userCollection.updateOne(
        { email },
        {
          $set: {
            senha: hashedPassword,
            role: "admin",
            cargo: "admin",
            nome: "Thiago Sidrim",
            plano: "admin",
            permissoes: ["admin"],
          },
        },
      )
      console.log("Usuário atualizado para admin com sucesso!")

      // Verificar a atualização
      user = await userCollection.findOne({ email })
      console.log("Usuário após atualização:", user)
    } else {
      console.log("Usuário não encontrado. Criando novo usuário admin...")

      // Criar o usuário admin
      const hashedPassword = await bcrypt.hash("sidrinho123", 10)
      const newUser = {
        email,
        senha: hashedPassword,
        nome: "Thiago Sidrim",
        role: "admin",
        cargo: "admin",
        plano: "admin",
        permissoes: ["admin"],
        dataCriacao: new Date(),
        ultimoLogin: new Date(),
      }

      const result = await userCollection.insertOne(newUser)
      console.log("Usuário admin criado com sucesso:", result.insertedId)
    }

    console.log("Processo concluído com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar usuário para admin:", error)
  }
}

updateUserToAdmin()
