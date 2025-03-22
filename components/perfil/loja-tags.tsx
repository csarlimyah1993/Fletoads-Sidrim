"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

interface LojaTagsProps {
  initialTags?: string[]
  onTagsChange: (tags: string[]) => void
}

export function LojaTags({ initialTags = [], onTagsChange }: LojaTagsProps) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState("")

  const handleAddTag = () => {
    if (inputValue.trim() === "") return

    const newTag = inputValue.trim()
    if (!tags.includes(newTag)) {
      const updatedTags = [...tags, newTag]
      setTags(updatedTags)
      onTagsChange(updatedTags)
    }
    setInputValue("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    onTagsChange(updatedTags)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Sugestões de tags comuns para lojas
  const suggestedTags = [
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remover tag {tag}</span>
            </button>
          </Badge>
        ))}
        {tags.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tag adicionada</p>}
      </div>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Adicionar tag"
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleAddTag}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Sugestões:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => {
                if (!tags.includes(tag)) {
                  const updatedTags = [...tags, tag]
                  setTags(updatedTags)
                  onTagsChange(updatedTags)
                }
              }}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

