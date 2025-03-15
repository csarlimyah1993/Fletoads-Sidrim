import mongoose from "mongoose"
import Usuario from "../lib/models/usuario"

async function main() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log("Conectado ao MongoDB")

    // Verificar se já existe um admin
    const adminExistente = await Usuario.findOne({ cargo: "admin" })

    if (adminExistente) {
      console.log("Usuário admin já existe:", adminExistente.email)
      return
    }

    // Criar usuário admin
    const admin = new Usuario({
      nome: "Administrador",
      email: "admin@fletoads.com",
      senha: "Admin@123", // Esta senha será automaticamente hasheada pelo hook pre-save
      cargo: "admin",
      permissoes: ["admin"],
      dataCriacao: new Date(),
    })

    await admin.save()
    console.log("Usuário admin criado com sucesso!")
    console.log("Email:", admin.email)
    console.log("Senha: Admin@123")
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Desconectado do MongoDB")
  }
}

main()

