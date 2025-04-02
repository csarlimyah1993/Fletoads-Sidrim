import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Store, Coffee, Utensils, Home, Shirt, Gift, Smartphone, Book, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeToggle } from "@/components/vitrine/theme-toggle"
import { VitrinesFooter } from "@/components/vitrines/footer"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

// Definir interface para os dados da vitrine
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

// Função para buscar vitrines
async function getVitrines(): Promise<VitrineData[]> {
  try {
    await connectToDatabase()

    // Verificar se o modelo Loja existe
    let Loja
    try {
      Loja = mongoose.model("Loja")
    } catch (e) {
      // Se não existir, criar o modelo
      const LojaSchema = new mongoose.Schema({
        nome: String,
        descricao: String,
        logo: String,
        banner: String,
        categorias: [String],
        endereco: {
          cidade: String,
          estado: String,
        },
        ativo: { type: Boolean, default: true },
      })

      Loja = mongoose.model("Loja", LojaSchema)
    }

    // Verificar se o modelo Vitrine existe
    let Vitrine
    try {
      Vitrine = mongoose.model("Vitrine")
    } catch (e) {
      // Se não existir, criar o modelo
      const VitrineSchema = new mongoose.Schema({
        nome: String,
        descricao: String,
        logo: String,
        banner: String,
        categorias: [String],
        endereco: {
          cidade: String,
          estado: String,
        },
        ativo: { type: Boolean, default: true },
      })

      Vitrine = mongoose.model("Vitrine", VitrineSchema)
    }

    // Buscar lojas ativas
    const lojas = await Loja.find({ ativo: true }).lean().exec()

    // Buscar vitrines ativas
    const vitrines = await Vitrine.find({ ativo: true }).lean().exec()

    // Combinar resultados
    const combinedResults = [...lojas, ...vitrines]

    // Converter para o formato esperado
    return combinedResults.map((item) => ({
      _id: item._id.toString(),
      nome: item.nome,
      descricao: item.descricao,
      logo: item.logo,
      banner: item.banner,
      categorias: item.categorias,
      endereco: item.endereco,
    }))
  } catch (error) {
    console.error("Erro ao buscar vitrines:", error)
    return []
  }
}

// Categorias disponíveis
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

// Estados brasileiros
const estados = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
]

// Componente de carregamento para vitrines
function VitrinesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-40 bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// Componente de vitrine
function VitrineCard({ vitrine }: { vitrine: VitrineData }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60">
      <div className="h-40 bg-muted relative overflow-hidden group">
        {vitrine.banner ? (
          <Image
            src={vitrine.banner || "/placeholder.svg"}
            alt={`Banner da loja ${vitrine.nome}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/5 text-muted-foreground">
            <span>Sem imagem</span>
          </div>
        )}

        {vitrine.logo && (
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-background rounded-md shadow-md p-1">
            <div className="w-full h-full bg-muted rounded overflow-hidden">
              <Image
                src={vitrine.logo || "/placeholder.svg"}
                alt={`Logo da loja ${vitrine.nome}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{vitrine.nome}</CardTitle>
        {vitrine.endereco?.cidade && vitrine.endereco?.estado && (
          <CardDescription className="flex items-center gap-1 text-xs">
            <MapPin className="h-3 w-3" />
            {vitrine.endereco.cidade}, {vitrine.endereco.estado}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">{vitrine.descricao || "Sem descrição disponível"}</p>

        {vitrine.categorias && vitrine.categorias.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {vitrine.categorias.slice(0, 3).map((categoria) => (
              <Badge key={categoria} variant="outline" className="text-xs">
                {categoria}
              </Badge>
            ))}
            {vitrine.categorias.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{vitrine.categorias.length - 3}
              </Badge>
            )}
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

export default async function VitrinesPage() {
  const vitrines = await getVitrines()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">
              fleto<span className="text-foreground">Ads</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Encontre as melhores lojas e serviços para você</h1>
            <p className="text-muted-foreground mb-8">
              Descubra negócios locais, produtos exclusivos e serviços de qualidade em um só lugar.
            </p>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar lojas, produtos ou serviços..." className="pl-9 w-full" />
              </div>
              <Select defaultValue="todos">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.sigla} value={estado.sigla}>
                      {estado.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="todas">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  <SelectItem value="sao-paulo">São Paulo</SelectItem>
                  <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                  <SelectItem value="belo-horizonte">Belo Horizonte</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com categorias */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4">Categorias</h2>
              <div className="space-y-1">
                {categorias.map((categoria) => (
                  <Button
                    key={categoria.id}
                    variant={categoria.id === "todas" ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{categoria.icon}</span>
                    {categoria.nome}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de vitrines */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Vitrines</h2>
              <p className="text-sm text-muted-foreground">
                {vitrines.length} {vitrines.length === 1 ? "resultado" : "resultados"} encontrados
              </p>
            </div>

            <Suspense fallback={<VitrinesSkeleton />}>
              {vitrines.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vitrines.map((vitrine) => (
                    <VitrineCard key={vitrine._id} vitrine={vitrine} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma vitrine encontrada</h3>
                  <p className="text-muted-foreground mb-6">
                    Não encontramos nenhuma vitrine com os filtros selecionados.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/perfil-da-loja/criar">Criar minha vitrine</Link>
                  </Button>
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer */}
      <VitrinesFooter />
    </div>
  )
}

