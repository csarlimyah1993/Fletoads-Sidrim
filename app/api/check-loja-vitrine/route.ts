import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Buscar o usuário para verificar se tem uma loja associada
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem uma loja
    const lojaId = usuario.lojaId

    if (!lojaId) {
      return NextResponse.json({ temLoja: false, temVitrine: false })
    }

    // Buscar a loja para verificar se tem uma vitrine
    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(lojaId.toString()) })

    if (!loja) {
      return NextResponse.json({ temLoja: false, temVitrine: false })
    }

    // Verificar se a loja tem uma vitrine configurada
    const temVitrine = loja.vitrineConfigurada === true

    // Verificar se todos os campos obrigatórios estão preenchidos
    const camposObrigatorios = ["nome", "descricao", "endereco", "telefone", "email", "horarioFuncionamento"]

    let camposPreenchidos = true

    for (const campo of camposObrigatorios) {
      const value = loja[campo]

      // Verificar se o campo existe e não está vazio
      if (value === undefined || value === null || value === "") {
        camposPreenchidos = false
        break
      }

      // Se for um objeto (como endereço), verificar se tem as propriedades necessárias
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        // Para objetos como endereço, verificar se tem as propriedades básicas
        if (campo === "endereco") {
          if (!value.rua || !value.cidade || !value.estado) {
            camposPreenchidos = false
            break
          }
        }
      }
    }

    // Verificar se tem pelo menos um produto cadastrado
    const produtos = await db.collection("produtos").find({ lojaId: lojaId.toString() }).toArray()
    const temProdutos = produtos.length > 0

    return NextResponse.json({
      temLoja: true,
      temVitrine,
      camposPreenchidos,
      temProdutos,
      lojaId: lojaId.toString(),
    })
  } catch (error) {
    console.error("Erro ao verificar loja e vitrine:", error)
    return NextResponse.json({ error: "Erro ao verificar loja e vitrine" }, { status: 500 })
  }
}
