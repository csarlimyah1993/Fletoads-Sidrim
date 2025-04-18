"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"

interface Loja {
  _id: string
  nome: string
  cnpj: string
  endereco: string
  userId: string
  dataCriacao: string
  dataAtualizacao: string
}

interface Produto {
  _id: string
  nome: string
  preco: number
  descricaoCurta: string
  precoPromocional: number
  imagens: string[]
  destaque: boolean
  ativo: boolean
  lojaId: string
  dataCriacao: string
  dataAtualizacao: string
}

const PerfilEditarPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loja, setLoja] = useState<Loja | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true)
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    const fetchLoja = async () => {
      try {
        const response = await fetch(`/api/lojas/user/${session?.user.id}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setLoja(data)
      } catch (error: any) {
        console.error("Erro ao buscar loja:", error)
        toast({
          title: "Erro",
          description: "Não foi possível buscar os dados da loja.",
          variant: "destructive",
        })
      }
    }

    const fetchProdutos = async () => {
      if (!loja?._id) return

      try {
        const response = await fetch(`/api/produtos/loja/${loja._id}`)
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const produtosData = await response.json()

        const mappedProdutos = produtosData.map((produto: any) => ({
          _id: produto._id.toString(),
          nome: produto.nome,
          preco: produto.preco,
          descricaoCurta: produto.descricaoCurta,
          precoPromocional: produto.precoPromocional,
          imagens: produto.imagens,
          destaque: produto.destaque,
          ativo: produto.ativo,
          lojaId: produto.lojaId || loja._id.toString(), // Add the lojaId property
          dataCriacao: produto.dataCriacao,
          dataAtualizacao: produto.dataAtualizacao,
        }))

        setProdutos(mappedProdutos)
      } catch (error: any) {
        console.error("Erro ao buscar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível buscar os produtos da loja.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoja()
    if (loja?._id) {
      fetchProdutos()
    } else {
      setIsLoading(false)
    }
  }, [session, status, router, loja?._id])

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (!loja) {
    return <div>Nenhuma loja encontrada para este usuário.</div>
  }

  return (
    <div>
      <h1>Editar Perfil da Loja</h1>
      <p>Nome da Loja: {loja.nome}</p>
      <h2>Produtos da Loja</h2>
      {produtos.length > 0 ? (
        <ul>
          {produtos.map((produto) => (
            <li key={produto._id}>{produto.nome}</li>
          ))}
        </ul>
      ) : (
        <p>Nenhum produto cadastrado.</p>
      )}
    </div>
  )
}

export default PerfilEditarPage
