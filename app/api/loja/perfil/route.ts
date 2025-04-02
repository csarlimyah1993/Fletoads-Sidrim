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

    // Buscar o usuário pelo email
    const usuario = await Usuario.findOne({ email: session.user.email }).lean().exec()

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

    // Buscar o usuário pelo email
    const usuario = await Usuario.findOne({ email: session.user.email }).lean().exec()
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

    // Se o usuário já tiver uma loja, atualizar
    if (data._id) {
      const lojaId = typeof data._id === "string" ? data._id : data._id.toString()

      // Buscar a loja existente
      loja = await lojasCollection.findOne({
        _id: new mongoose.Types.ObjectId(lojaId),
      })

      if (!loja) {
        // Se a loja não existir mais, criar uma nova
        const novaLoja = {
          ...data,
          usuarioId: usuario._id.toString(),
          ativo: true,
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
        }

        const result = await lojasCollection.insertOne(novaLoja)
        loja = {
          ...novaLoja,
          _id: result.insertedId,
        }
      } else {
        // Atualizar a loja existente
        const lojaAtualizada = {
          ...data,
          dataAtualizacao: new Date(),
        }

        await lojasCollection.updateOne({ _id: new mongoose.Types.ObjectId(lojaId) }, { $set: lojaAtualizada })

        loja = {
          ...lojaAtualizada,
          _id: new mongoose.Types.ObjectId(lojaId),
        }
      }
    } else {
      // Criar uma nova loja
      const novaLoja = {
        ...data,
        usuarioId: usuario._id.toString(),
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      }

      const result = await lojasCollection.insertOne(novaLoja)
      loja = {
        ...novaLoja,
        _id: result.insertedId,
      }
    }

    return NextResponse.json({ loja })
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao salvar perfil da loja" }, { status: 500 })
  }
}

