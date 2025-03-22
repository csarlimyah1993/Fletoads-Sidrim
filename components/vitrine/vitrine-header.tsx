"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Menu, Palette, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ThemeToggle } from "./theme-toggle"
import type { Loja } from "@/types/loja"

interface VitrineHeaderProps {
  loja: Loja
  isOwner?: boolean
}

export function VitrineHeader({ loja, isOwner = false }: VitrineHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isPlanoPago = loja.plano?.id !== "gratis"

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"
  const corSecundaria = loja.cores?.secundaria || "#f9fafb"
  const corTexto = loja.cores?.texto || "#111827"

  return (
    <header
      className="relative bg-white dark:bg-gray-900 transition-colors duration-200"
      style={{
        backgroundColor: `var(--header-bg, ${corSecundaria})`,
        color: `var(--header-text, ${corTexto})`,
      }}
    >
      {/* Banner (apenas para planos pagos) */}
      {isPlanoPago && loja.banner && (
        <div className="w-full h-48 md:h-64 lg:h-80 relative">
          <OptimizedImage src={loja.banner} alt={`Banner de ${loja.nome}`} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href={`/vitrine/${loja._id}`} className="flex items-center gap-3">
            {loja.logo ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <OptimizedImage src={loja.logo} alt={loja.nome} fill className="object-cover" />
              </div>
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-bold"
                style={{ backgroundColor: corPrimaria }}
              >
                {loja.nome.substring(0, 2).toUpperCase()}
              </div>
            )}

            <h1 className="text-xl font-bold dark:text-white">{loja.nome}</h1>
          </Link>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Botão de personalização (apenas para o dono da loja) */}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex bg-transparent border-purple-600 text-purple-600 hover:bg-purple-600/10 dark:border-purple-400 dark:text-purple-400"
                asChild
              >
                <Link href="/dashboard/vitrine">
                  <Palette className="mr-2 h-4 w-4" />
                  Personalizar Vitrine
                </Link>
              </Button>
            )}

            {isPlanoPago && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex dark:border-gray-700 dark:text-gray-300"
                style={{
                  borderColor: corPrimaria,
                  color: corPrimaria,
                }}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Meu Carrinho (0)
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="dark:border-gray-700 dark:text-gray-300"
              style={{
                borderColor: corPrimaria,
                color: corPrimaria,
              }}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu de navegação móvel */}
        {menuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-3">
              <Link
                href={`/vitrine/${loja._id}`}
                className="text-base font-medium hover:text-primary dark:text-gray-300 dark:hover:text-white"
                style={{ color: corTexto }}
                onClick={() => setMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                href={`/vitrine/${loja._id}/produtos`}
                className="text-base font-medium hover:text-primary dark:text-gray-300 dark:hover:text-white"
                style={{ color: corTexto }}
                onClick={() => setMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link
                href={`/vitrine/${loja._id}/contato`}
                className="text-base font-medium hover:text-primary dark:text-gray-300 dark:hover:text-white"
                style={{ color: corTexto }}
                onClick={() => setMenuOpen(false)}
              >
                Contato
              </Link>
              {isPlanoPago && (
                <Link
                  href={`/vitrine/${loja._id}/carrinho`}
                  className="text-base font-medium hover:text-primary dark:text-gray-300 dark:hover:text-white"
                  style={{ color: corTexto }}
                  onClick={() => setMenuOpen(false)}
                >
                  Meu Carrinho
                </Link>
              )}
              {isOwner && (
                <Link
                  href="/dashboard/vitrine"
                  className="text-base font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  onClick={() => setMenuOpen(false)}
                >
                  Personalizar Vitrine
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Menu de navegação desktop */}
      <div className="hidden md:block border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-6 py-2">
            <Link
              href={`/vitrine/${loja._id}`}
              className="text-sm font-medium hover:text-primary py-2 dark:text-gray-300 dark:hover:text-white"
              style={{ color: corTexto }}
            >
              Início
            </Link>
            <Link
              href={`/vitrine/${loja._id}/produtos`}
              className="text-sm font-medium hover:text-primary py-2 dark:text-gray-300 dark:hover:text-white"
              style={{ color: corTexto }}
            >
              Produtos
            </Link>
            <Link
              href={`/vitrine/${loja._id}/contato`}
              className="text-sm font-medium hover:text-primary py-2 dark:text-gray-300 dark:hover:text-white"
              style={{ color: corTexto }}
            >
              Contato
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

