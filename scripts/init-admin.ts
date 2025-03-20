import { connectToDatabase } from "../lib/mongodb"
import Usuario from "../lib/models/usuario"
import bcrypt from "bcryptjs"

async function main() {
  try {
    console.log("Conectando ao banco de dados...")
    await connectToDatabase()

    console.log("Verificando se o usuário admin já existe...")
    const adminExists = await Usuario.findOne({ email: "adminfletoads@gmail.com" })

    if (adminExists) {
      console.log("Usuário admin já existe. Atualizando cargo para 'admin'...")
      adminExists.cargo = "admin"
      await adminExists.save()
      console.log("Usuário admin atualizado com sucesso!")
      return
    }

    console.log("Criando usuário admin...")
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("kkZMk411WDkv", salt)

    const admin = new Usuario({
      nome: "Administrador FletoAds",
      email: "adminfletoads@gmail.com",
      senha: hashedPassword,
      cargo: "admin",
      permissoes: ["admin", "gerenciar_usuarios", "gerenciar_planos", "gerenciar_sistema"],
      ativo: true,
      perfil: {
        foto: "",
        telefone: "",
        bio: "Administrador da plataforma FletoAds",
        preferencias: {
          notificacoes: true,
          temaEscuro: false,
          idioma: "pt-BR",
        },
      },
    })

    await admin.save()
    console.log("Usuário admin criado com sucesso!")
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error)
  } finally {
    process.exit(0)
  }
}

main()

