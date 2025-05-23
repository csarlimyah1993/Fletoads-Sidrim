"use client"

import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import LojaPerfilForm from "@/components/perfil/loja-perfil-form"

interface LojaPerfilFormServerWrapperProps {
  lojaData: {
    _id: string
    nome: string
    descricao?: string
    cnpj?: string
    endereco?: any
    contato?: any
    categorias?: string[]
    horarioFuncionamento?: any
    redesSociais?: any
    banner?: string
    logo?: string
  }
}

export default function LojaPerfilFormServerWrapper({ lojaData }: LojaPerfilFormServerWrapperProps) {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/lojas/${lojaData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: data.nomeLoja,
          descricao: data.descricao,
          logo: data.logoUrl,
          banner: data.bannerUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar perfil da loja")
      }

      toast({
        title: "Perfil atualizado",
        description: "O perfil da sua loja foi atualizado com sucesso.",
      })

      router.push("/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o perfil da loja.",
        variant: "destructive",
      })
    }
  }

  return (
    <LojaPerfilForm
      onSubmit={handleSubmit}
      initialValues={{
        nomeLoja: lojaData.nome || "",
        descricao: lojaData.descricao || "",
        logoUrl: lojaData.logo || "",
        bannerUrl: lojaData.banner || "",
      }}
    />
  )
}
