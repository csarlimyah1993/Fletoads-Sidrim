import { connectToDatabase } from "../lib/mongodb"
import Usuario from "../lib/models/usuario"

async function fixUserProfile() {
  try {
    console.log("Conectando ao banco de dados...")
    await connectToDatabase()

    console.log("Buscando usuário...")
    // Substitua pelo ID do usuário que você está tentando corrigir
    const userId = "67f70eeee3f0c1252d111561" // ID do usuário sidrinhothiago

    const usuario = await Usuario.findById(userId)
    if (!usuario) {
      console.error("Usuário não encontrado!")
      return
    }

    console.log("Usuário encontrado:", usuario)

    // Garantir que o perfil existe
    if (!usuario.perfil) {
      console.log("Criando objeto perfil...")
      usuario.perfil = {}
      usuario.markModified("perfil")
    }

    // Garantir que as estruturas aninhadas existem
    if (!usuario.perfil.endereco) {
      console.log("Criando objeto endereco...")
      usuario.perfil.endereco = {}
      usuario.markModified("perfil.endereco")
    }

    if (!usuario.perfil.redesSociais) {
      console.log("Criando objeto redesSociais...")
      usuario.perfil.redesSociais = {}
      usuario.markModified("perfil.redesSociais")
    }

    if (!usuario.perfil.preferencias) {
      console.log("Criando objeto preferencias...")
      usuario.perfil.preferencias = {
        notificacoes: true,
        temaEscuro: false,
        idioma: "pt-BR",
      }
      usuario.markModified("perfil.preferencias")
    }

    // Adicionar dados de teste
    usuario.perfil.foto = "https://x.com/sidrimthiago/photo"
    usuario.perfil.telefone = "92981260537"
    usuario.perfil.bio = "Teste de biografia"

    usuario.perfil.endereco.rua = "Rua Aníbal Silva"
    usuario.perfil.endereco.numero = "706"
    usuario.perfil.endereco.complemento = "Apto 6"
    usuario.perfil.endereco.bairro = "Parque da Fonte"
    usuario.perfil.endereco.cidade = "São José dos Pinhais"
    usuario.perfil.endereco.estado = "Paraná"
    usuario.perfil.endereco.cep = "83050-170"

    usuario.perfil.redesSociais.instagram = "@starhyxx"
    usuario.perfil.redesSociais.facebook = "facebook.com/sidrimthiago"
    usuario.perfil.redesSociais.linkedin = "linkedin.com/in/sidrimthiago"
    usuario.perfil.redesSociais.twitter = "@sidrimthiago"

    usuario.markModified("perfil")

    console.log("Salvando usuário...")
    await usuario.save()

    console.log("Usuário atualizado com sucesso!")

    // Verificar se foi salvo corretamente
    const usuarioAtualizado = await Usuario.findById(userId)
    console.log("Usuário após atualização:", usuarioAtualizado)
  } catch (error) {
    console.error("Erro:", error)
  } finally {
    process.exit(0)
  }
}

fixUserProfile()
