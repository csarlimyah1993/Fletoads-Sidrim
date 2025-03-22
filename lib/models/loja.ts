import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId, type Filter, type Document } from "mongodb"
import { getPlanoDoUsuario } from "@/lib/planos"
import type { PlanoLimites } from "@/lib/planos"

// Interfaces
export interface Loja {
  _id: string | ObjectId
  nome: string
  descricao?: string
  endereco?: string
  telefone?: string
  email?: string
  website?: string
  horarioFuncionamento?: string
  instagram?: string
  facebook?: string
  ativo: boolean
  logo?: string
  banner?: string
  usuarioId?: string | ObjectId
  userId?: string | ObjectId
  dataCriacao?: Date
  dataAtualizacao?: Date
  slug?: string
  nomeNormalizado?: string
  cores?: {
    primaria?: string
    secundaria?: string
    texto?: string
  }
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  planoId?: string
  plano?: PlanoLimites
  produtos?: Produto[]
}

export interface Produto {
  _id: string | ObjectId
  nome: string
  preco: number
  descricao?: string
  imagens?: string[]
  categoria?: string
  lojaId: string
  estoque?: number
  dataCriacao?: Date
  dataAtualizacao?: Date
}

// Funções de utilidade
function normalizarNome(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
}

function prepararLoja(loja: Partial<Loja>): Partial<Loja> {
  const agora = new Date()

  // Se for uma nova loja
  if (!loja._id) {
    loja.dataCriacao = agora
    loja.ativo = loja.ativo !== undefined ? loja.ativo : true

    // Gerar slug se não existir
    if (!loja.slug && loja.nome) {
      loja.nomeNormalizado = normalizarNome(loja.nome)
      loja.slug = loja.nomeNormalizado
    }
  }

  loja.dataAtualizacao = agora

  return loja
}

// Função para criar um filtro seguro com ObjectId
function criarFiltroId(id: string | ObjectId): Filter<Document> {
  try {
    // Se já for um ObjectId, usar diretamente
    if (id instanceof ObjectId) {
      return { _id: id }
    }

    // Tentar converter para ObjectId
    return { _id: new ObjectId(id) }
  } catch (error) {
    // Se falhar, usar uma condição que nunca vai dar match
    // para evitar erros de tipo, mas permitir que o código continue
    console.warn(`ID inválido para ObjectId: ${id}`)
    return { _id: { $eq: id } as any }
  }
}

// Funções CRUD
export async function criarLoja(dados: Partial<Loja>): Promise<Loja> {
  try {
    const { db } = await connectToDatabase()

    // Remover o _id se for string para evitar problemas de tipo
    const { _id, ...dadosSemId } = dados

    const lojaPronta = prepararLoja(dadosSemId)

    // Converter para Document para satisfazer a tipagem do MongoDB
    const documento = lojaPronta as unknown as Document

    const resultado = await db.collection("lojas").insertOne(documento)

    if (!resultado.acknowledged) {
      throw new Error("Falha ao criar loja")
    }

    return {
      ...lojaPronta,
      _id: resultado.insertedId,
    } as Loja
  } catch (error) {
    console.error("Erro ao criar loja:", error)
    throw error
  }
}

export async function atualizarLoja(id: string | ObjectId, dados: Partial<Loja>): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    // Remover campos que não devem ser atualizados
    const { _id, dataCriacao, ...dadosAtualizaveis } = dados

    const lojaPronta = prepararLoja(dadosAtualizaveis)

    // Usar o filtro seguro
    const filtro = criarFiltroId(id)

    const resultado = await db
      .collection("lojas")
      .findOneAndUpdate(filtro, { $set: lojaPronta }, { returnDocument: "after" })

    if (!resultado) {
      return null
    }

    return {
      ...resultado,
      _id: resultado._id.toString(),
    } as Loja
  } catch (error) {
    console.error("Erro ao atualizar loja:", error)
    throw error
  }
}

export async function buscarLojaPorId(id: string | ObjectId): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    let loja = null

    // Tentar buscar por ObjectId usando o filtro seguro
    try {
      const filtro = criarFiltroId(id)
      loja = await db.collection("lojas").findOne(filtro)
    } catch (error) {
      console.error("Erro ao buscar por ID:", error)
    }

    // Se não encontrou, tentar buscar por outros campos
    if (!loja) {
      loja = await db.collection("lojas").findOne({
        $or: [
          { slug: typeof id === "string" ? id : id.toString() },
          { nomeNormalizado: typeof id === "string" ? id : id.toString() },
        ],
      })
    }

    if (!loja) {
      return null
    }

    return {
      ...loja,
      _id: loja._id.toString(),
    } as Loja
  } catch (error) {
    console.error("Erro ao buscar loja por ID:", error)
    throw error
  }
}

export async function buscarLojaPorSlug(slug: string): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    const loja = await db.collection("lojas").findOne({
      $or: [{ slug: slug }, { nomeNormalizado: slug.toLowerCase().replace(/\s+/g, "-") }],
    })

    if (!loja) {
      return null
    }

    return {
      ...loja,
      _id: loja._id.toString(),
    } as Loja
  } catch (error) {
    console.error("Erro ao buscar loja por slug:", error)
    throw error
  }
}

export async function buscarLojaPorUsuario(userId: string | ObjectId): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    let loja = null
    const userIdStr = typeof userId === "string" ? userId : userId.toString()
    let userObjectId: ObjectId | null = null

    try {
      // Tentar converter para ObjectId
      userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId
    } catch (error) {
      // Se falhar, continuar com a string
      console.warn("Não foi possível converter userId para ObjectId:", error)
    }

    // Construir a consulta com todas as possibilidades
    const query: Filter<Document> = {
      $or: [{ usuarioId: userIdStr }, { userId: userIdStr }],
    }

    // Adicionar ObjectId à consulta se disponível
    if (userObjectId) {
      // Garantir que $or existe antes de adicionar
      if (!query.$or) {
        query.$or = []
      }
      query.$or.push({ usuarioId: userObjectId })
      query.$or.push({ userId: userObjectId })
    }

    loja = await db.collection("lojas").findOne(query)

    if (!loja) {
      return null
    }

    return {
      ...loja,
      _id: loja._id.toString(),
    } as Loja
  } catch (error) {
    console.error("Erro ao buscar loja por usuário:", error)
    throw error
  }
}

export async function buscarTodasLojas(filtro: any = {}, limite = 100): Promise<Loja[]> {
  try {
    const { db } = await connectToDatabase()

    const lojas = await db.collection("lojas").find(filtro).limit(limite).toArray()

    return lojas.map((loja) => ({
      ...loja,
      _id: loja._id.toString(),
    })) as Loja[]
  } catch (error) {
    console.error("Erro ao buscar todas as lojas:", error)
    throw error
  }
}

export async function excluirLoja(id: string | ObjectId): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Usar o filtro seguro
    const filtro = criarFiltroId(id)

    const resultado = await db.collection("lojas").deleteOne(filtro)

    return resultado.deletedCount === 1
  } catch (error) {
    console.error("Erro ao excluir loja:", error)
    throw error
  }
}

export async function buscarProdutosDaLoja(lojaId: string | ObjectId, limite = 100): Promise<Produto[]> {
  try {
    const { db } = await connectToDatabase()

    // Buscar a loja para obter o plano
    const loja = await buscarLojaPorId(lojaId)

    if (!loja) {
      throw new Error("Loja não encontrada")
    }

    // Obter o plano do usuário
    let usuario = null
    if (loja.usuarioId) {
      try {
        const usuarioId = typeof loja.usuarioId === "string" ? loja.usuarioId : loja.usuarioId.toString()

        // Tentar com ObjectId
        try {
          const objectId = new ObjectId(usuarioId)
          usuario = await db.collection("usuarios").findOne({ _id: objectId })
        } catch {
          // Se falhar, tentar com string
          usuario = await db.collection("usuarios").findOne({ _id: usuarioId } as any)
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      }
    }

    // Obter o plano e seus limites
    const planoId = usuario?.plano || usuario?.metodosPagemento?.plano || "gratis"
    const plano = getPlanoDoUsuario(planoId)

    // Limitar pelo plano
    const limiteProdutos = plano.vitrine > 0 ? Math.min(plano.vitrine, limite) : limite

    // Usar o ID da loja como string para evitar problemas de tipo
    const lojaIdStr = typeof lojaId === "string" ? lojaId : lojaId.toString()

    const produtos = await db.collection("produtos").find({ lojaId: lojaIdStr }).limit(limiteProdutos).toArray()

    return produtos.map((produto) => ({
      ...produto,
      _id: produto._id.toString(),
    })) as Produto[]
  } catch (error) {
    console.error("Erro ao buscar produtos da loja:", error)
    throw error
  }
}

export async function buscarLojaComProdutos(id: string | ObjectId): Promise<Loja | null> {
  try {
    const loja = await buscarLojaPorId(id)

    if (!loja) {
      return null
    }

    // Buscar produtos da loja
    const produtos = await buscarProdutosDaLoja(id)

    // Buscar o plano do usuário
    const { db } = await connectToDatabase()
    let usuario = null

    if (loja.usuarioId) {
      const usuarioId = typeof loja.usuarioId === "string" ? loja.usuarioId : loja.usuarioId.toString()

      try {
        // Tentar com ObjectId
        usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(usuarioId) })
      } catch {
        // Se falhar, tentar com string
        usuario = await db.collection("usuarios").findOne({ _id: usuarioId })
      }
    }

    // Obter o plano e seus limites
    const planoId = usuario?.plano || usuario?.metodosPagemento?.plano || "gratis"
    const plano = getPlanoDoUsuario(planoId)

    return {
      ...loja,
      produtos,
      plano,
      planoId,
    } as Loja
  } catch (error) {
    console.error("Erro ao buscar loja com produtos:", error)
    throw error
  }
}

// Função para verificar se um usuário é dono de uma loja
export async function verificarProprietario(lojaId: string | ObjectId, userId: string | ObjectId): Promise<boolean> {
  try {
    const { db } = await connectToDatabase()

    // Criar filtro seguro para o ID da loja
    let lojaFilter: Filter<Document>

    try {
      // Se for string, tentar converter para ObjectId
      if (typeof lojaId === "string") {
        lojaFilter = { _id: new ObjectId(lojaId) }
      } else {
        // Se já for ObjectId, usar diretamente
        lojaFilter = { _id: lojaId }
      }
    } catch (error) {
      // Se falhar a conversão, usar uma condição que nunca vai dar match
      console.warn("ID de loja inválido para ObjectId:", lojaId)
      return false
    }

    // Buscar a loja com o filtro seguro
    const loja = await db.collection("lojas").findOne(lojaFilter)

    if (!loja) {
      return false
    }

    const userIdStr = typeof userId === "string" ? userId : userId.toString()

    // Garantir que o retorno seja sempre booleano
    const isUsuarioIdMatch = loja.usuarioId
      ? loja.usuarioId === userIdStr || loja.usuarioId.toString() === userIdStr
      : false

    const isUserIdMatch = loja.userId ? loja.userId === userIdStr || loja.userId.toString() === userIdStr : false

    return isUsuarioIdMatch || isUserIdMatch
  } catch (error) {
    console.error("Erro ao verificar proprietário:", error)
    return false
  }
}

// Função para atualizar a vitrine da loja
export async function atualizarVitrine(
  lojaId: string | ObjectId,
  dados: { banner?: string; logo?: string; cores?: { primaria?: string; secundaria?: string; texto?: string } },
): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    // Usar o filtro seguro
    const filtro = criarFiltroId(lojaId)

    const resultado = await db.collection("lojas").findOneAndUpdate(
      filtro,
      {
        $set: {
          ...dados,
          dataAtualizacao: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!resultado) {
      return null
    }

    return {
      ...resultado,
      _id: resultado._id.toString(),
    } as Loja
  } catch (error) {
    console.error("Erro ao atualizar vitrine:", error)
    throw error
  }
}

