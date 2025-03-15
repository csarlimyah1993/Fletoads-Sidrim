"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  MessageSquare,
  Send,
  User,
  Bot,
  Paperclip,
  Mic,
  ImageIcon,
  Inbox,
  MessageCircle,
  Users,
  Zap,
  Phone,
  Database,
  Map,
  Building2,
  FileSpreadsheet,
  Settings,
  ChevronDown,
  ChevronRight,
  Tag,
  Search,
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Plus,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { generateTogetherAIContent } from "@/lib/together-ai-client"

export function PanAIContent() {
  const [message, setMessage] = useState("")
  const [activeView, setActiveView] = useState("chat") // "chat", "contacts", "contactDetail"
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Olá! Sou a Ferramenta Pan AI. Como posso ajudar você hoje?",
      timestamp: "10:30",
    },
  ])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templateType, setTemplateType] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isApiConfigured, setIsApiConfigured] = useState(true)

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        // Verificar se a API key está disponível como variável de ambiente pública
        const apiKey = process.env.NEXT_PUBLIC_TOGETHER_API_KEY

        if (!apiKey) {
          setIsApiConfigured(false)
        }
      } catch (error) {
        console.error("Erro ao verificar configuração da API:", error)
        setIsApiConfigured(false)
      }
    }

    checkApiConfig()
  }, [])

  // Dados simulados de contatos
  const contacts = [
    {
      id: 1,
      name: "João Silva",
      phone: "(92) 98765-4321",
      email: "joao.silva@email.com",
      address: "Av. Djalma Batista, 1661 - Chapada, Manaus - AM",
      lastContact: "12/03/2024",
      tags: ["Cliente VIP", "Comprador frequente"],
      notes: "Cliente desde 2020, prefere ser contatado por WhatsApp.",
    },
    {
      id: 2,
      name: "Maria Oliveira",
      phone: "(92) 98765-1234",
      email: "maria.oliveira@email.com",
      address: "Av. Torquato Tapajós, 2200 - Flores, Manaus - AM",
      lastContact: "05/03/2024",
      tags: ["Novo cliente"],
      notes: "Interessada em promoções de calçados femininos.",
    },
    {
      id: 3,
      name: "Pedro Santos",
      phone: "(92) 99876-5432",
      email: "pedro.santos@email.com",
      address: "Rua Teresina, 495 - Adrianópolis, Manaus - AM",
      lastContact: "28/02/2024",
      tags: ["Atacado"],
      notes: "Dono de loja no centro da cidade, compra em grandes quantidades.",
    },
    {
      id: 4,
      name: "Ana Souza",
      phone: "(92) 98123-4567",
      email: "ana.souza@email.com",
      address: "Av. Constantino Nery, 3300 - Chapada, Manaus - AM",
      lastContact: "15/02/2024",
      tags: ["Cliente VIP"],
      notes: "Prefere ser contatada por e-mail. Interessada em calçados esportivos.",
    },
    {
      id: 5,
      name: "Carlos Ferreira",
      phone: "(92) 99123-8765",
      email: "carlos.ferreira@email.com",
      address: "Av. Darcy Vargas, 1200 - Parque 10, Manaus - AM",
      lastContact: "10/02/2024",
      tags: ["Atacado", "Parceiro"],
      notes: "Parceiro comercial, possui loja no Shopping Manauara.",
    },
  ]

  // Estado para controlar quais seções do menu estão expandidas
  const [expandedSections, setExpandedSections] = useState({
    whatsapp: false,
    importar: false,
    configuracoes: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Função para gerar resposta usando a TogetherAI
  const generateAIResponse = async (userMessage: string) => {
    setIsGenerating(true)
    setError(null)

    try {
      // Construir o prompt com base no contexto
      let prompt = ""

      // Se for uma solicitação de template específico
      if (templateType) {
        prompt = `
          Crie um conteúdo para um template de ${templateType} com as seguintes características:
          
          ${customPrompt || `Criar uma mensagem de ${templateType} personalizada`}
          
          ${
            selectedContact
              ? `Adaptar para o perfil do cliente: ${selectedContact.name}
               Informações do cliente: ${selectedContact.notes}
               Tags do cliente: ${selectedContact.tags.join(", ")}`
              : "Adaptar para um cliente genérico"
          }
          
          O conteúdo deve ser persuasivo, claro e direcionado ao público-alvo.
        `
      } else {
        // Caso seja uma conversa normal, usar o prompt do usuário
        prompt = `
          ${userMessage}
          
          ${
            selectedContact
              ? `Considere que está falando com: ${selectedContact.name}
               Informações do cliente: ${selectedContact.notes}
               Tags do cliente: ${selectedContact.tags.join(", ")}`
              : "Responda de forma genérica para um cliente"
          }
        `
      }

      // Chamar diretamente a API da Together AI
      const content = await generateTogetherAIContent(prompt)

      // Limpar o tipo de template após uso
      setTemplateType("")
      setCustomPrompt("")

      return content
    } catch (err: any) {
      setError(err.message || "Erro ao gerar resposta")
      return "Desculpe, ocorreu um erro ao gerar a resposta. Por favor, tente novamente."
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !templateType) return

    const messageContent =
      message.trim() || `Gerar template de ${templateType} ${customPrompt ? `: ${customPrompt}` : ""}`

    // Adicionar mensagem do usuário
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, userMessage])
    setMessage("")

    // Adicionar mensagem de carregamento
    const loadingMessageId = messages.length + 2
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        role: "assistant",
        content: "Gerando resposta...",
        isLoading: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])

    // Gerar resposta com a TogetherAI
    const aiResponse = await generateAIResponse(messageContent)

    // Substituir mensagem de carregamento pela resposta real
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingMessageId
          ? {
              id: loadingMessageId,
              role: "assistant",
              content: aiResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : msg,
      ),
    )
  }

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact)
    setActiveView("contactDetail")
  }

  const handleBackToContacts = () => {
    setSelectedContact(null)
    setActiveView("contacts")
  }

  const handleTemplateSelect = (template: string, description: string) => {
    setTemplateType(template)
    setCustomPrompt(description)
    handleSendMessage({ preventDefault: () => {} } as React.FormEvent)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ferramenta Pan AI</h1>
      <p className="text-gray-500 mb-6">
        Utilize nossa ferramenta de inteligência artificial para criar mensagens personalizadas para seus clientes.
      </p>

      {!isApiConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            A API da TogetherAI não está configurada corretamente. Verifique se a variável de ambiente TOGETHER_API_KEY
            está definida.
          </AlertDescription>
        </Alert>
      )}

      {/* Atualizar a estrutura do grid para ser mais responsiva */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Menu Lateral */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-y-auto">
            <div className="p-4 border-b bg-blue-50">
              <div>
                <h2 className="font-medium">Navegação</h2>
                <p className="text-xs text-gray-500">Gerenciador de mensagens</p>
              </div>
            </div>

            <div className="p-2">
              <nav className="space-y-1">
                {/* Itens de menu simples */}
                <MenuItem
                  icon={<Inbox />}
                  label="Caixa de entrada"
                  onClick={() => setActiveView("chat")}
                  isActive={activeView === "chat"}
                />

                {/* Seção Conversas com subitens */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Conversas</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <MenuItem icon={<Users />} label="Time" indent />
                    <MenuItem icon={<MessageCircle />} label="Canais" indent />
                    <MenuItem icon={<Tag className="h-4 w-4" />} label="Marcadores" indent />
                  </CollapsibleContent>
                </Collapsible>

                {/* Seção Contatos com subitens */}
                <MenuItem
                  icon={<Users />}
                  label="Contatos"
                  onClick={() => setActiveView("contacts")}
                  isActive={activeView === "contacts" || activeView === "contactDetail"}
                />

                {/* Seção Disparador com subitens incluindo WhatsApp */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Disparador</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <MenuItem icon={<Phone className="h-4 w-4" />} label="WhatsApp" indent />
                    <MenuItem icon={<Zap className="h-4 w-4" />} label="API WhatsApp Business" indent />
                    <MenuItem icon={<Phone className="h-4 w-4" />} label="Integração do número" indent />
                  </CollapsibleContent>
                </Collapsible>

                {/* Seção Importar com subitens */}
                <Collapsible open={expandedSections.importar} onOpenChange={() => toggleSection("importar")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Importar</span>
                    </div>
                    {expandedSections.importar ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <MenuItem icon={<Map />} label="Google Maps" indent />
                    <MenuItem icon={<Building2 />} label="Registro Nacional de Empresas" indent />
                    <MenuItem icon={<FileSpreadsheet />} label="Importar CSV (planilha)" indent />
                  </CollapsibleContent>
                </Collapsible>

                {/* Seção Configurações com subitens */}
                <Collapsible open={expandedSections.configuracoes} onOpenChange={() => toggleSection("configuracoes")}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-100">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Configuração</span>
                    </div>
                    {expandedSections.configuracoes ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 space-y-1 mt-1">
                    <MenuItem icon={<Settings />} label="Configurações avançadas" indent />
                  </CollapsibleContent>
                </Collapsible>
              </nav>
            </div>
          </Card>
        </div>

        {/* Painel Central - Conteúdo dinâmico baseado na visualização ativa */}
        <div className="lg:col-span-5">
          <Card className="h-[600px] flex flex-col">
            {activeView === "chat" && (
              <>
                <div className="p-4 border-b bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-medium">Pan AI Assistant</h2>
                      <p className="text-xs text-gray-500">
                        {selectedContact ? `Conversando sobre ${selectedContact.name}` : "Assistente de IA"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Área de Mensagens */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          <span className="font-medium text-sm">{msg.role === "assistant" ? "Pan AI" : "Você"}</span>
                          <span className="text-xs opacity-70">{msg.timestamp}</span>
                        </div>
                        {msg.isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className={`text-sm ${msg.role === "user" ? "text-white" : "text-gray-800"}`}>
                              Gerando resposta...
                            </span>
                          </div>
                        ) : (
                          <p className={`text-sm ${msg.role === "user" ? "text-white" : "text-gray-800"}`}>
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Área de Input */}
                <div className="p-4 border-t">
                  {error && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {templateType && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Template: {templateType}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTemplateType("")
                            setCustomPrompt("")
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                      {customPrompt && <p className="text-xs text-gray-600 mt-1">{customPrompt}</p>}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full">
                      <Paperclip className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-full">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-full">
                      <Mic className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={templateType ? "Adicione detalhes específicos (opcional)" : "Digite sua mensagem..."}
                      className="flex-1"
                      disabled={isGenerating}
                    />
                    <Button type="submit" size="icon" className="rounded-full" disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </form>
                </div>
              </>
            )}

            {activeView === "contacts" && (
              <>
                <div className="p-4 border-b bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-medium">Contatos</h2>
                        <p className="text-xs text-gray-500">{contacts.length} contatos</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Contato
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Buscar contatos..." className="pl-10" />
                  </div>
                </div>

                {/* Lista de Contatos */}
                <div className="flex-1 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleContactClick(contact)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {contact.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{contact.name}</h3>
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Ver mais
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeView === "contactDetail" && selectedContact && (
              <>
                <div className="p-4 border-b bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleBackToContacts}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h2 className="font-medium">Detalhes do Contato</h2>
                      <p className="text-xs text-gray-500">Informações completas</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-lg">
                        {selectedContact.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-bold">{selectedContact.name}</h2>
                      <div className="flex gap-2 mt-1">
                        {selectedContact.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ContactInfoItem icon={<Phone />} label="Telefone" value={selectedContact.phone} />
                    <ContactInfoItem icon={<Mail />} label="E-mail" value={selectedContact.email} />
                    <ContactInfoItem icon={<MapPin />} label="Endereço" value={selectedContact.address} />
                    <ContactInfoItem icon={<Calendar />} label="Último contato" value={selectedContact.lastContact} />

                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Observações</h3>
                      <p className="text-sm text-gray-600">{selectedContact.notes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setActiveView("chat")
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Conversar
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Painel de Opções */}
        <div className="lg:col-span-4">
          <Card className="p-4 mb-4">
            <h2 className="font-semibold mb-3">Modelos de Mensagem</h2>
            <Tabs defaultValue="promocoes" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="promocoes">Promoções</TabsTrigger>
                <TabsTrigger value="eventos">Eventos</TabsTrigger>
                <TabsTrigger value="atendimento">Atendimento</TabsTrigger>
              </TabsList>
              <TabsContent value="promocoes" className="space-y-2">
                <TemplateCard
                  title="Promoção de Calçados"
                  description="Anuncie uma promoção de calçados com desconto"
                  onClick={() => handleTemplateSelect("promocao", "Promoção de calçados com desconto")}
                />
                <TemplateCard
                  title="Liquidação de Estoque"
                  description="Comunique uma liquidação de fim de estação"
                  onClick={() => handleTemplateSelect("liquidacao", "Liquidação de fim de estação")}
                />
                <TemplateCard
                  title="Oferta Relâmpago"
                  description="Crie uma oferta por tempo limitado"
                  onClick={() => handleTemplateSelect("oferta", "Oferta relâmpago por tempo limitado")}
                />
              </TabsContent>
              <TabsContent value="eventos" className="space-y-2">
                <TemplateCard
                  title="Convite para Evento"
                  description="Convide clientes para um evento especial"
                  onClick={() => handleTemplateSelect("evento", "Convite para evento especial")}
                />
                <TemplateCard
                  title="Lançamento de Coleção"
                  description="Anuncie o lançamento de uma nova coleção"
                  onClick={() => handleTemplateSelect("lancamento", "Lançamento de nova coleção")}
                />
              </TabsContent>
              <TabsContent value="atendimento" className="space-y-2">
                <TemplateCard
                  title="Boas-vindas"
                  description="Mensagem de boas-vindas para novos clientes"
                  onClick={() => handleTemplateSelect("boas-vindas", "Mensagem de boas-vindas para novos clientes")}
                />
                <TemplateCard
                  title="Pós-venda"
                  description="Acompanhamento após uma compra"
                  onClick={() => handleTemplateSelect("pos-venda", "Acompanhamento após uma compra")}
                />
                <TemplateCard
                  title="Feedback"
                  description="Solicite feedback sobre produtos ou serviços"
                  onClick={() => handleTemplateSelect("feedback", "Solicitação de feedback sobre produtos ou serviços")}
                />
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-4 mb-4">
            <h2 className="font-semibold mb-3">Personalizar Mensagem</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="messageType">Tipo de Mensagem</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger id="messageType">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promocao">Promoção</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="boas-vindas">Boas-vindas</SelectItem>
                    <SelectItem value="pos-venda">Pós-venda</SelectItem>
                    <SelectItem value="aniversario">Aniversário</SelectItem>
                    <SelectItem value="reativacao">Reativação de cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Detalhes Adicionais</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Adicione detalhes específicos para personalizar a mensagem..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleSendMessage({ preventDefault: () => {} } as React.FormEvent)}
                disabled={!templateType && !customPrompt}
              >
                Gerar Mensagem Personalizada
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold mb-3">Configurações</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Personalização Automática</span>
                <Badge className="bg-green-500">Ativado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Integração com WhatsApp</span>
                <Badge className="bg-green-500">Conectado</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Histórico de Conversas</span>
                <Badge>7 dias</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Modelo de IA</span>
                <Badge className="bg-blue-500">TogetherAI</Badge>
              </div>
              <div className="mt-4">
                <Button className="w-full">Configurações Avançadas</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Atualizar a estrutura das estatísticas para ser mais responsiva */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8 mb-8">
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Mensagens Enviadas</h3>
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Taxa de Resposta</h3>
          <p className="text-2xl font-bold">87%</p>
          <p className="text-xs text-green-500">+5% em relação ao mês anterior</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm text-gray-500 mb-1">Conversões</h3>
          <p className="text-2xl font-bold">342</p>
          <p className="text-xs text-green-500">+18% em relação ao mês anterior</p>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

// Componente de item de menu
function MenuItem({
  icon,
  label,
  indent = false,
  onClick,
  isActive = false,
}: {
  icon: React.ReactNode
  label: string
  indent?: boolean
  onClick?: () => void
  isActive?: boolean
}) {
  return (
    <button
      className={`flex items-center gap-2 w-full p-2 rounded-md hover:bg-gray-100 ${indent ? "text-xs" : "text-sm"} ${isActive ? "bg-blue-50 text-blue-600 font-medium" : ""}`}
      onClick={onClick}
    >
      <span className={`${isActive ? "text-blue-600" : "text-gray-500"}`}>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function TemplateCard({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={onClick}>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function ContactInfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-5 w-5 mt-0.5 text-gray-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

