"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import {
  ShoppingBag,
  Utensils,
  Shirt,
  Briefcase,
  Smartphone,
  Home,
  Car,
  Scissors,
  Heart,
  BookOpen,
  Tag,
} from "lucide-react"

export interface CategoriaFilterProps {
  categorias: string[]
  categoriaAtual?: string | null
  onCategoriaChange?: (categoria: string | null) => void
}

const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  Alimentação: <Utensils className="h-4 w-4" />,
  Moda: <Shirt className="h-4 w-4" />,
  Serviços: <Briefcase className="h-4 w-4" />,
  Tecnologia: <Smartphone className="h-4 w-4" />,
  Imóveis: <Home className="h-4 w-4" />,
  Automotivo: <Car className="h-4 w-4" />,
  Beleza: <Scissors className="h-4 w-4" />,
  Saúde: <Heart className="h-4 w-4" />,
  Educação: <BookOpen className="h-4 w-4" />,
}

export function CategoriaFilter({ categorias, categoriaAtual = null, onCategoriaChange }: CategoriaFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleClick = (categoria: string | null) => {
    if (onCategoriaChange) {
      onCategoriaChange(categoria)
      return
    }

    // Create a new URLSearchParams instance
    const params = new URLSearchParams()

    // Copy all existing parameters
    searchParams.forEach((value, key) => {
      if (key !== "categoria" && key !== "pagina") {
        params.set(key, value)
      }
    })

    // Set the new categoria parameter if it's not null
    if (categoria) {
      params.set("categoria", categoria)
    }

    // Reset to page 1
    params.set("pagina", "1")

    // Navigate to the new URL
    router.push(`/vitrines?${params.toString()}`)
  }

  // Add some default categories if none are provided
  const allCategorias =
    categorias.length > 0
      ? categorias
      : ["Alimentação", "Moda", "Serviços", "Tecnologia", "Imóveis", "Automotivo", "Beleza", "Saúde", "Educação"]

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h3 className="font-medium mb-4">Categorias</h3>
      <div className="space-y-1">
        <button
          onClick={() => handleClick(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
            categoriaAtual === null ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Todas as categorias</span>
        </button>

        {allCategorias.map((categoria) => (
          <button
            key={categoria}
            onClick={() => handleClick(categoria)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              categoriaAtual === categoria ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
          >
            {CATEGORIA_ICONS[categoria] || <ShoppingBag className="h-4 w-4" />}
            <span>{categoria}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

