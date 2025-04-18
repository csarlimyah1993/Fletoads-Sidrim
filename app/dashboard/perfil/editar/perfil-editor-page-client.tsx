"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import LojaPerfilForm from '@/components/perfil/loja-perfil-form';

interface Loja {
  _id?: string
  nome?: string
  descricao?: string
  logo?: string
  banner?: string
}

export default function PerfilEditorPageClient() {
  const { data: session, status } = useSession()
  const [loja, setLoja] = useState<Loja | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push("/login")
    }

    const fetchLoja = async () => {
      setIsLoading(true)
      try {
        if (!session?.user?.email) {
          throw new Error("Usuário não autenticado")
        }
        const response = await fetch(`/api/lojas?email=${session.user.email}`)
        if (!response.ok) {
          throw new Error("Falha ao buscar perfil da loja")
        }
        const data = await response.json()
        setLoja(data.loja)
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar o perfil da loja.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoja()
  }, [session, status, router])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando perfil...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil da Loja</CardTitle>
      </CardHeader>
      <CardContent>
        {loja && (
          <LojaPerfilForm
            onSubmit={async (data) => {
              try {
                const response = await fetch(`/api/lojas/${loja._id || "new"}`, {
                  method: loja._id ? "PATCH" : "POST",
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

                // Refresh the page or redirect
                window.location.href = "/dashboard/perfil"
              } catch (error) {
                console.error("Erro ao atualizar perfil:", error)
                toast({
                  title: "Erro",
                  description: "Ocorreu um erro ao atualizar o perfil da loja.",
                  variant: "destructive",
                })
              }
            }}
            initialValues={{
              nomeLoja: loja.nome || "",
              descricao: loja.descricao || "",
              logoUrl: loja.logo || "",
              bannerUrl: loja.banner || "",
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
