import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  ArrowLeft,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import { ThemeToggle } from "@/components/vitrine/theme-toggle"
import { GoogleMap } from "@/components/ui/google-map"

// Define interface for produto data
interface ProdutoData {
  _id: string
  nome: string
  descricao?: string
  preco?: number
  imagem?: string
  categorias?: string[]
}

// Define interface for vitrine data
interface VitrineData {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  categorias?: string[]
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    latitude?: string
    longitude?: string
  }
  contato?: {
    telefone?: string
    whatsapp?: string
    email?: string
    site?: string
  }
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  horarioFuncionamento?: {
    segunda?: { abertura?: string; fechamento?: string; open?: boolean }
    terca?: { abertura?: string; fechamento?: string; open?: boolean }
    quarta?: { abertura?: string; fechamento?: string; open?: boolean }
    quinta?: { abertura?: string; fechamento?: string; open?: boolean }
    sexta?: { abertura?: string; fechamento?: string; open?: boolean }
    sabado?: { abertura?: string; fechamento?: string; open?: boolean }
    domingo?: { abertura?: string; fechamento?: string; open?: boolean }
  }
  destaque?: boolean
  produtos?: ProdutoData[]
  estilos?: {
    layout?: string
    cores?: {
      primaria?: string
      secundaria?: string
      texto?: string
    }
    widgets?: string[]
  }
}

// Function to get vitrine data
async function getVitrine(id: string): Promise<VitrineData | null> {
  try {
    await connectToDatabase()

    // Get models
    let Loja: mongoose.Model<any>
    let Vitrine: mongoose.Model<any>
    let Produto: mongoose.Model<any>

    try {
      Loja = mongoose.model("Loja")
    } catch (e) {
      const LojaSchema = new mongoose.Schema({
        nome: String,
        descricao: String,
        logo: String,
        banner: String,
        categorias: [String],
        endereco: {
          rua: String,
          numero: String,
          complemento: String,
          bairro: String,
          cidade: String,
          estado: String,
          cep: String,
          latitude: String,
          longitude: String,
        },
        contato: {
          telefone: String,
          whatsapp: String,
          email: String,
          site: String,
        },
        redesSociais: {
          instagram: String,
          facebook: String,
          twitter: String,
          youtube: String,
          linkedin: String,
        },
        horarioFuncionamento: {
          segunda: { abertura: String, fechamento: String, open: Boolean },
          terca: { abertura: String, fechamento: String, open: Boolean },
          quarta: { abertura: String, fechamento: String, open: Boolean },
          quinta: { abertura: String, fechamento: String, open: Boolean },
          sexta: { abertura: String, fechamento: String, open: Boolean },
          sabado: { abertura: String, fechamento: String, open: Boolean },
          domingo: { abertura: String, fechamento: String, open: Boolean },
        },
        estilos: {
          layout: String,
          cores: {
            primaria: String,
            secundaria: String,
            texto: String,
          },
          widgets: [String],
        },
        destaque: Boolean,
        ativo: { type: Boolean, default: true },
        dataCriacao: { type: Date, default: Date.now },
      })

      Loja = mongoose.model("Loja", LojaSchema)
    }

    try {
      Vitrine = mongoose.model("Vitrine")
    } catch (e) {
      const VitrineSchema = new mongoose.Schema({
        lojaId: { type: mongoose.Schema.Types.ObjectId, ref: "Loja" },
        nome: String,
        descricao: String,
        logo: String,
        banner: String,
        categorias: [String],
        endereco: {
          rua: String,
          numero: String,
          complemento: String,
          bairro: String,
          cidade: String,
          estado: String,
          cep: String,
          latitude: String,
          longitude: String,
        },
        contato: {
          telefone: String,
          whatsapp: String,
          email: String,
          site: String,
        },
        redesSociais: {
          instagram: String,
          facebook: String,
          twitter: String,
          youtube: String,
          linkedin: String,
        },
        horarioFuncionamento: {
          segunda: { abertura: String, fechamento: String, open: Boolean },
          terca: { abertura: String, fechamento: String, open: Boolean },
          quarta: { abertura: String, fechamento: String, open: Boolean },
          quinta: { abertura: String, fechamento: String, open: Boolean },
          sexta: { abertura: String, fechamento: String, open: Boolean },
          sabado: { abertura: String, fechamento: String, open: Boolean },
          domingo: { abertura: String, fechamento: String, open: Boolean },
        },
        estilos: {
          layout: String,
          cores: {
            primaria: String,
            secundaria: String,
            texto: String,
          },
          widgets: [String],
        },
        destaque: Boolean,
        ativo: { type: Boolean, default: true },
        dataCriacao: { type: Date, default: Date.now },
      })

      Vitrine = mongoose.model("Vitrine", VitrineSchema)
    }

    try {
      Produto = mongoose.model("Produto")
    } catch (e) {
      const ProdutoSchema = new mongoose.Schema({
        lojaId: { type: mongoose.Schema.Types.ObjectId, ref: "Loja" },
        vitrineId: { type: mongoose.Schema.Types.ObjectId, ref: "Vitrine" },
        nome: String,
        descricao: String,
        preco: Number,
        imagem: String,
        categorias: [String],
        ativo: { type: Boolean, default: true },
        dataCriacao: { type: Date, default: Date.now },
      })

      Produto = mongoose.model("Produto", ProdutoSchema)
    }

    // Tentar buscar como loja primeiro
    let vitrineDoc = null

    try {
      vitrineDoc = await Loja.findById(id).exec()
    } catch (error) {
      console.error("Erro ao buscar loja:", error)
    }

    // Se não encontrar como loja, buscar como vitrine
    if (!vitrineDoc) {
      try {
        vitrineDoc = await Vitrine.findById(id).exec()
      } catch (error) {
        console.error("Erro ao buscar vitrine:", error)
      }
    }

    if (!vitrineDoc) {
      return null
    }

    // Ensure vitrineDoc has the required fields
    if (!vitrineDoc.nome) {
      console.error("Vitrine document is missing required fields:", vitrineDoc)
      return null
    }

    // Convert MongoDB document to VitrineData
    const vitrine: VitrineData = {
      _id: vitrineDoc._id.toString(),
      nome: vitrineDoc.nome,
      descricao: vitrineDoc.descricao,
      logo: vitrineDoc.logo,
      banner: vitrineDoc.banner,
      categorias: vitrineDoc.categorias,
      endereco: vitrineDoc.endereco,
      contato: vitrineDoc.contato,
      redesSociais: vitrineDoc.redesSociais,
      horarioFuncionamento: vitrineDoc.horarioFuncionamento,
      destaque: vitrineDoc.destaque,
      estilos: vitrineDoc.estilos || {
        layout: "moderno",
        cores: {
          primaria: "#4f46e5",
          secundaria: "#f9fafb",
          texto: "#111827",
        },
        widgets: ["produtos", "contato", "mapa"],
      },
      produtos: [],
    }

    // Buscar produtos relacionados
    try {
      const produtosQuery = {
        $or: [{ lojaId: vitrineDoc._id }, { vitrineId: vitrineDoc._id }],
      }

      const produtosDoc = await Produto.find(produtosQuery).limit(8).exec()

      // Convert product documents to ProdutoData
      vitrine.produtos = produtosDoc.map((produto: any) => ({
        _id: produto._id.toString(),
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        imagem: produto.imagem,
        categorias: produto.categorias,
      }))
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      vitrine.produtos = []
    }

    return vitrine
  } catch (error) {
    console.error("Erro ao buscar vitrine:", error)
    return null
  }
}

interface PageProps {
  params: { id: string }
}

export default async function VitrinePage({ params }: PageProps) {
  // Corrigindo o erro de params.id - garantindo que é uma string
  const id = String(params.id)

  if (!id) {
    notFound()
  }

  const vitrine = await getVitrine(id)

  if (!vitrine) {
    notFound()
  }

  // Get layout style
  const layoutStyle = vitrine.estilos?.layout || "moderno"
  const primaryColor = vitrine.estilos?.cores?.primaria || "#4f46e5"
  const secondaryColor = vitrine.estilos?.cores?.secundaria || "#f9fafb"
  const textColor = vitrine.estilos?.cores?.texto || "#111827"

  // Check if widgets are enabled
  const widgets = vitrine.estilos?.widgets || ["produtos", "contato", "mapa"]
  const showMap = widgets.includes("mapa")
  const showProducts = widgets.includes("produtos")
  const showContact = widgets.includes("contato")
  const showSocial = widgets.includes("redesSociais")
  const showTestimonials = widgets.includes("testemunhos")

  // Get coordinates for map
  const hasCoordinates = vitrine.endereco?.latitude && vitrine.endereco?.longitude
  const latitude = hasCoordinates && vitrine.endereco?.latitude ? Number.parseFloat(vitrine.endereco.latitude) : null
  const longitude = hasCoordinates && vitrine.endereco?.longitude ? Number.parseFloat(vitrine.endereco.longitude) : null

  // Get full address for geocoding if coordinates are not available
  let fullAddress = ""
  if (!hasCoordinates && vitrine.endereco) {
    const endereco = vitrine.endereco
    const parts = [
      endereco.rua || "",
      endereco.numero || "",
      endereco.cidade || "",
      endereco.estado || "",
      endereco.cep || "",
    ].filter(Boolean) // Remove empty strings

    fullAddress = parts.join(", ")
  }

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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/vitrines">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Vitrines
            </Link>
          </Button>
        </div>

        {/* Banner e informações básicas */}
        <Card className="w-full overflow-hidden mb-8 border-none shadow-lg">
          <div className="relative">
            <div className="w-full h-64 md:h-80 bg-muted overflow-hidden">
              {vitrine.banner ? (
                <Image
                  src={vitrine.banner || "/placeholder.svg?height=320&width=1200"}
                  alt={`Banner da loja ${vitrine.nome}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10 text-muted-foreground">
                  <span className="text-lg">Banner não disponível</span>
                </div>
              )}
            </div>

            <div className="absolute -bottom-16 left-6 w-32 h-32 bg-background rounded-lg shadow-md p-1">
              <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
                {vitrine.logo ? (
                  <Image
                    src={vitrine.logo || "/placeholder.svg?height=128&width=128"}
                    alt={`Logo da loja ${vitrine.nome}`}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10 text-muted-foreground">
                    <span>Logo</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              {vitrine.destaque && (
                <Badge variant="secondary" className="px-3 py-1 bg-amber-500 text-white dark:bg-amber-600">
                  Destaque
                </Badge>
              )}
            </div>
          </div>

          <CardHeader className="pt-20 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">{vitrine.nome}</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  {vitrine.categorias && vitrine.categorias.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vitrine.categorias.map((categoria: string) => (
                        <Badge key={categoria} variant="outline" className="text-xs">
                          {categoria}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </CardDescription>
              </div>
              {vitrine.contato?.whatsapp && (
                <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                  <Link href={`https://wa.me/${vitrine.contato?.whatsapp?.replace(/\D/g, "")}`} target="_blank">
                    Contatar via WhatsApp
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Tabs defaultValue="sobre" className="w-full">
              <TabsList className="mb-4 bg-muted/80">
                <TabsTrigger value="sobre">Sobre</TabsTrigger>
                {showProducts && <TabsTrigger value="produtos">Produtos</TabsTrigger>}
                {showContact && <TabsTrigger value="contato">Contato</TabsTrigger>}
                {showMap && vitrine.endereco && <TabsTrigger value="mapa">Mapa</TabsTrigger>}
              </TabsList>

              <TabsContent value="sobre" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">Sobre a Loja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{vitrine.descricao || "Descrição não disponível."}</p>
                  </CardContent>
                </Card>

                {vitrine.endereco && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">Localização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          {vitrine.endereco.rua && (
                            <p className="text-foreground/80">
                              {vitrine.endereco.rua}, {vitrine.endereco.numero}
                              {vitrine.endereco.complemento ? `, ${vitrine.endereco.complemento}` : ""}
                            </p>
                          )}
                          <p className="text-foreground/80">
                            {vitrine.endereco.bairro && `${vitrine.endereco.bairro}, `}
                            {vitrine.endereco.cidade} - {vitrine.endereco.estado}
                          </p>
                          {vitrine.endereco.cep && <p className="text-foreground/80">CEP: {vitrine.endereco.cep}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {showProducts && (
                <TabsContent value="produtos" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vitrine.produtos && vitrine.produtos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {vitrine.produtos.map((produto: ProdutoData) => (
                            <Card key={produto._id} className="overflow-hidden hover:shadow-md transition-shadow">
                              <div className="h-40 bg-muted">
                                {produto.imagem ? (
                                  <Image
                                    src={produto.imagem || "/placeholder.svg?height=160&width=300"}
                                    alt={produto.nome}
                                    width={300}
                                    height={160}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5 text-muted-foreground">
                                    <span>Sem imagem</span>
                                  </div>
                                )}
                              </div>
                              <CardHeader className="p-3">
                                <CardTitle className="text-base">{produto.nome}</CardTitle>
                                <CardDescription>
                                  {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  }).format(produto.preco || 0)}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Nenhum produto disponível.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {showContact && (
                <TabsContent value="contato" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vitrine.contato?.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-primary" />
                          <span className="text-foreground/80">{vitrine.contato.telefone}</span>
                        </div>
                      )}

                      {vitrine.contato?.whatsapp && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span className="text-foreground/80">{vitrine.contato.whatsapp} (WhatsApp)</span>
                        </div>
                      )}

                      {vitrine.contato?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          <span className="text-foreground/80">{vitrine.contato.email}</span>
                        </div>
                      )}

                      {vitrine.contato?.site && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <a
                            href={
                              vitrine.contato.site.startsWith("http")
                                ? vitrine.contato.site
                                : `https://${vitrine.contato.site}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {vitrine.contato.site}
                          </a>
                        </div>
                      )}

                      {showSocial && vitrine.redesSociais && Object.values(vitrine.redesSociais).some(Boolean) && (
                        <div className="pt-4">
                          <h4 className="text-sm font-medium mb-2">Redes Sociais</h4>
                          <div className="flex gap-4">
                            {vitrine.redesSociais.instagram && (
                              <a
                                href={`https://instagram.com/${vitrine.redesSociais.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-primary transition-colors"
                              >
                                <Instagram className="h-5 w-5" />
                              </a>
                            )}

                            {vitrine.redesSociais.facebook && (
                              <a
                                href={vitrine.redesSociais.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-primary transition-colors"
                              >
                                <Facebook className="h-5 w-5" />
                              </a>
                            )}

                            {vitrine.redesSociais.twitter && (
                              <a
                                href={vitrine.redesSociais.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-primary transition-colors"
                              >
                                <Twitter className="h-5 w-5" />
                              </a>
                            )}

                            {vitrine.redesSociais.youtube && (
                              <a
                                href={vitrine.redesSociais.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-primary transition-colors"
                              >
                                <Youtube className="h-5 w-5" />
                              </a>
                            )}

                            {vitrine.redesSociais.linkedin && (
                              <a
                                href={vitrine.redesSociais.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/70 hover:text-primary transition-colors"
                              >
                                <Linkedin className="h-5 w-5" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {showMap && (
                <TabsContent value="mapa" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">Localização no Mapa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(latitude && longitude) || fullAddress ? (
                        <div className="h-[400px] w-full rounded-md overflow-hidden">
                          <GoogleMap
                            latitude={latitude}
                            longitude={longitude}
                            address={fullAddress}
                            storeName={vitrine.nome}
                          />
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Localização no mapa não disponível.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-card shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Clock className="h-5 w-5" />
                  Horários de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {vitrine.horarioFuncionamento ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Segunda-feira</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.segunda?.open !== false &&
                          vitrine.horarioFuncionamento.segunda?.abertura &&
                          vitrine.horarioFuncionamento.segunda?.fechamento
                            ? `${vitrine.horarioFuncionamento.segunda.abertura} - ${vitrine.horarioFuncionamento.segunda.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Terça-feira</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.terca?.open !== false &&
                          vitrine.horarioFuncionamento.terca?.abertura &&
                          vitrine.horarioFuncionamento.terca?.fechamento
                            ? `${vitrine.horarioFuncionamento.terca.abertura} - ${vitrine.horarioFuncionamento.terca.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Quarta-feira</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.quarta?.open !== false &&
                          vitrine.horarioFuncionamento.quarta?.abertura &&
                          vitrine.horarioFuncionamento.quarta?.fechamento
                            ? `${vitrine.horarioFuncionamento.quarta.abertura} - ${vitrine.horarioFuncionamento.quarta.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Quinta-feira</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.quinta?.open !== false &&
                          vitrine.horarioFuncionamento.quinta?.abertura &&
                          vitrine.horarioFuncionamento.quinta?.fechamento
                            ? `${vitrine.horarioFuncionamento.quinta.abertura} - ${vitrine.horarioFuncionamento.quinta.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Sexta-feira</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.sexta?.open !== false &&
                          vitrine.horarioFuncionamento.sexta?.abertura &&
                          vitrine.horarioFuncionamento.sexta?.fechamento
                            ? `${vitrine.horarioFuncionamento.sexta.abertura} - ${vitrine.horarioFuncionamento.sexta.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/40">
                        <span className="text-sm font-medium">Sábado</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.sabado?.open !== false &&
                          vitrine.horarioFuncionamento.sabado?.abertura &&
                          vitrine.horarioFuncionamento.sabado?.fechamento
                            ? `${vitrine.horarioFuncionamento.sabado.abertura} - ${vitrine.horarioFuncionamento.sabado.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-sm font-medium">Domingo</span>
                        <span className="text-sm">
                          {vitrine.horarioFuncionamento.domingo?.open !== false &&
                          vitrine.horarioFuncionamento.domingo?.abertura &&
                          vitrine.horarioFuncionamento.domingo?.fechamento
                            ? `${vitrine.horarioFuncionamento.domingo.abertura} - ${vitrine.horarioFuncionamento.domingo.fechamento}`
                            : "Fechado"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Horários não disponíveis.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t bg-muted/40">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre FletoAds</h3>
              <p className="text-muted-foreground text-sm">
                Plataforma completa para criação e gerenciamento de vitrines digitais para seu negócio.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Início
                  </Link>
                </li>
                <li>
                  <Link href="/vitrines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Explorar Vitrines
                  </Link>
                </li>
                <li>
                  <Link href="/planos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Planos
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contato@fletoads.com</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>(11) 99999-9999</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FletoAds. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

