"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, ChevronUp, Globe, Instagram, Mail, Facebook } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ParticipacaoEventoModal } from "@/components/participacao-evento-modal"

export function EventoDetalhes({ id }) {
  const router = useRouter()
  const [infoExpanded, setInfoExpanded] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showParticipacaoModal, setShowParticipacaoModal] = useState(false)

  // Dados simulados do evento
  const evento = {
    id,
    title: "Passo A Paço 2023: #SouManaus",
    period: "Cadastro de 28/08/2023 até 07/09/2023",
    images: [
      "/placeholder.svg?height=400&width=800",
      "/placeholder.svg?height=400&width=800",
      "/placeholder.svg?height=400&width=800",
      "/placeholder.svg?height=400&width=800",
      "/placeholder.svg?height=400&width=800",
    ],
    description: [
      "Prepare-se para embarcar em uma jornada única de cores, sabores, talentos e sustentabilidade, que acontece no icônico Centro Histórico de Manaus.",
      "O maior festival de artes integradas da região Norte, um fenômeno que transcendeu suas próprias fronteiras, alcançando a incrível marca de 380 mil pessoas em 2022.",
      "Na edição passada, com 7 palcos, recebeu cerca de 600 artistas, mais de 65 atrações locais, nacionais e internacionais. Tendo como âncora a Praça Dom Pedro II, o Museu da Cidade de Manaus abrigou mostras e exposições. As feiras de artesanatos evidenciavam a arte indígena e antiguidades. Já as opções gastronômicas encantaram, com pratos feitos por renomados chefs, a preços populares.",
    ],
    comercializacao: [
      {
        title: "Bebidas Alcoólicas:",
        items: [
          "Cervejas em copos descartáveis.",
          "Vinho em taças de plástico.",
          "Coquetéis em copos de papel.",
          "Shots em copinhos de plástico.",
        ],
      },
      {
        title: "Bebidas Não Alcoólicas:",
        items: [
          "Refrigerantes em latas ou copos de papel.",
          "Água engarrafada.",
          "Bebidas energéticas em latas.",
          "Água com gás em latas ou copos de plástico.",
        ],
      },
      {
        title: "Comida:",
        items: [
          "Petiscos em sacos.",
          "Fast food em caixas de papelão.",
          "Comida de rua em embalagens de papel ou caixas.",
          "Opções dietéticas em caixas ou sacolas.",
        ],
      },
      {
        title: "Sobremesas:",
        items: ["Sorvetes em cones.", "Doces em embalagens individuais."],
      },
      {
        title: "Bebidas Especiais:",
        items: ["Bebidas temáticas em copos personalizados."],
      },
    ],
    participacao: [
      {
        title: "Dados do Perfil:",
        items: [
          "Cadastro de dados completo e aprovado da empresa na plataforma Reszon.",
          "Aprovação do cadastro pela empresa Promotora do evento.",
        ],
      },
      {
        title: "Produtos Comercializados:",
        items: [
          "Os itens para a vitrine do lojista serão avaliados previamente pelos organizadores antes da aprovação.",
          "Os itens devem estar de acordo com o as permissões de comercialização dentro do evento",
        ],
      },
      {
        title: "Prazo de Cadastro:",
        items: ["O cadastro da empresa e dos produtos na vitrine do lojista devem cumprir a data de envio estipulada."],
      },
      {
        title: "Pacote:",
        items: ["Apenas lojas com assinatura de pacotes podem participar de eventos."],
      },
    ],
  }

  const handleBack = () => {
    router.back()
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? evento.images.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === evento.images.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (index) => {
    setCurrentSlide(index)
  }

  const handleParticiparEvento = () => {
    setShowParticipacaoModal(true)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Banner Section */}
      <Card className="mb-6 overflow-hidden">
        <div className="p-4 flex justify-between">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
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
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[400px]">
          <div className="absolute inset-0 transition-opacity duration-500">
            <Image
              src={evento.images[currentSlide] || "/placeholder.svg"}
              alt={evento.title}
              fill
              className="object-cover"
            />
          </div>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center"
            onClick={handlePrevSlide}
          >
            <ChevronUp className="h-5 w-5 rotate-270" />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center"
            onClick={handleNextSlide}
          >
            <ChevronDown className="h-5 w-5 rotate-90" />
          </button>
        </div>

        <div className="flex justify-center gap-2 p-4">
          {evento.images.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </Card>

      {/* Event Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="px-3 py-1">
            EVENTO
          </Badge>
          <span className="text-sm text-gray-500">{evento.period}</span>
        </div>

        <h1 className="text-2xl font-bold mb-4">{evento.title}</h1>

        <div className="space-y-4">
          {evento.description.map((paragraph, index) => (
            <p key={index} className="text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* What Can Be Sold */}
      <Card className="p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setInfoExpanded(!infoExpanded)}>
          <h2 className="text-xl font-semibold">O Que Pode Ser Comercializado?</h2>
          {infoExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {infoExpanded && (
          <div className="mt-4 space-y-6">
            {evento.comercializacao.map((section, index) => (
              <div key={index}>
                <p className="font-medium mb-2">
                  {index + 1}. {section.title}
                </p>
                <ul className="list-disc pl-8 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* What Is Needed To Participate */}
      <Card className="p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setStatsExpanded(!statsExpanded)}>
          <h2 className="text-xl font-semibold">O Quê É Preciso Para Participar?</h2>
          {statsExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {statsExpanded && (
          <div className="mt-4 space-y-6">
            {evento.participacao.map((section, index) => (
              <div key={index}>
                <p className="font-medium mb-2">
                  {index + 1}. {section.title}
                </p>
                <ul className="list-disc pl-8 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Participate Button */}
      <div className="flex justify-end mb-8">
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleParticiparEvento}>
          Participar do Evento
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>

      {/* Modal de Participação */}
      <ParticipacaoEventoModal
        isOpen={showParticipacaoModal}
        onClose={() => setShowParticipacaoModal(false)}
        eventoId={evento.id}
        eventoNome={evento.title}
      />
    </div>
  )
}

