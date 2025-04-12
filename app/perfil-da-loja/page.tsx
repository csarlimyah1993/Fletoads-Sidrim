import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PerfilDaLojaClient } from "@/components/perfil/perfil-da-loja-client"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Produto } from "@/types/loja"

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  console.log("ID do usuário:", userId)

  // Buscar a loja diretamente do banco de dados
  const { db } = await connectToDatabase()

  // Buscar o usuário para verificar o lojaId
  const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
  console.log("Usuário encontrado:", usuario ? "Sim" : "Não")
  console.log("LojaId do usuário:", usuario?.lojaId)

  // Se o usuário tiver lojaId, buscar a loja diretamente pelo ID
  let loja = null
  if (usuario && usuario.lojaId) {
    try {
      console.log("Buscando loja pelo lojaId:", usuario.lojaId)
      loja = await db.collection("lojas").findOne({
        _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
      })
      console.log("Loja encontrada pelo lojaId:", loja ? "Sim" : "Não")
    } catch (error) {
      console.error("Erro ao buscar loja pelo lojaId:", error)
    }
  }

  // Se não encontrou pelo lojaId, tentar pelos campos proprietarioId/usuarioId
  if (!loja) {
    console.log("Buscando loja por proprietarioId/usuarioId:", userId)
    loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
      ],
    })
    console.log("Loja encontrada por proprietarioId/usuarioId:", loja ? "Sim" : "Não")
  }

  // Buscar produtos da loja
  let produtos: Produto[] = []
  if (loja) {
    console.log("Buscando produtos da loja:", loja._id.toString())
    const produtosData = await db
      .collection("produtos")
      .find({ lojaId: loja._id.toString() })
      .limit(8)
      .sort({ destaque: -1, dataCriacao: -1 })
      .toArray()

    produtos = produtosData.map((produto) => ({
      _id: produto._id.toString(),
      nome: produto.nome,
      preco: produto.preco,
      descricaoCurta: produto.descricaoCurta,
      precoPromocional: produto.precoPromocional,
      imagens: produto.imagens,
      destaque: produto.destaque,
      ativo: produto.ativo,
      dataCriacao: produto.dataCriacao,
      dataAtualizacao: produto.dataAtualizacao,
    }))

    console.log("Produtos encontrados:", produtos.length)
  }

  // Buscar informações do plano
  let planoInfo = null
  try {
    console.log("Buscando informações do plano para o usuário:", userId)
    if (usuario && usuario.plano) {
      planoInfo = {
        nome: usuario.plano,
        panfletos: { usado: 0, limite: usuario.plano === "premium" ? 100 : 10 },
        produtos: { usado: produtos.length, limite: usuario.plano === "premium" ? 1000 : 100 },
        integracoes: { usado: 0, limite: usuario.plano === "premium" ? 10 : 1 },
      }
      console.log("Plano do usuário:", usuario.plano)
    }
  } catch (error) {
    console.error("Erro ao buscar informações do plano:", error)
  }

  // Serializar os dados para evitar erros de serialização
  const serializableLoja = loja
    ? JSON.parse(
        JSON.stringify({
          ...loja,
          _id: loja._id.toString(),
          dataCriacao: loja.dataCriacao ? loja.dataCriacao.toISOString() : null,
          dataAtualizacao: loja.dataAtualizacao ? loja.dataAtualizacao.toISOString() : null,
        }),
      )
    : null

  const serializableProdutos = JSON.parse(
    JSON.stringify(
      produtos.map((produto) => ({
        ...produto,
        dataCriacao: produto.dataCriacao
          ? typeof produto.dataCriacao === "string"
            ? produto.dataCriacao
            : produto.dataCriacao.toISOString()
          : null,
        dataAtualizacao: produto.dataAtualizacao
          ? typeof produto.dataAtualizacao === "string"
            ? produto.dataAtualizacao
            : produto.dataAtualizacao.toISOString()
          : null,
      })),
    ),
  )

  console.log("Renderizando perfil da loja com dados serializados")

  // Se tiver loja, mostrar o perfil
  return (
    <PerfilDaLojaClient 
      userId={userId} 
      loja={serializableLoja} 
      produtos={serializableProdutos} 
      planoInfo={planoInfo} 
    />
  )
}