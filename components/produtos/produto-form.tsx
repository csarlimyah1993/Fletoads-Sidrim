"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { CircleIcon, Tag, ImageIcon, DollarSign, Settings, Truck } from "lucide-react"

// Esquema de validação para o produto
const produtoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  descricaoCurta: z.string().optional(),
  preco: z.coerce.number().min(0, "O preço deve ser maior ou igual a zero"),
  precoPromocional: z.coerce.number().optional(),
  estoque: z.coerce.number().int().min(0).optional(),
  sku: z.string().optional(),
  categoria: z.string().optional(),
  categorias: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  imagens: z.array(z.string()).optional(),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
  tipoProduto: z.enum(["fisico", "digital", "servico"]).default("fisico"),
  peso: z.coerce.number().optional(),
  altura: z.coerce.number().optional(),
  largura: z.coerce.number().optional(),
  comprimento: z.coerce.number().optional(),
  tipoFrete: z.enum(["gratis", "fixo", "variavel", "sem_frete"]).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type ProdutoFormValues = z.infer<typeof produtoSchema>

export function ProdutoForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")

  // Estado para controlar o tipo de produto
  const [tipoProduto, setTipoProduto] = useState<"fisico" | "digital" | "servico">("fisico")

  // Inicializar o formulário
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      descricaoCurta: "",
      preco: 0,
      precoPromocional: undefined,
      estoque: 0,
      sku: "",
      categoria: "",
      categorias: [],
      tags: [],
      imagens: [],
      ativo: true,
      destaque: false,
      tipoProduto: "fisico",
      peso: undefined,
      altura: undefined,
      largura: undefined,
      comprimento: undefined,
      tipoFrete: undefined,
      metaTitle: "",
      metaDescription: "",
    },
  })

  // Observar mudanças no tipo de produto
  const watchTipoProduto = form.watch("tipoProduto") as "fisico" | "digital" | "servico"

  // Atualizar o estado quando o tipo de produto mudar
  useEffect(() => {
    setTipoProduto(watchTipoProduto)
  }, [watchTipoProduto])

  // Função para enviar o formulário
  async function onSubmit(data: ProdutoFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar produto")
      }

      toast({
        title: "Produto criado com sucesso!",
        description: "O produto foi adicionado ao seu catálogo.",
      })

      router.push("/dashboard/produtos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      toast({
        title: "Erro ao criar produto",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar o produto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para alternar entre as abas
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  // Renderizar o conteúdo da aba ativa
  const renderTabContent = () => {
    switch (activeTab) {
      case "informacoes":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Informações Básicas */}
            <h2 className="text-lg font-semibold">Informações Básicas</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      case "preco":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Preço e Estoque */}
            <h2 className="text-lg font-semibold">Preço e Estoque</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      case "midia":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Mídia */}
            <h2 className="text-lg font-semibold">Mídia</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      case "categorizacao":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Categorização */}
            <h2 className="text-lg font-semibold">Categorização</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      case "envio":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Envio */}
            <h2 className="text-lg font-semibold">Envio</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      case "configuracoes":
        return (
          <div className="space-y-6">
            {/* Conteúdo da aba Configurações */}
            <h2 className="text-lg font-semibold">Configurações</h2>
            {/* Seu conteúdo existente para esta aba */}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Abas de navegação - Corrigido para manter todos os botões no mesmo container */}
        <div className="w-full border rounded-lg p-1 mb-6 flex flex-wrap">
          <TabButton
            active={activeTab === "informacoes"}
            onClick={() => handleTabChange("informacoes")}
            icon={<CircleIcon className="h-4 w-4 mr-2" />}
            label="Informações Básicas"
          />
          <TabButton
            active={activeTab === "preco"}
            onClick={() => handleTabChange("preco")}
            icon={<DollarSign className="h-4 w-4 mr-2" />}
            label="Preço e Estoque"
          />
          <TabButton
            active={activeTab === "midia"}
            onClick={() => handleTabChange("midia")}
            icon={<ImageIcon className="h-4 w-4 mr-2" />}
            label="Mídia"
          />
          <TabButton
            active={activeTab === "categorizacao"}
            onClick={() => handleTabChange("categorizacao")}
            icon={<Tag className="h-4 w-4 mr-2" />}
            label="Categorização"
          />
          {tipoProduto === "fisico" && (
            <TabButton
              active={activeTab === "envio"}
              onClick={() => handleTabChange("envio")}
              icon={<Truck className="h-4 w-4 mr-2" />}
              label="Envio"
            />
          )}
          <TabButton
            active={activeTab === "configuracoes"}
            onClick={() => handleTabChange("configuracoes")}
            icon={<Settings className="h-4 w-4 mr-2" />}
            label="Configurações"
          />
        </div>

        {/* Conteúdo da aba ativa */}
        {renderTabContent()}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Produto"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Componente de botão de aba
interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
