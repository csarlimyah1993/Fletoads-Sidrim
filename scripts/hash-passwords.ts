import { connectToDatabase } from "../lib/mongodb"
import bcrypt from "bcryptjs"

async function hashPasswords() {
  try {
    console.log("Conectando ao banco de dados...")
    const { db } = await connectToDatabase()

    // Buscar todos os usuários com senhas em texto plano
    const users = await db
      .collection("usuarios")
      .find({
        senha: { $not: /^\$2[aby]\$/ }, // Busca senhas que não começam com $2a$, $2b$ ou $2y$ (padrão bcrypt)
      })
      .toArray()

    console.log(`Encontrados ${users.length} usuários com senhas em texto plano.`)

    for (const user of users) {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(user.senha, 10)

      // Atualizar no banco de dados
      await db.collection("usuarios").updateOne({ _id: user._id }, { $set: { senha: hashedPassword } })

      console.log(`Senha atualizada para o usuário: ${user.email}`)
    }

    console.log("Processo concluído com sucesso!")
  } catch (error) {
    console.error("Erro ao processar senhas:", error)
  }
}

// Executar o script
hashPasswords()
