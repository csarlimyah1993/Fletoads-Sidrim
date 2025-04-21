'use client'

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Store, Coffee, Utensils, Home, Shirt, Gift, Smartphone, Book, Heart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/vitrine/theme-toggle"
import { VitrinesFooter } from "@/components/vitrines/footer"
import { LojasProximas } from "@/components/vitrines/lojas-proximas"

interface VitrineData {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  categorias?: string[]
  endereco?: {
    cidade?: string
    estado?: string
  }
}

const categorias = [
  { id: "todas", nome: "Todas", icon: <Store className="h-4 w-4" /> },
  { id: "restaurantes", nome: "Restaurantes", icon: <Utensils className="h-4 w-4" /> },
  { id: "cafeterias", nome: "Cafeterias", icon: <Coffee className="h-4 w-4" /> },
  { id: "moda", nome: "Moda", icon: <Shirt className="h-4 w-4" /> },
  { id: "tecnologia", nome: "Tecnologia", icon: <Smartphone className="h-4 w-4" /> },
  { id: "decoracao", nome: "Decoração", icon: <Home className="h-4 w-4" /> },
  { id: "presentes", nome: "Presentes", icon: <Gift className="h-4 w-4" /> },
  { id: "livros", nome: "Livros", icon: <Book className="h-4 w-4" /> },
  { id: "saude", nome: "Saúde e Beleza", icon: <Heart className="h-4 w-4" /> },
]

function VitrinesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-full">
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function VitrineCard({ vitrine }: { vitrine: VitrineData }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden">
        {vitrine.banner ? (
          <Image
            src={vitrine.banner}
            alt={`Banner da loja ${vitrine.nome}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/5">
            <Store className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1">{vitrine.nome}</CardTitle>
        {vitrine.endereco?.cidade && vitrine.endereco?.estado && (
          <CardDescription className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {vitrine.endereco.cidade}, {vitrine.endereco.estado}
            </span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {vitrine.descricao || "Sem descrição disponível"}
        </p>

        {vitrine.categorias && vitrine.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vitrine.categorias.slice(0, 3).map((categoria) => (
              <Badge key={categoria} variant="secondary" className="text-xs">
                {categoria}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/vitrines/${vitrine._id}`}>Ver Vitrine</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function VitrinesPage() {
  const [vitrines, setVitrines] = useState<VitrineData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    categoria: 'todas',
    cidade: 'todas',
    estado: 'todas',
    busca: ''
  })

  useEffect(() => {
    const fetchVitrines = async () => {
      try {
        setLoading(true)
        const query = new URLSearchParams()
        if (searchParams.categoria !== 'todas') query.append('categoria', searchParams.categoria)
        if (searchParams.cidade !== 'todas') query.append('cidade', searchParams.cidade)
        if (searchParams.estado !== 'todas') query.append('estado', searchParams.estado)
        if (searchParams.busca) query.append('busca', searchParams.busca)

        const response = await fetch(`/api/vitrines?${query.toString()}`)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar vitrines')
        }

        const data = await response.json()
        setVitrines(data.lojas)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchVitrines()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">
              fleto<span className="text-foreground">Ads</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="text-sm">
              <Link href="/registro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Encontre as melhores lojas e serviços para você</h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
              Descubra negócios locais, produtos exclusivos e serviços de qualidade em um só lugar.
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar lojas, produtos ou serviços..." 
                  className="pl-9 w-full"
                  value={searchParams.busca}
                  onChange={(e) => setSearchParams({...searchParams, busca: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Select 
                  value={searchParams.estado}
                  onValueChange={(value) => setSearchParams({...searchParams, estado: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos os estados</SelectItem>
                    {/* Adicione os estados aqui */}
                  </SelectContent>
                </Select>
                <Select 
                  value={searchParams.cidade}
                  onValueChange={(value) => setSearchParams({...searchParams, cidade: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as cidades</SelectItem>
                    {/* Adicione as cidades aqui */}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar com categorias - Mobile como accordion/dropdown */}
          <div className="lg:w-64 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              {/* Mobile categories dropdown */}
              <div className="lg:hidden mb-4">
                <Select
                  value={searchParams.categoria}
                  onValueChange={(value) => setSearchParams({...searchParams, categoria: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{categoria.icon}</span>
                          {categoria.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Desktop categories list */}
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold mb-4">Categorias</h2>
                <div className="space-y-1">
                  {categorias.map((categoria) => (
                    <Button
                      key={categoria.id}
                      variant={categoria.id === searchParams.categoria ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSearchParams({...searchParams, categoria: categoria.id})}
                    >
                      <span className="mr-2">{categoria.icon}</span>
                      {categoria.nome}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 hidden sm:block">
                <LojasProximas />
              </div>
            </div>
          </div>

          {/* Lista de vitrines */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold">Vitrines</h2>
              <p className="text-sm text-muted-foreground">
                {vitrines.length} {vitrines.length === 1 ? "resultado" : "resultados"} encontrados
              </p>
            </div>

            {loading ? (
              <VitrinesSkeleton />
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <Store className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Erro ao carregar vitrines</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
                <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
              </div>
            ) : vitrines.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {vitrines.map((vitrine) => (
                  <VitrineCard key={vitrine._id} vitrine={vitrine} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Store className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Nenhuma vitrine encontrada</h3>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  Não encontramos nenhuma vitrine com os filtros selecionados.
                </p>
                <Button asChild size="sm" className="text-sm">
                  <Link href="/dashboard/perfil-da-loja/criar">Criar minha vitrine</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <VitrinesFooter />
    </div>
  )
}