"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PanfletoCard } from "@/components/panfletos/panfleto-card"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Panfleto {
  _id: string
  title: string
  description: string
  images: string[]
  createdAt: string
  status: "draft" | "published"
  views: number
  clicks: number
}

export function PanfletosList() {
  const [panfletos, setPanfletos] = useState<Panfleto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPanfletos = async () => {
      try {
        const response = await fetch("/api/panfletos")
        if (!response.ok) {
          throw new Error("Falha ao carregar panfletos")
        }
        const data = await response.json()
        setPanfletos(data)
      } catch (error) {
        console.error("Erro ao carregar panfletos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus panfletos. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPanfletos()
  }, [toast])

  const filteredPanfletos = panfletos.filter(
    (panfleto) =>
      panfleto.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      panfleto.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar panfletos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/panfletos/novo")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Panfleto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPanfletos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPanfletos.map((panfleto) => (
            <PanfletoCard key={panfleto._id} panfleto={panfleto} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum panfleto encontrado</CardTitle>
            <CardDescription>
              {searchQuery
                ? "Nenhum panfleto corresponde à sua busca. Tente outros termos."
                : "Você ainda não criou nenhum panfleto. Comece criando seu primeiro panfleto agora!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/panfletos/novo")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar meu primeiro panfleto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

