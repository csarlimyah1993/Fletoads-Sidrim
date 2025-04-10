import { connectToDatabase } from "../lib/mongodb"
import Usuario from "../lib/models/usuario"

async function updateUserSchema() {
  try {
    console.log("Conectando ao banco de dados...")
    await connectToDatabase()
    console.log("Conectado com sucesso!")

    console.log("Buscando usuários...")
    const usuarios = await Usuario.find({})
    console.log(`Encontrados ${usuarios.length} usuários`)

    for (const usuario of usuarios) {
      console.log(`Atualizando usuário: ${usuario.email}`)

      // Garantir que o perfil existe
      if (!usuario.perfil) {
        usuario.perfil = {}
      }

      // Garantir que as estruturas aninhadas existem
      if (!usuario.perfil.endereco) {
        usuario.perfil.endereco = {}
      }

      if (!usuario.perfil.redesSociais) {
        usuario.perfil.redesSociais = {}
      }

      if (!usuario.perfil.preferencias) {
        usuario.perfil.preferencias = {
          notificacoes: true,
          temaEscuro: false,
          idioma: "pt-BR",
        }
      }

      // Salvar as alterações
      await usuario.save()
      console.log(`Usuário ${usuario.email} atualizado com sucesso!`)
    }

    console.log("Todos os usuários foram atualizados com sucesso!")
    process.exit(0)
  } catch (error) {
    console.error("Erro ao atualizar esquema de usuários:", error)
    process.exit(1)
  }
}

updateUserSchema()
