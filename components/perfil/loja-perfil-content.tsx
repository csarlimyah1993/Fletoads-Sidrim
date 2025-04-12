"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MapPin, Phone, Mail, Globe, ShoppingBag, Clock, ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import type { LojaPerfilContentProps } from "@/types/loja"

export function LojaPerfilContent({ loja, produtos = [], isLoading = false, planoInfo }: LojaPerfilContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("info")

  if (!loja) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Nenhuma loja encontrada</h2>
        <p className="text-muted-foreground mb-4">Você ainda não possui uma loja cadastrada.</p>
        <Button asChild>
          <Link href="/dashboard/perfil-da-loja/criar">Criar Loja</Link>
        </Button>
      </div>
    )
  }

  const endereco = loja.endereco
    ? `${loja.endereco.logradouro || loja.endereco.rua || ""}, ${loja.endereco.numero || ""}, ${
        loja.endereco.bairro || ""
      }, ${loja.endereco.cidade || ""} - ${loja.endereco.estado || ""}`
    : "Endereço não cadastrado"

  const vitrineUrl = loja._id ? `/vitrines/${loja._id}` : "#"

  const handleEditarPerfil = () => {
    router.push("/dashboard/perfil-da-loja/editar")
  }

  const handleVerProdutos = () => {
    router.push("/dashboard/produtos")
  }

  const handleVerVitrine = () => {
    if (loja.vitrineId) {
      console.log(`Redirecionando para vitrine com ID: ${loja.vitrineId}`)
      window.open(`/vitrines/${loja.vitrineId}`, "_blank")
    } else if (loja._id) {
      console.log(`Nenhuma vitrineId encontrada, usando _id: ${loja._id}`)
      window.open(`/vitrines/${loja._id}`, "_blank")
    } else {
      console.log("Nenhum ID encontrado, redirecionando para configuração")
      router.push("/dashboard/vitrine")
    }
  }

  const formatarEndereco = () => {
    if (!loja.endereco) return "Endereço não cadastrado"

    const { rua, numero, bairro, cidade, estado, logradouro } = loja.endereco
    const partes = []

    if (logradouro || rua) partes.push((logradouro || rua) + (numero ? `, ${numero}` : ""))
    if (bairro) partes.push(bairro)
    if (cidade) partes.push(cidade + (estado ? ` - ${estado}` : ""))

    return partes.join(", ") || "Endereço não cadastrado"
  }

  const formatarHorario = (horario?: string | { open?: boolean; abertura?: string; fechamento?: string }) => {
    if (!horario) return "Fechado"

    // Se for uma string, retorna diretamente
    if (typeof horario === "string") {
      return horario
    }

    // Se for um objeto, formata adequadamente
    if (typeof horario === "object") {
      if (!horario.open) return "Fechado"
      return `${horario.abertura || "00:00"} - ${horario.fechamento || "00:00"}`
    }

    return "Horário não disponível"
  }

  const renderHorariosFuncionamento = () => {
    if (!loja.horarioFuncionamento) {
      return <p className="text-muted-foreground">Horários não cadastrados</p>
    }

    const diasSemana = [
      { dia: "Segunda", valor: loja.horarioFuncionamento.segunda },
      { dia: "Terça", valor: loja.horarioFuncionamento.terca },
      { dia: "Quarta", valor: loja.horarioFuncionamento.quarta },
      { dia: "Quinta", valor: loja.horarioFuncionamento.quinta },
      { dia: "Sexta", valor: loja.horarioFuncionamento.sexta },
      { dia: "Sábado", valor: loja.horarioFuncionamento.sabado },
      { dia: "Domingo", valor: loja.horarioFuncionamento.domingo },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {diasSemana.map((item) => (
          <div key={item.dia} className="flex justify-between">
            <span className="font-medium">{item.dia}:</span>
            <span className="text-muted-foreground">{formatarHorario(item.valor)}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderProdutos = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (!produtos || produtos.length === 0) {
      return (
        <div className="text-center py-8">
          <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Você ainda não tem produtos cadastrados. Comece a adicionar produtos para exibi-los em sua vitrine.
          </p>
          <Button onClick={() => router.push("/dashboard/produtos/novo")}>Adicionar Produto</Button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {produtos.map((produto, index) => (
          <motion.div
            key={produto._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden h-full border hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <Link href={`/dashboard/produtos/${produto._id}`}>
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={produto.imagens[0] || "/placeholder.svg"}
                        alt={produto.nome}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {produto.destaque && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600">
                      <Star className="h-3 w-3 mr-1" />
                      Destaque
                    </Badge>
                  )}
                  {produto.precoPromocional && produto.precoPromocional < produto.preco && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">Promoção</Badge>
                  )}
                  {produto.ativo === false && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="outline" className="bg-black/80 text-white border-white">
                        Inativo
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium line-clamp-1">{produto.nome}</h3>
                  {produto.descricaoCurta && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{produto.descricaoCurta}</p>
                  )}
                  <div className="mt-2 flex items-baseline gap-2">
                    {produto.precoPromocional ? (
                      <>
                        <span className="font-bold text-green-600 dark:text-green-500">
                          R$ {produto.precoPromocional.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-sm line-through">
                          R$ {produto.preco.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">R$ {produto.preco.toFixed(2)}</span>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  // Componente para o Google Map (simplificado)
  const GoogleMap = ({ latitude, longitude, address, storeName }: any) => {
    if (!latitude || !longitude) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">Localização não disponível</p>
          </div>
        </div>
      )
    }

    // Aqui você pode implementar a integração real com o Google Maps
    return (
      <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <p className="font-medium">{storeName}</p>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Banner com imagem real */}
        <div
          className="w-full h-48 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden"
          style={{
            backgroundImage: loja.banner ? `url(${loja.banner})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Logo */}
        <div className="absolute -bottom-12 left-8">
          <div className="rounded-full border-4 border-background w-24 h-24 overflow-hidden bg-gray-200">
            {loja.logo ? (
              <img
                src={loja.logo || "/placeholder.svg"}
                alt={`Logo ${loja.nome}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">Logo</div>
            )}
          </div>
        </div>
      </div>

      {/* Informações da loja */}
      <div className="pt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{loja.nome}</h1>
            {loja.descricao && <p className="text-muted-foreground mt-1">{loja.descricao}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleEditarPerfil}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
            <Button variant="outline" onClick={handleVerVitrine}>
              <Globe className="h-4 w-4 mr-2" />
              Ver Vitrine
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Endereço */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{formatarEndereco()}</p>

                  {/* Google Maps */}
                  <div className="h-64 w-full rounded-md overflow-hidden">
                    <GoogleMap
                      latitude={loja.endereco?.latitude || null}
                      longitude={loja.endereco?.longitude || null}
                      address={formatarEndereco()}
                      storeName={loja.nome}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-500" />
                    Contato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {loja.contato?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{loja.contato.telefone}</span>
                    </div>
                  )}
                  {loja.contato?.whatsapp && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
                      </svg>
                      <span>{loja.contato.whatsapp}</span>
                    </div>
                  )}
                  {loja.contato?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{loja.contato.email}</span>
                    </div>
                  )}
                  {loja.contato?.site && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={loja.contato.site.startsWith("http") ? loja.contato.site : `https://${loja.contato.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {loja.contato.site}
                      </a>
                    </div>
                  )}
                  {!loja.contato?.telefone &&
                    !loja.contato?.whatsapp &&
                    !loja.contato?.email &&
                    !loja.contato?.site && <p className="text-muted-foreground">Nenhum contato cadastrado</p>}
                </CardContent>
              </Card>

              {/* Horário de Funcionamento */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Horário de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderHorariosFuncionamento()}</CardContent>
              </Card>

              {/* Plano */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-500"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Seu Plano
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0"
                    >
                      {planoInfo?.nome || "Plano Básico"}
                    </Badge>
                  </div>
                  <CardDescription>Acompanhe o uso dos recursos do seu plano</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-blue-500"
                        >
                          <path d="M21 8v12H3V8" />
                          <path d="M1 3h22v5H1z" />
                          <path d="M10 12h4" />
                        </svg>
                        <span>Panfletos</span>
                      </div>
                      <div className="text-sm font-medium">
                        {planoInfo?.panfletos?.usado || 0} de {planoInfo?.panfletos?.limite || "∞"}
                      </div>
                    </div>
                    {planoInfo?.panfletos?.limite && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((planoInfo?.panfletos?.usado || 0) / (planoInfo?.panfletos?.limite || 1)) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-green-500" />
                        <span>Produtos</span>
                      </div>
                      <div className="text-sm font-medium">
                        {planoInfo?.produtos?.usado || 0} de {planoInfo?.produtos?.limite || "∞"}
                      </div>
                    </div>
                    {planoInfo?.produtos?.limite && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((planoInfo?.produtos?.usado || 0) / (planoInfo?.produtos?.limite || 1)) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-amber-500"
                        >
                          <path d="M16 16h6" />
                          <path d="M19 13v6" />
                          <path d="M12 15V3a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v18" />
                          <path d="M9 21h1a2 2 0 0 0 2-2v-4" />
                          <path d="M4 15h2" />
                          <path d="M4 11h2" />
                          <path d="M4 7h2" />
                          <path d="M4 3h2" />
                        </svg>
                        <span>Integrações</span>
                      </div>
                      <div className="text-sm font-medium">
                        {planoInfo?.integracoes?.usado || 0} de {planoInfo?.integracoes?.limite || "∞"}
                      </div>
                    </div>
                    {planoInfo?.integracoes?.limite && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((planoInfo?.integracoes?.usado || 0) / (planoInfo?.integracoes?.limite || 1)) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full" onClick={() => router.push("/planos")}>
                    <span>Ver planos</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Vitrine Web */}
              <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    Vitrine Web
                  </CardTitle>
                  <CardDescription>Sua loja online para vender produtos e serviços</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Configure sua vitrine web para que seus clientes possam ver seus produtos e serviços online.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full" onClick={handleVerVitrine}>
                    <span>Configurar Vitrine</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="produtos">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Produtos da Loja</h2>
                <Button onClick={handleVerProdutos}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </div>
              {renderProdutos()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
