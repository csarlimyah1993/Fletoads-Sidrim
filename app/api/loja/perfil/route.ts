import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Ensure database connection is established
    await connectToDatabase()

    // Verificar se o modelo Usuario existe
    let Usuario
    try {
      Usuario = mongoose.model("Usuario")
    } catch (e) {
      // Se não existir, criar o modelo
      const UsuarioSchema = new mongoose.Schema({
        nome: String,
        email: String,
        senha: String,
        role: String,
        ativo: Boolean,
      })

      Usuario = mongoose.model("Usuario", UsuarioSchema)
    }

    // Buscar o usuário pelo email - corrigindo o erro de TypeScript
    const usuario = await (Usuario.findOne({ email: session.user.email }) as unknown as Promise<any>)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    console.log("Buscando loja para usuário:", usuario._id)

    // Ensure we have a database connection
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error("Conexão com o banco de dados não estabelecida")
      await connectToDatabase() // Try to reconnect

      if (!mongoose.connection || !mongoose.connection.db) {
        throw new Error("Não foi possível estabelecer conexão com o banco de dados")
      }
    }

    // Tentar buscar diretamente da coleção "lojas"
    const db = mongoose.connection.db
    const lojasCollection = db.collection("lojas")

    // Buscar a loja do usuário usando o ID como string
    const userId = usuario._id.toString()
    let loja = await lojasCollection.findOne({
      $or: [{ usuarioId: userId }, { usuarioId: new mongoose.Types.ObjectId(userId) }],
    })

    if (!loja) {
      // Se não encontrar, tentar na coleção "vitrines"
      const vitrinesCollection = db.collection("vitrines")
      loja = await vitrinesCollection.findOne({
        $or: [{ usuarioId: userId }, { usuarioId: new mongoose.Types.ObjectId(userId) }],
      })
    }

    if (!loja) {
      return NextResponse.json({ message: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ loja })
  } catch (error) {
    console.error("Erro ao buscar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil da loja" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await req.json()
    console.log("Dados recebidos para salvar:", data)

    // Ensure database connection is established
    await connectToDatabase()

    // Verificar se o modelo Usuario existe
    let Usuario
    try {
      Usuario = mongoose.model("Usuario")
    } catch (e) {
      // Se não existir, criar o modelo
      const UsuarioSchema = new mongoose.Schema({
        nome: String,
        email: String,
        senha: String,
        role: String,
        ativo: Boolean,
      })

      Usuario = mongoose.model("Usuario", UsuarioSchema)
    }

    // Buscar o usuário pelo email - corrigindo o erro de TypeScript
    const usuario = await (Usuario.findOne({ email: session.user.email }) as unknown as Promise<any>)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Ensure we have a database connection
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error("Conexão com o banco de dados não estabelecida")
      await connectToDatabase() // Try to reconnect

      if (!mongoose.connection || !mongoose.connection.db) {
        throw new Error("Não foi possível estabelecer conexão com o banco de dados")
      }
    }

    // Acessar diretamente a coleção "lojas"
    const db = mongoose.connection.db
    const lojasCollection = db.collection("lojas")

    let loja
    let resultado

    // Se o usuário já tiver uma loja, atualizar
    if (data._id) {
      const lojaId = typeof data._id === "string" ? data._id : data._id.toString()
      console.log("Atualizando loja existente com ID:", lojaId)

      // Preparar os dados para atualização
      const lojaAtualizada = {
        nome: data.nome,
        descricao: data.descricao,
        endereco: data.endereco || {},
        telefone: data.telefone,
        email: data.email,
        website: data.website,
        logo: data.logo || data.logoUrl,
        banner: data.banner || data.bannerUrl,
        horarioFuncionamento: data.horarioFuncionamento,
        redesSociais: data.redesSociais || {},
        dataAtualizacao: new Date(),
      }

      // Buscar a loja existente
      const lojaExistente = await lojasCollection.findOne({
        _id: new mongoose.Types.ObjectId(lojaId),
      })

      if (!lojaExistente) {
        console.log("Loja não encontrada, criando nova")
        // Se a loja não existir mais, criar uma nova
        const novaLoja = {
          ...lojaAtualizada,
          usuarioId: usuario._id.toString(),
          ativo: true,
          dataCriacao: new Date(),
        }

        resultado = await lojasCollection.insertOne(novaLoja)
        loja = {
          ...novaLoja,
          _id: resultado.insertedId,
        }
      } else {
        console.log("Atualizando loja existente")
        // Atualizar a loja existente
        resultado = await lojasCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(lojaId) },
          { $set: lojaAtualizada },
        )

        loja = {
          ...lojaAtualizada,
          _id: new mongoose.Types.ObjectId(lojaId),
          usuarioId: lojaExistente.usuarioId,
          dataCriacao: lojaExistente.dataCriacao,
        }
      }
    } else {
      console.log("Criando nova loja")
      // Criar uma nova loja
      const novaLoja = {
        nome: data.nome,
        descricao: data.descricao,
        endereco: data.endereco || {},
        telefone: data.telefone,
        email: data.email,
        website: data.website,
        logo: data.logo || data.logoUrl,
        banner: data.banner || data.bannerUrl,
        horarioFuncionamento: data.horarioFuncionamento,
        redesSociais: data.redesSociais || {},
        usuarioId: usuario._id.toString(),
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }

      resultado = await lojasCollection.insertOne(novaLoja)
      loja = {
        ...novaLoja,
        _id: resultado.insertedId,
      }
    }

    console.log("Loja salva com sucesso:", loja)
    return NextResponse.json({ loja, success: true })
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json({ error: "Erro ao salvar perfil da loja", details: errorMessage }, { status: 500 })
  }
}

