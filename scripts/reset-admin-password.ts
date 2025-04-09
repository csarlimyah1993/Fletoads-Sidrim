import { connectToDatabase } from "../lib/mongodb"
import UsuarioModel from "../lib/models/usuario"
import bcrypt from "bcryptjs"

async function resetAdminPassword() {
  try {
    console.log("Conectando ao banco de dados...")
    await connectToDatabase()

    const adminEmail = "admin@fletoads.com"
    const newPassword = "admin123" // Você pode alterar para a senha desejada

    console.log(`Buscando usuário admin: ${adminEmail}`)
    const admin = await UsuarioModel.findOne({ email: adminEmail })

    if (!admin) {
      console.log("Usuário admin não encontrado. Criando novo usuário admin...")

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      const newAdmin = new UsuarioModel({
        nome: "Administrador",
        email: adminEmail,
        senha: hashedPassword,
        role: "admin",
        ativo: true,
        verificado: true,
      })

      await newAdmin.save()
      console.log("Novo usuário admin criado com sucesso!")
    } else {
      console.log("Usuário admin encontrado. Redefinindo senha...")

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      admin.senha = hashedPassword
      await admin.save()

      console.log("Senha do admin redefinida com sucesso!")
    }

    console.log(`Email: ${adminEmail}`)
    console.log(`Senha: ${newPassword}`)

    process.exit(0)
  } catch (error) {
    console.error("Erro ao redefinir senha do admin:", error)
    process.exit(1)
  }
}

resetAdminPassword()

