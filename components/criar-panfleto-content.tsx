"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { FileText, Clock, Zap, Calendar, Upload, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the interface for the evento object
interface Evento {
  id: string
  title: string
  period: string
  image: string
  panfletosUsados: number
  panfletosTotal: number
}

// Define props for the PanfletoTypeCard component
interface PanfletoTypeCardProps {
  id: string
  title: string
  count: number
  total: number
  icon: React.ReactNode
  description: string
  color: string
  selected?: boolean
  onClick: () => void
}

export function CriarPanfletoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventoId = searchParams.get("evento")

  const [addPromotionalValue, setAddPromotionalValue] = useState(false)
  const [tags, setTags] = useState(["Tag 1", "Tag 2", "Tag 3", "Tag 4"])
  const [selectedType, setSelectedType] = useState(eventoId ? "eventos" : "ativo") // Se vier de um evento, seleciona o tipo "eventos"
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null)

  // Dados simulados de eventos
  const eventos: Evento[] = [
    {
      id: "1",
      title: "Black Friday",
      period: "De 01/10/2023 até 20/11/2023",
      image: "/placeholder.svg?height=48&width=48",
      panfletosUsados: 0,
      panfletosTotal: 10,
    },
    {
      id: "2",
      title: "Dia Livre de Impostos - DLI",
      period: "De 28/09/2023 até 05/10/2023",
      image: "/placeholder.svg?height=48&width=48",
      panfletosUsados: 0,
      panfletosTotal: 10,
    },
    {
      id: "3",
      title: "Passo A Paço 2023",
      period: "De 28/08/2023 até 01/08/2023",
      image: "/placeholder.svg?height=48&width=48",
      panfletosUsados: 0,
      panfletosTotal: 10,
    },
  ]

  // Efeito para selecionar o evento automaticamente se vier da URL
  useEffect(() => {
    if (eventoId) {
      const evento = eventos.find((e) => e.id === eventoId)
      if (evento) {
        setEventoSelecionado(evento)
        setSelectedType("eventos")
      }
    }
  }, [eventoId])

  const handleCancel = () => {
    router.back()
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Criar Panfleto</h1>
      <p className="text-gray-500 mb-6">Crie panfletos instantaneamente ou programe uma data para ativação.</p>

      {/* Panfleto Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <PanfletoTypeCard
          id="ativo"
          title="Panfleto Ativo"
          count={0}
          total={10}
          icon={<FileText className="h-5 w-5" />}
          description="Duração de 24 horas, ativo imediatamente. Pode ser visualizado por todo o mapa."
          color="bg-blue-500"
          selected={selectedType === "ativo"}
          onClick={() => setSelectedType("ativo")}
        />
        <PanfletoTypeCard
          id="programados"
          title="Programados"
          count={0}
          total={10}
          icon={<Clock className="h-5 w-5" />}
          description="Permite que você agende a data que o panfleto se torna ativo e visível para os clientes."
          color="bg-blue-400"
          selected={selectedType === "programados"}
          onClick={() => setSelectedType("programados")}
        />
        <PanfletoTypeCard
          id="hotpromo"
          title="Hotpromo"
          count={0}
          total={10}
          icon={<Zap className="h-5 w-5" />}
          description="Duração de 24 horas, ativo imediatamente. Pode ser visualizado por todo o mapa."
          color="bg-red-500"
          selected={selectedType === "hotpromo"}
          onClick={() => setSelectedType("hotpromo")}
        />
        <PanfletoTypeCard
          id="eventos"
          title="Eventos"
          count={0}
          total={10}
          icon={<Calendar className="h-5 w-5" />}
          description="Duração de 24 horas, ativo imediatamente. Pode ser visualizado por todo o mapa."
          color="bg-blue-600"
          selected={selectedType === "eventos"}
          onClick={() => setSelectedType("eventos")}
        />
      </div>

      {/* Select Event - Only show for eventos type */}
      {selectedType === "eventos" && (
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-1">Selecione o Evento</h2>
          <p className="text-gray-500 text-sm mb-4">Escolha o evento no qual você quer criar panfletos</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventos.map((evento) => (
              <Card
                key={evento.id}
                className={`p-4 ${eventoSelecionado?.id === evento.id ? "border-2 border-blue-500" : "border"} cursor-pointer`}
                onClick={() => setEventoSelecionado(evento)}
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-md overflow-hidden">
                    <Image src={evento.image || "/placeholder.svg"} alt={evento.title} width={48} height={48} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{evento.period}</p>
                    <h3 className="font-medium">{evento.title}</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-lg font-bold">{evento.panfletosUsados}</span>
                      <span className="text-sm text-gray-400">/{evento.panfletosTotal}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 border border-dashed flex items-center justify-center">
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Cadastrar-se em Evento</span>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-1/3 rounded-full"></div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Images Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-1">Imagens do Panfleto</h2>
          <p className="text-gray-500 text-sm mb-4">Faça o envio de suas imagens aqui.</p>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploadBox />
            <ImageUploadBox />
            <ImageUploadBox />
            <ImageUploadBox />
          </div>

          <div className="mt-4 border-2 border-dashed border-gray-200 rounded-lg h-40 flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">Arraste e solte suas imagens aqui</span>
            </div>
          </div>
        </Card>

        {/* Information Section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Panfleto</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Panfleto
              </label>
              <Input id="title" placeholder="Nome do item vendido..." className="w-full" />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código do Produto
              </label>
              <Input id="code" placeholder="Identificação do produto no estoque..." className="w-full" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Panfleto
              </label>
              <Textarea
                id="description"
                placeholder="Uma descrição resumida facilitará aos clientes acessarem seus produtos."
                className="w-full min-h-[100px]"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Validity Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Validade do Panfleto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            <div className="relative">
              <Input
                type="text"
                value={
                  selectedType === "hotpromo"
                    ? "Hotpromos são criadas instantaneamente."
                    : selectedType === "eventos"
                      ? "Panfletos de eventos são ativados durante evento."
                      : selectedType === "ativo"
                        ? "Panfletos ativos são criados instantaneamente."
                        : "Selecione a data de início"
                }
                className="w-full bg-gray-50 pl-8"
                readOnly={selectedType === "hotpromo" || selectedType === "eventos" || selectedType === "ativo"}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
            <div className="relative">
              <Input
                type="text"
                value={
                  selectedType === "hotpromo"
                    ? "Hotpromos possuem duração de 24 horas."
                    : selectedType === "eventos"
                      ? "Panfletos de eventos se encerram junto ao evento."
                      : selectedType === "ativo"
                        ? "Panfletos ativos possuem duração de 24 horas."
                        : "Selecione a data de término"
                }
                className="w-full bg-gray-50 pl-8"
                readOnly={selectedType === "hotpromo" || selectedType === "eventos" || selectedType === "ativo"}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Price Section */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Preço e Descontos</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">Adicionar valor promocional</span>
            <Switch checked={addPromotionalValue} onCheckedChange={setAddPromotionalValue} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Produto</label>
            <Input type="text" placeholder="Valor do Produto..." className="w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional</label>
            <Input
              type="text"
              placeholder="Valor do Produto com desconto..."
              className="w-full"
              disabled={!addPromotionalValue}
            />
          </div>
        </div>
      </Card>

      {/* Button Action Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Adicionar Botão</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ações do Botão</label>
            <Select defaultValue="comprar">
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprar">"Comprar"</SelectItem>
                <SelectItem value="reservar">"Reservar"</SelectItem>
                <SelectItem value="saibamais">"Saiba Mais"</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Para a Ação</label>
            <Input type="text" placeholder="Insira o link de direcionamento do botão..." className="w-full" />
          </div>
        </div>
      </Card>

      {/* Tags Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Tags do Produto</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input type="text" placeholder="Como marcar o seu produto?" className="flex-1" />
          <Button variant="outline">Adicionar Tags</Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button>Criar Panfleto</Button>
      </div>
    </div>
  )
}

// Components
function PanfletoTypeCard({
  id,
  title,
  count,
  total,
  icon,
  description,
  color,
  selected = false,
  onClick,
}: PanfletoTypeCardProps) {
  return (
    <Card
      className={`p-4 ${selected ? "border-2 border-blue-600" : ""} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="text-lg font-bold">
          {count}
          <span className="text-sm text-gray-400">/{total}</span>
        </div>
      </div>
      <div className={`h-8 w-8 ${color} rounded-full flex items-center justify-center text-white mb-2`}>{icon}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </Card>
  )
}

function ImageUploadBox() {
  return (
    <div className="border border-gray-200 rounded-lg aspect-square flex items-center justify-center">
      <Upload className="h-6 w-6 text-gray-400" />
    </div>
  )
}
