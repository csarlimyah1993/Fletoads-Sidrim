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
import { GoogleMap } from "@/components/ui/google-map"
import type { Metadata } from "next"
import { ObjectId } from "mongodb" // Importando ObjectId do MongoDB

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { db } = await connectToDatabase()
    // Convertendo a string id para ObjectId
    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(params.id) })

    if (!loja) {
      return {
        title: "Vitrine não encontrada",
        description: "A vitrine que você está procurando não existe ou foi removida.",
      }
    }

    return {
      title: `${loja.nome} - Vitrine Online | FletoAds`,
      description: loja.descricao || `Conheça os produtos e serviços de ${loja.nome}`,
      openGraph: {
        title: `${loja.nome} - Vitrine Online`,
        description: loja.descricao || `Conheça os produtos e serviços de ${loja.nome}`,
        images: loja.logo ? [{ url: loja.logo }] : undefined,
      },
    }
  } catch (error) {
    console.error("Erro ao gerar metadata:", error)
    return {
      title: "Vitrine | FletoAds",
      description: "Vitrine online de produtos e serviços",
    }
  }
}

export default async function VitrinePage({ params }: PageProps) {
  const { id } = params

  if (!id) {
    notFound()
  }

  try {
    const { db } = await connectToDatabase()

    // Convertendo a string id para ObjectId
    const loja = await db.collection("lojas").findOne({ _id: new ObjectId(id) })

    if (!loja) {
      notFound()
    }

    // Buscar produtos da loja
    const produtos = await db.collection("produtos").find({ lojaId: loja._id }).limit(8).toArray()

    // Get layout style
    const layoutStyle = loja.estilos?.layout || "moderno"
    const primaryColor = loja.estilos?.cores?.primaria || "#4f46e5"
    const secondaryColor = loja.estilos?.cores?.secundaria || "#f9fafb"
    const textColor = loja.estilos?.cores?.texto || "#111827"

    // Check if widgets are enabled
    const widgets = loja.estilos?.widgets || ["produtos", "contato", "mapa"]
    const showMap = widgets.includes("mapa")
    const showProducts = widgets.includes("produtos")
    const showContact = widgets.includes("contato")
    const showSocial = widgets.includes("redesSociais")
    const showTestimonials = widgets.includes("testemunhos")

    // Get coordinates for map
    const hasCoordinates = loja.endereco?.latitude && loja.endereco?.longitude
    const latitude = hasCoordinates && loja.endereco?.latitude ? Number.parseFloat(loja.endereco.latitude) : null
    const longitude = hasCoordinates && loja.endereco?.longitude ? Number.parseFloat(loja.endereco.longitude) : null

    // Get full address for geocoding if coordinates are not available
    let fullAddress = ""
    if (!hasCoordinates && loja.endereco) {
      const endereco = loja.endereco
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
                {loja.banner ? (
                  <Image
                    src={loja.banner || "/placeholder.svg"}
                    alt={`Banner da loja ${loja.nome}`}
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
                  {loja.logo ? (
                    <Image
                      src={loja.logo || "/placeholder.svg"}
                      alt={`Logo da loja ${loja.nome}`}
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
                {loja.destaque && (
                  <Badge variant="secondary" className="px-3 py-1 bg-amber-500 text-white dark:bg-amber-600">
                    Destaque
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="pt-20 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold">{loja.nome}</CardTitle>
                  <CardDescription className="mt-1 text-sm">
                    {loja.categorias && loja.categorias.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {loja.categorias.map((categoria: string) => (
                          <Badge key={categoria} variant="outline" className="text-xs">
                            {categoria}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardDescription>
                </div>
                {loja.contato?.whatsapp && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                    <Link href={`https://wa.me/${loja.contato?.whatsapp?.replace(/\D/g, "")}`} target="_blank">
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
                  {showMap && loja.endereco && <TabsTrigger value="mapa">Mapa</TabsTrigger>}
                </TabsList>

                <TabsContent value="sobre" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl text-primary">Sobre a Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground/80">{loja.descricao || "Descrição não disponível."}</p>
                    </CardContent>
                  </Card>

                  {loja.endereco && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">Localização</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            {loja.endereco.rua && (
                              <p className="text-foreground/80">
                                {loja.endereco.rua}, {loja.endereco.numero}
                                {loja.endereco.complemento ? `, ${loja.endereco.complemento}` : ""}
                              </p>
                            )}
                            <p className="text-foreground/80">
                              {loja.endereco.bairro && `${loja.endereco.bairro}, `}
                              {loja.endereco.cidade} - {loja.endereco.estado}
                            </p>
                            {loja.endereco.cep && <p className="text-foreground/80">CEP: {loja.endereco.cep}</p>}
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
                        {produtos && produtos.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {produtos.map((produto: any) => (
                              <Card
                                key={produto._id.toString()}
                                className="overflow-hidden hover:shadow-md transition-shadow"
                              >
                                <div className="h-40 bg-muted">
                                  {produto.imagem ? (
                                    <Image
                                      src={produto.imagem || "/placeholder.svg"}
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
                        {loja.contato?.telefone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <span className="text-foreground/80">{loja.contato.telefone}</span>
                          </div>
                        )}

                        {loja?.contato?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-primary" />
                            <span className="text-foreground/80">{loja.contato.email}</span>
                          </div>
                        )}

                        {loja.horarioFuncionamento && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            <span className="text-foreground/80">{loja.horarioFuncionamento}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {showMap && loja.endereco && (
                  <TabsContent value="mapa" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">Localização no Mapa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hasCoordinates && latitude !== null && longitude !== null ? (
                          <div className="h-64 w-full">
                            <GoogleMap latitude={latitude} longitude={longitude} storeName={loja.nome || "Loja"} />
                          </div>
                        ) : fullAddress ? (
                          <div className="h-64 w-full">
                            <GoogleMap
                              latitude={null}
                              longitude={null}
                              address={fullAddress}
                              storeName={loja.nome || "Loja"}
                            />
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Localização não disponível.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>

            <div className="md:col-span-1">
              {showSocial && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl text-primary">Redes Sociais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loja.redesSociais?.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-5 w-5 text-pink-500" />
                        <Link
                          href={loja.redesSociais.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          Instagram
                        </Link>
                      </div>
                    )}
                    {loja.redesSociais?.facebook && (
                      <div className="flex items-center gap-2">
                        <Facebook className="h-5 w-5 text-blue-500" />
                        <Link
                          href={loja.redesSociais.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          Facebook
                        </Link>
                      </div>
                    )}
                    {loja.redesSociais?.twitter && (
                      <div className="flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <Link
                          href={loja.redesSociais.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          Twitter
                        </Link>
                      </div>
                    )}
                    {loja.redesSociais?.youtube && (
                      <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-500" />
                        <Link
                          href={loja.redesSociais.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          YouTube
                        </Link>
                      </div>
                    )}
                    {loja.redesSociais?.linkedin && (
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-5 w-5 text-blue-700" />
                        <Link
                          href={loja.redesSociais.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          LinkedIn
                        </Link>
                      </div>
                    )}
                    {loja.site && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <Link
                          href={loja.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground/80 hover:underline"
                        >
                          Website
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Erro ao carregar vitrine:", error)
    notFound()
  }
}
