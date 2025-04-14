"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  ArrowLeft,
  Share2,
  Plus,
  Minus,
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ShoppingBag,
  X,
  AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import type { Loja, Produto } from "@/types/loja"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"

interface ProdutoDetalheProps {
  loja: Loja
  produto: Produto
  vitrineId: string
}

interface CartItem {
  id: string
  nome: string
  preco: number
  precoPromocional?: number
  quantidade: number
  imagem?: string
}

export default function ProdutoDetalhe({ loja, produto, vitrineId }: ProdutoDetalheProps) {
  const [imagemAtiva, setImagemAtiva] = useState(0)
  const [quantidade, setQuantidade] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [reservaDialogOpen, setReservaDialogOpen] = useState(false)
  const router = useRouter()

  // Adicione uma verificação de tema no início do componente
  const tema = loja.vitrine?.tema || "claro"
  const isDarkTheme = tema === "escuro"

  const config = loja.vitrine || {
    corPrimaria: "#3b82f6",
    corTexto: "#ffffff",
    corDestaque: "#f59e0b",
  }

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart-${vitrineId}`)
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e)
      }
    }
  }, [vitrineId])

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem(`cart-${vitrineId}`, JSON.stringify(cartItems))
    } else {
      localStorage.removeItem(`cart-${vitrineId}`)
    }
  }, [cartItems, vitrineId])

  // Efeito para controlar a visibilidade do header ao rolar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false)
      } else {
        setIsHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const handleVoltar = () => {
    router.push(`/vitrines/${vitrineId}`)
  }

  const handleCompartilhar = () => {
    if (navigator.share) {
      navigator
        .share({
          title: produto.nome,
          text: produto.descricaoCurta || `Confira ${produto.nome}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Erro ao compartilhar:", err))
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      })
    }
  }

  const aumentarQuantidade = () => {
    if (produto.estoque && quantidade >= produto.estoque) return
    setQuantidade((prev) => prev + 1)
  }

  const diminuirQuantidade = () => {
    if (quantidade <= 1) return
    setQuantidade((prev) => prev - 1)
  }

  const adicionarAoCarrinho = () => {
    const precoAtual =
      produto.precoPromocional && produto.precoPromocional < produto.preco ? produto.precoPromocional : produto.preco

    // Verificar se o produto já está no carrinho
    const existingItemIndex = cartItems.findIndex((item) => item.id === produto._id)

    if (existingItemIndex >= 0) {
      // Atualizar quantidade se já existe
      const updatedItems = [...cartItems]
      updatedItems[existingItemIndex].quantidade += quantidade
      setCartItems(updatedItems)
    } else {
      // Adicionar novo item
      const newItem: CartItem = {
        id: produto._id,
        nome: produto.nome,
        preco: produto.preco,
        precoPromocional: produto.precoPromocional,
        quantidade: quantidade,
        imagem: produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : undefined,
      }
      setCartItems([...cartItems, newItem])
    }

    toast({
      title: "Produto adicionado!",
      description: `${produto.nome} foi adicionado ao carrinho.`,
    })

    // Resetar quantidade
    setQuantidade(1)

    // Abrir o carrinho
    setCartOpen(true)
  }

  const removerDoCarrinho = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const atualizarQuantidadeCarrinho = (id: string, novaQuantidade: number) => {
    if (novaQuantidade < 1) return

    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantidade: novaQuantidade } : item)))
  }

  const calcularTotal = () => {
    return cartItems.reduce((total, item) => {
      const precoItem = item.precoPromocional && item.precoPromocional < item.preco ? item.precoPromocional : item.preco
      return total + precoItem * item.quantidade
    }, 0)
  }

  const enviarParaWhatsApp = () => {
    // Formatar a mensagem para o WhatsApp
    const telefone = loja.contato?.whatsapp?.replace(/\D/g, "") || loja.contato?.telefone?.replace(/\D/g, "")

    if (!telefone) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar um número de contato para esta loja.",
        variant: "destructive",
      })
      return
    }

    let mensagem = `Olá! Gostaria de reservar os seguintes produtos da ${loja.nome}:\n\n`

    cartItems.forEach((item) => {
      const precoExibido =
        item.precoPromocional && item.precoPromocional < item.preco ? item.precoPromocional : item.preco

      mensagem += `• ${item.quantidade}x ${item.nome} - ${precoExibido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} cada\n`
    })

    mensagem += `\nTotal: ${calcularTotal().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`

    // Codificar a mensagem para URL
    const mensagemCodificada = encodeURIComponent(mensagem)

    // Criar o link do WhatsApp
    const whatsappUrl = `https://wa.me/${telefone}?text=${mensagemCodificada}`

    // Abrir em uma nova aba
    window.open(whatsappUrl, "_blank")

    // Fechar o diálogo e limpar o carrinho
    setReservaDialogOpen(false)
    setCartItems([])
  }

  return (
    <div className={cn("min-h-screen", isDarkTheme ? "bg-gray-900 text-white" : "bg-white")}>
      {/* Header */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isDarkTheme ? "shadow-gray-900" : "shadow-md",
        )}
        initial={{ opacity: 1, y: 0 }}
        animate={{
          opacity: isHeaderVisible ? 1 : 0.8,
          y: isHeaderVisible ? 0 : -20,
          backdropFilter: isHeaderVisible ? "blur(0px)" : "blur(10px)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: isHeaderVisible
            ? config.corPrimaria || (isDarkTheme ? "#1f2937" : "#3b82f6")
            : `${config.corPrimaria}CC` || (isDarkTheme ? "#1f2937CC" : "#3b82f6CC"),
          color: config.corTexto || "#ffffff",
        }}
      >
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleVoltar} className="hover:bg-white/20">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold truncate">{loja.nome}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="hover:bg-white/20 relative"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantidade, 0)}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCompartilhar} className="hover:bg-white/20">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setFavorito(!favorito)} className="hover:bg-white/20">
                <Heart className={cn("h-5 w-5", favorito ? "fill-red-500 text-red-500" : "")} />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Espaçador para compensar o header fixo */}
      <div className="h-16"></div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 mt-8">
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-8 rounded-xl overflow-hidden",
            isDarkTheme ? "bg-gray-800 p-6" : "bg-white shadow-lg",
          )}
        >
          {/* Galeria de Imagens */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {produto.imagens && produto.imagens.length > 0 ? (
                <Image
                  src={produto.imagens[imagemAtiva] || "/placeholder.svg"}
                  alt={produto.nome}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-gray-400" />
                </div>
              )}

              {produto.precoPromocional && produto.precoPromocional < produto.preco && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ backgroundColor: config.corDestaque, color: "#ffffff" }}
                >
                  {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {produto.imagens && produto.imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {produto.imagens.map((imagem, index) => (
                  <button
                    key={index}
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      index === imagemAtiva
                        ? `border-2 ${isDarkTheme ? "border-blue-400" : "border-blue-500"} scale-105`
                        : "border-transparent"
                    }`}
                    onClick={() => setImagemAtiva(index)}
                  >
                    <Image
                      src={imagem || "/placeholder.svg"}
                      alt={`${produto.nome} - imagem ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Produto */}
          <div className={cn("space-y-6", isDarkTheme ? "text-gray-100" : "text-gray-800")}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-2xl md:text-3xl font-bold">{produto.nome}</h1>
              {produto.descricaoCurta && (
                <p className={cn("mt-2 text-lg", isDarkTheme ? "text-gray-300" : "text-gray-600")}>
                  {produto.descricaoCurta}
                </p>
              )}
            </motion.div>

            {/* Preço */}
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {produto.precoPromocional && produto.precoPromocional < produto.preco ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-3xl font-bold", isDarkTheme ? "text-green-400" : "text-green-600")}>
                      {produto.precoPromocional.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className={cn("text-lg line-through", isDarkTheme ? "text-gray-400" : "text-gray-500")}>
                      {produto.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-green-600">
                    Economize{" "}
                    {(produto.preco - produto.precoPromocional).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  {produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              )}
            </motion.div>

            {/* Estoque */}
            {produto.estoque !== undefined && (
              <motion.div
                className={cn("text-sm", isDarkTheme ? "text-gray-300" : "text-gray-600")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {produto.estoque > 0 ? (
                  <span className={isDarkTheme ? "text-green-400" : "text-green-600"}>
                    Em estoque: {produto.estoque} unidades
                  </span>
                ) : (
                  <span className="text-red-600">Fora de estoque</span>
                )}
              </motion.div>
            )}

            {/* Quantidade */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className={cn("block text-sm font-medium", isDarkTheme ? "text-gray-300" : "text-gray-700")}>
                Quantidade
              </label>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={diminuirQuantidade}
                  disabled={quantidade <= 1}
                  className={cn(isDarkTheme ? "border-gray-700 text-gray-300" : "")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantidade}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={aumentarQuantidade}
                  disabled={produto.estoque !== undefined && quantidade >= produto.estoque}
                  className={cn(isDarkTheme ? "border-gray-700 text-gray-300" : "")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* Botões de Ação */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                className="flex-1 py-6"
                style={{
                  backgroundColor: config.corPrimaria,
                  color: config.corTexto,
                }}
                onClick={adicionarAoCarrinho}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>

              <Dialog open={cartItems.length > 0 && cartOpen} onOpenChange={setCartOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("relative", isDarkTheme ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "")}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItems.reduce((total, item) => total + item.quantidade, 0)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Carrinho</DialogTitle>
                    <DialogDescription>Produtos adicionados para reserva</DialogDescription>
                  </DialogHeader>

                  {cartItems.length === 0 ? (
                    <div className="py-6 text-center">
                      <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">Seu carrinho está vazio</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[50vh] overflow-y-auto">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 py-3">
                            {item.imagem ? (
                              <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.imagem || "/placeholder.svg"}
                                  alt={item.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-6 w-6 text-gray-400" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{item.nome}</h4>
                              <div className="flex items-center text-sm text-gray-500">
                                {item.precoPromocional && item.precoPromocional < item.preco ? (
                                  <>
                                    <span className="font-medium text-green-600">
                                      {item.precoPromocional.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                    <span className="line-through ml-1">
                                      {item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </span>
                                  </>
                                ) : (
                                  <span>
                                    {item.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center mt-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => atualizarQuantidadeCarrinho(item.id, item.quantidade - 1)}
                                  disabled={item.quantidade <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center text-sm">{item.quantidade}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => atualizarQuantidadeCarrinho(item.id, item.quantidade + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-500"
                              onClick={() => removerDoCarrinho(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center py-2">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">
                          {calcularTotal().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>

                      <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => setCartItems([])}>
                          Limpar carrinho
                        </Button>
                        <Button
                          onClick={() => {
                            setCartOpen(false)
                            setReservaDialogOpen(true)
                          }}
                          style={{
                            backgroundColor: config.corPrimaria,
                            color: config.corTexto,
                          }}
                        >
                          Reservar produtos
                        </Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={reservaDialogOpen} onOpenChange={setReservaDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar reserva</DialogTitle>
                    <DialogDescription>
                      Você será redirecionado para o WhatsApp para finalizar sua reserva com {loja.nome}.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                        <h4 className="font-medium mb-2">Resumo do pedido:</h4>
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>
                              {item.quantidade}x {item.nome}
                            </span>
                            <span className="font-medium">
                              {(
                                (item.precoPromocional && item.precoPromocional < item.preco
                                  ? item.precoPromocional
                                  : item.preco) * item.quantidade
                              ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                          </div>
                        ))}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{calcularTotal().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-600 dark:text-gray-400">
                          Esta é uma pré-reserva. O pagamento e detalhes adicionais serão combinados diretamente com a
                          loja através do WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReservaDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={enviarParaWhatsApp}
                      style={{
                        backgroundColor: "#25D366", // Cor do WhatsApp
                        color: "#ffffff",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="mr-2"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Continuar no WhatsApp
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className={cn(isDarkTheme ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "")}
                onClick={() => setFavorito(!favorito)}
              >
                <Heart className={cn("h-5 w-5", favorito ? "fill-red-500 text-red-500" : "")} />
              </Button>
              <Button
                variant="outline"
                className={cn(isDarkTheme ? "border-gray-700 text-gray-300 hover:bg-gray-700" : "")}
                onClick={handleCompartilhar}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Descrição Completa */}
            {produto.descricao && (
              <motion.div
                className="pt-6 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <div className={cn("prose max-w-none", isDarkTheme ? "prose-invert" : "")}>
                  <p>{produto.descricao}</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Produtos Relacionados (opcional) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Você também pode gostar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Aqui você pode adicionar produtos relacionados */}
          </div>
        </div>
      </main>

      {/* Footer Melhorado */}
      <footer className={cn("py-12 px-4 mt-12", isDarkTheme ? "bg-gray-800 text-gray-200" : "bg-gray-100")}>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sobre FletoAds */}
            <div>
              <h3 className="text-lg font-bold mb-4">Sobre FletoAds</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                FletoAds é uma plataforma completa para criação de vitrines digitais e divulgação de produtos e
                serviços.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className={cn("text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300")}
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className={cn("text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300")}
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className={cn("text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300")}
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className={cn(
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center",
                    )}
                  >
                    <ChevronRight size={16} className="mr-1" />
                    <span>Início</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={cn(
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center",
                    )}
                  >
                    <ChevronRight size={16} className="mr-1" />
                    <span>Produtos</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={cn(
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center",
                    )}
                  >
                    <ChevronRight size={16} className="mr-1" />
                    <span>Sobre</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={cn(
                      "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center",
                    )}
                  >
                    <ChevronRight size={16} className="mr-1" />
                    <span>Contato</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">
                    {loja.endereco?.cidade}, {loja.endereco?.estado}
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">{loja.contato?.telefone}</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400">{loja.contato?.email}</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Inscreva-se para receber as últimas novidades e oferas.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Seu email"
                  className="px-4 py-2 w-full rounded-l-md border border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                />
                <Button
                  className="rounded-l-none"
                  style={{
                    backgroundColor: config.corPrimaria,
                    color: config.corTexto,
                  }}
                >
                  Enviar
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 md:mt-0">Desenvolvido com ❤️ por FletoAds</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
