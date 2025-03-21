"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Wifi, Accessibility, Baby, Dog, Droplets, Snowflake, Bath, Plus, Save } from "lucide-react"

interface Tag {
  id: string
  name: string
  icon: React.ReactNode
  selected: boolean
}

interface LojaTagsProps {
  initialTags?: string[]
  onTagsChange?: (tags: string[]) => void
}

export function LojaTags({ initialTags = [], onTagsChange }: LojaTagsProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    {
      id: "banheiros",
      name: "Banheiros",
      icon: <Bath className="h-4 w-4" />,
      selected: initialTags.includes("banheiros"),
    },
    {
      id: "acessibilidade",
      name: "Rampa de acessibilidade",
      icon: <Accessibility className="h-4 w-4" />,
      selected: initialTags.includes("acessibilidade"),
    },
    {
      id: "criancas",
      name: "Acessível para crianças",
      icon: <Baby className="h-4 w-4" />,
      selected: initialTags.includes("criancas"),
    },
    { id: "wifi", name: "Wi-Fi Grátis", icon: <Wifi className="h-4 w-4" />, selected: initialTags.includes("wifi") },
    {
      id: "animais",
      name: "Permitido Animais",
      icon: <Dog className="h-4 w-4" />,
      selected: initialTags.includes("animais"),
    },
    {
      id: "bebedouro",
      name: "Bebedouro",
      icon: <Droplets className="h-4 w-4" />,
      selected: initialTags.includes("bebedouro"),
    },
    {
      id: "climatizacao",
      name: "Climatização",
      icon: <Snowflake className="h-4 w-4" />,
      selected: initialTags.includes("climatizacao"),
    },
  ])

  const handleTagToggle = (id: string) => {
    const updatedTags = availableTags.map((tag) => (tag.id === id ? { ...tag, selected: !tag.selected } : tag))
    setAvailableTags(updatedTags)

    if (onTagsChange) {
      const selectedTagIds = updatedTags.filter((tag) => tag.selected).map((tag) => tag.id)
      onTagsChange(selectedTagIds)
    }
  }

  const handleSaveTags = () => {
    const selectedTagIds = availableTags.filter((tag) => tag.selected).map((tag) => tag.id)
    if (onTagsChange) {
      onTagsChange(selectedTagIds)
    }
    toast({
      title: "Tags salvas",
      description: "As características da sua loja foram atualizadas com sucesso.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">Características da Loja</CardTitle>
        <CardDescription>Selecione as características disponíveis na sua loja</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {availableTags
            .filter((tag) => tag.selected)
            .map((tag) => (
              <Badge key={tag.id} variant="secondary" className="flex items-center gap-1 px-3 py-1.5 text-sm">
                {tag.icon}
                {tag.name}
              </Badge>
            ))}

          {availableTags.filter((tag) => tag.selected).length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma característica selecionada. Adicione características para destacar sua loja.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar Características
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Características Disponíveis</h4>
                  <p className="text-sm text-muted-foreground">Selecione as características da sua loja</p>
                </div>
                <div className="grid gap-2">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={tag.selected}
                        onCheckedChange={() => handleTagToggle(tag.id)}
                      />
                      <Label htmlFor={`tag-${tag.id}`} className="flex items-center gap-2 cursor-pointer">
                        {tag.icon}
                        {tag.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <Button onClick={handleSaveTags} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Características
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  )
}

