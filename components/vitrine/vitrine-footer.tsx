"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Loja } from "@/types/loja"

interface VitrineFooterProps {
  loja: Loja
}

export function VitrineFooter({ loja }: VitrineFooterProps) {
  const isPlanoPago = loja.plano?.id !== "gratis"
  const anoAtual = new Date().getFullYear()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"
  const corSecundaria = loja.cores?.secundaria || "#f9fafb"
  const corTexto = loja.cores?.texto || "#111827"

  // Categorias da loja (simuladas para o exemplo)
  const categorias = [
    "Promoções",
    "Descontos",
    "Entrega Rápida",
    "Frete Grátis",
    "Produtos Orgânicos",
    "Artesanal",
    "Importados",
    "Exclusivo",
    "Novidades",
    "Outlet",
  ]

  // Redes sociais
  const redesSociais = [
    { icon: Facebook, url: loja.redesSociais?.facebook || "#", label: "Facebook" },
    { icon: Instagram, url: loja.redesSociais?.instagram || "#", label: "Instagram" },
    { icon: Twitter, url: loja.redesSociais?.twitter || "#", label: "Twitter" },
    { icon: Linkedin, url: loja.redesSociais?.linkedin || "#", label: "LinkedIn" },
    { icon: Youtube, url: loja.redesSociais?.youtube || "#", label: "YouTube" },
  ]

  // Função para lidar com o clique na categoria
  const handleCategoryClick = (categoria: string) => {
    setActiveCategory(activeCategory === categoria ? null : categoria)
  }

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Seção de categorias com botões estilizados */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 text-center">Categorias</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {categorias.map((categoria, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(categoria)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    activeCategory === categoria
                      ? "bg-white text-gray-900 shadow-md transform scale-105"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                {categoria}
              </button>
            ))}
          </div>
        </div>

        {/* Seção principal do footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Sobre a loja */}
          <div>
            <h3 className="text-xl font-bold mb-4">{loja.nome}</h3>
            <p className="text-gray-400 mb-4">
              {loja.descricao || `Bem-vindo à ${loja.nome}. Estamos felizes em atendê-lo!`}
            </p>
            <div className="flex gap-4 mt-4">
              {redesSociais.map((rede, index) => (
                <a
                  key={index}
                  href={rede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={rede.label}
                >
                  <rede.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/vitrine/${loja._id}`} className="text-gray-400 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href={`/vitrine/${loja._id}/produtos`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Produtos
                </Link>
              </li>
              <li>
                <Link
                  href={`/vitrine/${loja._id}/contato`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
              {isPlanoPago && (
                <li>
                  <Link
                    href={`/vitrine/${loja._id}/carrinho`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Carrinho
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contato */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loja.endereco && (
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400">{loja.endereco}</span>
                </div>
              )}
              {loja.telefone && (
                <div className="flex items-start gap-3 mb-3">
                  <Phone className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400">{loja.telefone}</span>
                </div>
              )}
              {loja.email && (
                <div className="flex items-start gap-3 mb-3">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-gray-400">{loja.email}</span>
                </div>
              )}
            </div>
            <Link href={`/vitrine/${loja._id}/contato`}>
              <Button className="mt-4" variant="outline" style={{ borderColor: "white", color: "white" }}>
                Fale Conosco
              </Button>
            </Link>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {anoAtual} {loja.nome}. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0">
              Desenvolvido com{" "}
              <Link href="https://fletoads.com" className="text-gray-400 hover:text-white">
                FletoAds
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

