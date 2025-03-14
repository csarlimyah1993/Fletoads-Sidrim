"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, FileText, Store, Package, BarChart2, ChevronRight, Play, Pause, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Tutorial steps for each section
const tutorialSteps = {
  dashboard: [
    {
      title: "Visão Geral do Dashboard",
      description:
        "O Dashboard mostra estatísticas importantes do seu negócio como vendas, visitas e produtos populares.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Análise de Vendas",
      description: "Acompanhe o desempenho das suas vendas com gráficos interativos e métricas em tempo real.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Relatórios Personalizados",
      description: "Crie relatórios personalizados para analisar períodos específicos e categorias de produtos.",
      animation: "/placeholder.svg?height=300&width=500",
    },
  ],
  produtos: [
    {
      title: "Cadastro de Produtos",
      description: "Adicione novos produtos com fotos, descrições, preços e opções de variação.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Gerenciamento de Estoque",
      description: "Controle seu estoque, defina alertas de quantidade mínima e faça ajustes rápidos.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Promoções e Descontos",
      description: "Configure promoções por tempo limitado, cupons de desconto e ofertas especiais.",
      animation: "/placeholder.svg?height=300&width=500",
    },
  ],
  vendas: [
    {
      title: "Acompanhamento de Pedidos",
      description: "Visualize todos os pedidos, status de entrega e informações dos clientes.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Processamento de Pagamentos",
      description: "Gerencie pagamentos, reembolsos e configure métodos de pagamento aceitos.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Histórico de Transações",
      description: "Acesse o histórico completo de transações com filtros avançados de busca.",
      animation: "/placeholder.svg?height=300&width=500",
    },
  ],
  vitrine: [
    {
      title: "Personalização da Vitrine",
      description: "Personalize a aparência da sua loja virtual com temas, cores e layouts.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Organização de Categorias",
      description: "Organize seus produtos em categorias e subcategorias para facilitar a navegação.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Banners e Destaques",
      description: "Configure banners promocionais e produtos em destaque na página inicial.",
      animation: "/placeholder.svg?height=300&width=500",
    },
  ],
  marketing: [
    {
      title: "Campanhas de Email",
      description: "Crie e agende campanhas de email marketing para seus clientes.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "Integração com Redes Sociais",
      description: "Conecte suas redes sociais para compartilhar produtos e promoções automaticamente.",
      animation: "/placeholder.svg?height=300&width=500",
    },
    {
      title: "SEO e Visibilidade",
      description: "Otimize sua loja para mecanismos de busca e aumente sua visibilidade online.",
      animation: "/placeholder.svg?height=300&width=500",
    },
  ],
}

export function TutorialContent() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // Auto-advance steps when playing
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Move to next step when progress reaches 100%
            setCurrentStep((prevStep) => {
              const nextStep = prevStep + 1
              if (nextStep >= tutorialSteps[activeTab as keyof typeof tutorialSteps].length) {
                setIsPlaying(false)
                return 0
              }
              return nextStep
            })
            return 0
          }
          return prev + 1
        })
      }, 50)
    }

    return () => clearInterval(timer)
  }, [isPlaying, activeTab, currentStep])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentStep(0)
    setProgress(0)
    setIsPlaying(false)
  }

  const handleNextStep = () => {
    if (currentStep < tutorialSteps[activeTab as keyof typeof tutorialSteps].length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(0)
    } else {
      setCurrentStep(0)
      setProgress(0)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(0)
    } else {
      setCurrentStep(tutorialSteps[activeTab as keyof typeof tutorialSteps].length - 1)
      setProgress(0)
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetTutorial = () => {
    setCurrentStep(0)
    setProgress(0)
    setIsPlaying(false)
  }

  const steps = tutorialSteps[activeTab as keyof typeof tutorialSteps]
  const currentTutorial = steps[currentStep]

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-emerald-600 mb-2">Tutorial Interativo Fletoads</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Aprenda a usar todas as funcionalidades do Fletoads com nosso tutorial interativo. Selecione um tópico abaixo
          para começar.
        </p>
      </motion.div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex items-center gap-2 px-4 py-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="vendas" className="flex items-center gap-2 px-4 py-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden md:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="vitrine" className="flex items-center gap-2 px-4 py-2">
              <Store className="h-4 w-4" />
              <span className="hidden md:inline">Vitrine</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2 px-4 py-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Marketing</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.keys(tutorialSteps).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <Card className="border-emerald-100 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-3">
                  {/* Tutorial Steps Sidebar */}
                  <div className="bg-emerald-50 p-4 border-r border-emerald-100">
                    <h3 className="font-semibold text-emerald-700 mb-4">Passos do Tutorial</h3>
                    <div className="space-y-2">
                      {tutorialSteps[tab as keyof typeof tutorialSteps].map((step, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ x: 5 }}
                          onClick={() => {
                            setCurrentStep(index)
                            setProgress(0)
                          }}
                          className={`cursor-pointer p-3 rounded-md flex items-center gap-2 transition-colors ${
                            currentStep === index ? "bg-emerald-100 text-emerald-700" : "hover:bg-emerald-100/50"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              currentStep === index ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{step.title}</span>
                          {currentStep === index && <ChevronRight className="h-4 w-4 ml-auto text-emerald-600" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Tutorial Content */}
                  <div className="col-span-2 p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${activeTab}-${currentStep}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-800">{currentTutorial.title}</h2>
                          <p className="text-gray-600 mt-2">{currentTutorial.description}</p>
                        </div>

                        {/* Animation Container */}
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="aspect-video flex items-center justify-center"
                          >
                            {/* Placeholder for actual animation/video */}
                            <img
                              src={currentTutorial.animation || "/placeholder.svg"}
                              alt={currentTutorial.title}
                              className="w-full h-full object-cover"
                            />

                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                              <motion.div className="h-full bg-emerald-600" style={{ width: `${progress}%` }} />
                            </div>
                          </motion.div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevStep}
                            className="flex items-center gap-1"
                          >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            Anterior
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={togglePlayPause}
                              className="rounded-full h-10 w-10"
                            >
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={resetTutorial}
                              className="rounded-full h-10 w-10"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextStep}
                            className="flex items-center gap-1"
                          >
                            Próximo
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

