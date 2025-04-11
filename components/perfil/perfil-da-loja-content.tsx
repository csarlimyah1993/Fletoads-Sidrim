"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, MapPin, Phone, Mail, Globe, ShoppingBag, Clock, ChevronRight, Star, Palette, Layout, ImageIcon, Settings, BarChart } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"
import { GoogleMap } from "@/components/ui/google-map"

interface PerfilDaLojaContentProps {
  loja: any
  produtos: any[]
  plano: any
  limites: any
  vitrine: any
}

export function PerfilDaLojaContent({ loja, produtos = [], plano, limites, vitrine }: PerfilDaLojaContentProps) {
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
    ? `${loja.endereco.logradouro || ""}, ${loja.endereco.numero || ""}, ${loja.endereco.bairro || ""}, ${loja.endereco.cidade || ""} - ${loja.endereco.estado || ""}`
    : "Endereço não cadastrado"

  const vitrineUrl = loja._id ? `/vitrines/${loja._id}` : "#"

  const handleEditarPerfil = () => {
    router.push("/dashboard/perfil-da-loja/editar")
  }

  const handleVerProdutos = () => {
    router.push("/dashboard/produtos")
  }

  const handleVerVitrine = () => {
    if (loja._id) {
      window.open(`/vitrines/${loja._id}`, "_blank")
    } else {
      router.push("/dashboard/vitrine")
    }
  }

  const handleEditarVitrine = () => {
    router.push("/dashboard/vitrine")
  }

  const formatarEndereco = () => {
    if (!loja.endereco) return "Endereço não cadastrado"

    const { logradouro, numero, bairro, cidade, estado } = loja.endereco
    const partes = []

    if (logradouro) partes.push(logradouro + (numero ? `, ${numero}` : ""))
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

  const renderVitrinePreview = () => {
    const corPrimaria = vitrine?.configuracoes?.corPrimaria || "#3b82f6"
    const corSecundaria = vitrine?.configuracoes?.corSecundaria || "#8b5cf6"
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Prévia da Vitrine</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditarVitrine}>
              <Edit className="h-4 w-4 mr-2" />
              Personalizar
            </Button>
            <Button onClick={handleVerVitrine}>
              <Globe className="h-4 w-4 mr-2" />
              Ver Vitrine
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          {/* Header da Vitrine */}
          <div 
            className="h-16 flex items-center justify-between px-4"
            style={{ backgroundColor: corPrimaria, color: "#fff" }}
          >
            <div className="flex items-center gap-2">
              {loja.logo && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                  <Image 
                    src={loja.logo || "/placeholder.svg"} 
                    alt={loja.nome} 
                    width={32} 
                    height={32} 
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-bold">{loja.nome}</span>
            </div>
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20"></div>
              <div className="w-6 h-6 rounded-full bg-white/20"></div>
            </div>
          </div>
          
          {/* Banner */}
          <div className="h-40 relative">
            {loja.banner ? (
              <Image
                src={loja.banner || "/placeholder.svg"}
                alt="Banner"
                fill
                className="object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(to right, ${corPrimaria}, ${corSecundaria})` 
                }}
              >
                <h2 className="text-2xl font-bold text-white">{loja.nome}</h2>
              </div>
            )}
          </div>
          
          {/* Conteúdo */}
          <div className="p-4 space-y-4">
            {/* Produtos em destaque */}
            <div>
              <h3 className="font-semibold mb-2">Produtos em Destaque</h3>
              <div className="grid grid-cols-2 gap-2">
                {produtos.length > 0 ? (
                  produtos.slice(0, 2).map((produto, index) => (
                    <div key={index} className="border rounded-md overflow-hidden">
                      <div className="aspect-square relative bg-gray-100">
                        {produto.imagens && produto.imagens.length > 0 ? (
                          <Image
                            src={produto.imagens[0] || "/placeholder.svg"}
                            alt={produto.nome}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-sm font-medium truncate">{produto.nome}</p>
                        <p className="text-sm font-bold">R$ {produto.preco.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
                    Nenhum produto cadastrado
                  </div>
                )}
              </div>
            </div>
            
            {/* Informações de contato */}
            <div>
              <h3 className="font-semibold mb-2">Contato</h3>
              <div className="text-sm space-y-1">
                {loja.contato?.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{loja.contato.telefone}</span>
                  </div>
                )}
                {loja.contato?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{loja.contato.email}</span>
                  </div>
                )}
                {!loja.contato?.telefone && !loja.contato?.email && (
                  <p className="text-muted-foreground">Nenhum contato cadastrado</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderVitrineConfig = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5 text-blue-500" />
                Aparência
              </CardTitle>
              <CardDescription>Cores e fontes da vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cor Primária</span>
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: vitrine?.configuracoes?.corPrimaria || "#3b82f6" }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cor Secundária</span>
                <div 
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: vitrine?.configuracoes?.corSecundaria || "#8b5cf6" }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fonte Principal</span>
                <span className="text-sm font-medium">{vitrine?.configuracoes?.fontePrincipal || "Inter"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleEditarVitrine}>
                Editar Aparência
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-5 w-5 text-green-500" />
                Layout
              </CardTitle>
              <CardDescription>Estrutura da vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estilo</span>
                <span className="text-sm font-medium capitalize">{vitrine?.configuracoes?.layout || "Padrão"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Banner</span>
                <span className="text-sm font-medium">{vitrine?.configuracoes?.mostrarBanner !== false ? "Visível" : "Oculto"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Produtos em Destaque</span>
                <span className="text-sm font-medium">{vitrine?.configuracoes?.mostrarProdutosDestaque !== false ? "Visível" : "Oculto"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleEditarVitrine}>
                Editar Layout
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-500" />
                Imagens
              </CardTitle>
              <CardDescription>Banner e logo da vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Banner</span>
                <span className="text-sm font-medium">{loja.banner ? "Configurado" : "Não configurado"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Logo</span>
                <span className="text-sm font-medium">{loja.logo ? "Configurado" : "Não configurado"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" onClick={handleEditarVitrine}>
                Editar Imagens
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        {/* Banner com im agem real */}
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
            <TabsTrigger value="vitrine">Vitrine</TabsTrigger>
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
                      {plano?.nome || "Plano Básico"}
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
                        {limites?.panfletos?.current || 0} de {limites?.panfletos?.limit === null ? "∞" : limites?.panfletos?.limit || 0}
                      </div>
                    </div>
                    {limites?.panfletos?.limit && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          style={{
                            width: `${limites?.panfletos?.percentage || 0}%`,
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
                        {limites?.produtos?.current || 0} de {limites?.produtos?.limit === null ? "∞" : limites?.produtos?.limit || 0}
                      </div>
                    </div>
                    {limites?.produtos?.limit && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${limites?.produtos?.percentage || 0}%`,
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
                        {limites?.integracoes?.current || 0} de {limites?.integracoes?.limit === null ? "∞" : limites?.integracoes?.limit || 0}
                      </div>
                    </div>
                    {limites?.integracoes?.limit && (
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{
                            width: `${limites?.integracoes?.percentage || 0}%`,
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
                  <Button variant="default" className="w-full" onClick={handleEditarVitrine}>
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

          <TabsContent value="vitrine">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Configurações da Vitrine</h2>
                  {renderVitrineConfig()}
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Prévia da Vitrine</h2>
                  {renderVitrinePreview()}
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-blue-500" />
                    Estatísticas da Vitrine
                  </CardTitle>
                  <CardDescription>
                    Acompanhe o desempenho da sua vitrine online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">Visualizações</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">Cliques</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">Conversões</p>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <BarChart className="h-4 w-4 mr-2" />
                    Ver Estatísticas Detalhadas
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}