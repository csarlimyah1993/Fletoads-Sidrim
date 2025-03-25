import { connectToDatabase } from "../lib/mongodb"
import Usuario from "../lib/models/usuario"
import bcrypt from "bcryptjs"

async function createAdmin() {
  try {
    await connectToDatabase()

    // Verificar se já existe um admin
    const adminExists = await Usuario.findOne({ cargo: "admin" })

    if (adminExists) {
      console.log("Administrador já existe:", adminExists.email)
      return
    }

    // Criar senha hash
    const salt = await bcrypt.genSalt(10)
    const senhaHash = await bcrypt.hash("admin123", salt)

    // Criar admin
    const admin = new Usuario({
      nome: "Administrador",
      email: "admin@fletoads.com",
      senha: senhaHash,
      cargo: "admin",
      permissoes: ["admin:full"],
      ativo: true,
      ultimoLogin: new Date(),
    })

    await admin.save()
    console.log("Administrador criado com sucesso!")
    console.log("Email: admin@fletoads.com")
    console.log("Senha: admin123")
  } catch (error) {
    console.error("Erro ao criar administrador:", error)
  } finally {
    process.exit(0)
  }
}

createAdmin()

