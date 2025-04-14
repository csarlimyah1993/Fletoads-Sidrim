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
} from "lucide-react"
import { motion } from "framer-motion"
import type { Loja, Produto } from "@/types/loja"
import { cn } from "@/lib/utils"

interface ProdutoDetalheProps {
  loja: Loja
  produto: Produto
  vitrineId: string
}

export default function ProdutoDetalhe({ loja, produto, vitrineId }: ProdutoDetalheProps) {
  const [imagemAtiva, setImagemAtiva] = useState(0)
  const [quantidade, setQuantidade] = useState(1)
  const [favorito, setFavorito] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()

  // Adicione uma verificação de tema no início do componente
  const tema = loja.vitrine?.tema || "claro"
  const isDarkTheme = tema === "escuro"

  const config = loja.vitrine || {
    corPrimaria: "#3b82f6",
    corTexto: "#ffffff",
    corDestaque: "#f59e0b",
  }

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
      alert("Link copiado para a área de transferência!")
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
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Adicionar ao Carrinho
              </Button>
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
                Inscreva-se para receber as últimas novidades e ofertas.
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
