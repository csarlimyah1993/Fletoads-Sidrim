"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LojaPerfilContent } from "./loja-perfil-content"
import { CriarLojaForm } from "../loja/criar-loja-form"
import type { Loja, Produto } from "@/types/loja"

export interface PerfilDaLojaClientProps {
  userId?: string
  loja?: Loja | null
  produtos?: Produto[]
  planoInfo?: any
}

export function PerfilDaLojaClient({ userId, loja, produtos = [], planoInfo = null }: PerfilDaLojaClientProps) {
  const [error, setError] = useState("")
  const router = useRouter()

  console.log("PerfilDaLojaClient - Loja recebida:", loja ? `${loja.nome} (${loja._id})` : "Nenhuma")
  console.log("PerfilDaLojaClient - Produtos recebidos:", produtos.length)

  if (!loja && userId) {
    console.log("PerfilDaLojaClient - Mostrando formulário de criação de loja")
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Criar Loja</h1>
        <p className="mb-4">Você ainda não possui uma loja cadastrada. Crie uma agora para continuar.</p>
        <CriarLojaForm userId={userId} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button onClick={() => router.refresh()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!loja) {
    console.log("PerfilDaLojaClient - Loja não encontrada")
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Loja não encontrada</h1>
        <p className="mb-4">A loja solicitada não foi encontrada. Verifique se o ID está correto.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Voltar para o Dashboard
        </button>
      </div>
    )
  }

  console.log("PerfilDaLojaClient - Renderizando LojaPerfilContent")
  return <LojaPerfilContent loja={loja} produtos={produtos} planoInfo={planoInfo} />
}
