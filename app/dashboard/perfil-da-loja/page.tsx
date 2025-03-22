import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LojaPerfilContent } from "@/components/perfil/loja-perfil-content"
import { ObjectId } from "mongodb"
import { executeWithRetry } from "@/lib/db-utils"
import { DatabaseError } from "@/components/ui/database-error"

export const metadata = {
  title: "Perfil da Loja | FletoAds",
  description: "Visualize e gerencie as informações da sua loja",
}

async function getLoja(userId: string) {
  try {
    return await executeWithRetry(async (db) => {
      console.log("Conectado ao banco de dados")
      console.log("Buscando loja para usuário:", userId)

      // Listar todas as coleções para debug
      const collections = await db.listCollections().toArray()
      console.log(
        "Coleções disponíveis:",
        collections.map((c: { name: string }) => c.name),
      )

      // Verificar se a coleção 'lojas' existe
      if (!collections.some((c: { name: string }) => c.name === "lojas")) {
        console.log("A coleção 'lojas' não existe no banco de dados")

        // Tentar outras coleções que possam conter lojas
        const alternativeCollections = ["loja", "store", "stores"]

        for (const collName of alternativeCollections) {
          if (collections.some((c: { name: string }) => c.name === collName)) {
            console.log(`Tentando coleção alternativa: ${collName}`)
            const lojas = await db.collection(collName).find({}).toArray()
            console.log(`Encontradas ${lojas.length} lojas na coleção ${collName}`)

            if (lojas.length > 0) {
              // Verificar se alguma loja pertence ao usuário
              const lojaDoUsuario = lojas.find(
                (loja: any) =>
                  (loja.usuarioId && (loja.usuarioId === userId || loja.usuarioId.toString() === userId)) ||
                  (loja.userId && (loja.userId === userId || loja.userId.toString() === userId)),
              )

              if (lojaDoUsuario) {
                console.log(`Loja encontrada na coleção ${collName}:`, lojaDoUsuario.nome || lojaDoUsuario.name)
                return {
                  ...lojaDoUsuario,
                  _id: lojaDoUsuario._id.toString(),
                }
              }
            }
          }
        }

        return null
      }

      // Tentar diferentes formatos de ID
      let lojaDoUsuario = null

      // Tentar com o ID como string
      lojaDoUsuario = await db.collection("lojas").findOne({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })

      // Se não encontrou, tentar com ObjectId
      if (!lojaDoUsuario) {
        try {
          const objectId = new ObjectId(userId)
          lojaDoUsuario = await db.collection("lojas").findOne({
            $or: [{ usuarioId: objectId }, { userId: objectId }],
          })
        } catch (error) {
          console.log("Erro ao converter para ObjectId:", error)
        }
      }

      // Se ainda não encontrou, buscar todas as lojas e verificar manualmente
      if (!lojaDoUsuario) {
        console.log("Buscando todas as lojas para verificação manual")
        const todasLojas = await db.collection("lojas").find({}).toArray()
        console.log(`Encontradas ${todasLojas.length} lojas no total`)

        // Imprimir todas as lojas para debug
        todasLojas.forEach((loja: any, index: number) => {
          console.log(`Loja ${index + 1}:`, {
            _id: loja._id.toString(),
            nome: loja.nome,
            usuarioId: loja.usuarioId ? loja.usuarioId.toString() : undefined,
            userId: loja.userId ? loja.userId.toString() : undefined,
          })
        })

        // Procurar por qualquer loja que tenha o userId ou usuarioId correto
        lojaDoUsuario = todasLojas.find(
          (loja: any) =>
            (loja.usuarioId && (loja.usuarioId.toString() === userId || loja.usuarioId === userId)) ||
            (loja.userId && (loja.userId.toString() === userId || loja.userId === userId)),
        )
      }

      if (lojaDoUsuario) {
        console.log("Loja do usuário encontrada:", lojaDoUsuario.nome || lojaDoUsuario.name)
        return {
          ...lojaDoUsuario,
          _id: lojaDoUsuario._id.toString(),
        }
      }

      // Se não encontrou nenhuma loja, criar uma loja padrão para o usuário
      console.log("Nenhuma loja encontrada para este usuário. Criando loja padrão...")

      const novaLoja = {
        nome: "Minha Loja",
        descricao: "Descrição da minha loja",
        usuarioId: userId,
        ativo: true,
        dataCriacao: new Date(),
      }

      const resultado = await db.collection("lojas").insertOne(novaLoja)

      if (resultado.acknowledged) {
        console.log("Loja padrão criada com sucesso!")
        return {
          ...novaLoja,
          _id: resultado.insertedId.toString(),
        }
      }

      console.log("Não foi possível criar uma loja padrão")
      return null
    })
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  console.log("ID do usuário na sessão:", userId)

  const loja = await getLoja(userId)

  // Se não houver loja, podemos mostrar uma mensagem ou redirecionar para criar
  if (!loja) {
    return (
      <div>
        <DatabaseError />
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <h1 className="text-2xl font-bold">Você ainda não possui uma loja cadastrada</h1>
          <p className="text-muted-foreground">Crie sua loja para começar a usar todos os recursos do FletoAds</p>
          <a href="/perfildaloja/criar" className="text-primary hover:underline">
            Criar minha loja
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DatabaseError />
      <LojaPerfilContent loja={loja} />
    </div>
  )
}

