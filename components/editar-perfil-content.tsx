"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  Edit,
  Facebook,
  Instagram,
  Linkedin,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  Palette,
  Layout,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"

export function EditarPerfilContent() {
  const router = useRouter()
  const [description, setDescription] = useState(
    "Nossa loja física é um lugar acolhedor, onde você pode explorar uma ampla variedade de produtos em um ambiente confortável. Agora, você pode explorar nossos produtos e fazer compras online a qualquer momento e de qualquer lugar.",
  )
  const [newSocialLink, setNewSocialLink] = useState("")
  const [expandedDay, setExpandedDay] = useState("segunda")
  const [horarioType, setHorarioType] = useState("custom") // 'custom', '24h', 'closed'

  // Estados para a vitrine web
  const [activeTab, setActiveTab] = useState("perfil")
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [layout, setLayout] = useState("grid")
  const [showSearch, setShowSearch] = useState(true)
  const [showFilters, setShowFilters] = useState(true)

  // Dados simulados das redes sociais
  const [socialNetworks, setSocialNetworks] = useState([
    {
      id: 1,
      platform: "instagram",
      username: "@loja.de.calcados",
      url: "https://www.instagram.com/loja.de.calcados/",
      icon: Instagram,
    },
    {
      id: 2,
      platform: "facebook",
      username: "Loja de Calçados",
      url: "https://www.facebook.com/loja.de.calcados/",
      icon: Facebook,
    },
    {
      id: 3,
      platform: "linkedin",
      username: "Loja de Calçados",
      url: "https://www.linkedin.com/company/loja.de.calcados/",
      icon: Linkedin,
    },
  ])

  // Dados simulados das comodidades
  const [amenities, setAmenities] = useState([
    { id: "banheiros", label: "Banheiros", checked: true },
    { id: "rampa", label: "Rampa De Acessibilidade", checked: true },
    { id: "criancas", label: "Acessível Para Crianças", checked: true },
    { id: "wifi", label: "Wi-Fi Grátis", checked: true },
    { id: "animais", label: "Permitido Animais", checked: true },
    { id: "bebedouro", label: "Bebedouro", checked: true },
    { id: "climatizacao", label: "Climatização", checked: true },
  ])

  // Dados simulados dos horários
  const [businessHours, setBusinessHours] = useState({
    segunda: { open: "08:00", close: "18:00", type: "custom" },
    terca: { open: "08:00", close: "18:00", type: "custom" },
    quarta: { open: "08:00", close: "18:00", type: "custom" },
    quinta: { open: "08:00", close: "18:00", type: "custom" },
    sexta: { open: "08:00", close: "18:00", type: "custom" },
    sabado: { open: "08:00", close: "18:00", type: "custom" },
    domingo: { open: "08:00", close: "18:00", type: "custom" },
  })

  const handleDescriptionChange = (e) => {
    const text = e.target.value
    if (text.length <= 314) {
      setDescription(text)
    }
  }

  const handleRemoveSocialNetwork = (id) => {
    setSocialNetworks(socialNetworks.filter((network) => network.id !== id))
  }

  const handleAddSocialNetwork = () => {
    if (newSocialLink.trim()) {
      const newId = socialNetworks.length > 0 ? Math.max(...socialNetworks.map((n) => n.id)) + 1 : 1
      setSocialNetworks([
        ...socialNetworks,
        {
          id: newId,
          platform: "other",
          username: newSocialLink,
          url: newSocialLink,
          icon: Linkedin, // Default icon
        },
      ])
      setNewSocialLink("")
    }
  }

  const toggleAmenity = (id) => {
    setAmenities(amenities.map((amenity) => (amenity.id === id ? { ...amenity, checked: !amenity.checked } : amenity)))
  }

  const deselectAllAmenities = () => {
    setAmenities(amenities.map((amenity) => ({ ...amenity, checked: false })))
  }

  const toggleDayExpansion = (day) => {
    setExpandedDay(expandedDay === day ? "" : day)
  }

  const updateBusinessHour = (day, field, value) => {
    setBusinessHours({
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value,
      },
    })
  }

  const handleHorarioTypeChange = (type) => {
    setHorarioType(type)
    if (expandedDay) {
      updateBusinessHour(expandedDay, "type", type)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as alterações
    router.push("/perfil")
  }

  const applyToAll = () => {
    const currentDaySettings = businessHours[expandedDay]
    const updatedHours = {}

    Object.keys(businessHours).forEach((day) => {
      updatedHours[day] = { ...currentDaySettings }
    })

    setBusinessHours(updatedHours)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Edição De Perfil</h1>
      <p className="text-gray-500 mb-6">Edite as informações e imagens no perfil e vitrine web de sua loja.</p>

      {/* Tabs para separar as seções */}
      <Tabs defaultValue="perfil" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="perfil">Perfil da Loja</TabsTrigger>
          <TabsTrigger value="vitrine">Vitrine Web</TabsTrigger>
        </TabsList>

        {/* Tab de Perfil da Loja */}
        <TabsContent value="perfil">
          {/* Foto de Perfil */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Foto de Perfil</h2>
            <p className="text-gray-500 text-sm mb-4">Faça o envio de suas imagens aqui.</p>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center">
              <div className="mb-4">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Resolução até 800x800px</p>
              <Button variant="outline" size="sm" className="mt-2">
                Selecionar Arquivo
              </Button>
            </div>
          </div>

          {/* Imagens de Capa */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Imagens de Capa</h2>
            <p className="text-gray-500 text-sm mb-4">Faça o envio de suas imagens aqui.</p>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center mb-4">
              <div className="mb-4">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-1">Resolução até 1280x640px</p>
              <Button variant="outline" size="sm" className="mt-2">
                Selecionar Arquivo
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="border border-gray-200 rounded-lg aspect-video flex items-center justify-center"
                >
                  <Upload className="h-6 w-6 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Sobre Nossa Loja */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Sobre Nossa Loja</h2>
            <p className="text-gray-500 text-sm mb-4">Descreva porque seus clientes deveriam visitar sua loja!</p>

            <Textarea value={description} onChange={handleDescriptionChange} className="min-h-[100px] mb-2" />
            <div className="text-right text-xs text-gray-500">{description.length}/314 caracteres.</div>
          </div>

          {/* Redes Sociais */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Redes Sociais</h2>
            <p className="text-gray-500 text-sm mb-4">Adicione os endereços das redes sociais da sua loja.</p>

            <div className="space-y-4 mb-4">
              {socialNetworks.map((network) => (
                <div key={network.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <network.icon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{network.username}</p>
                      <p className="text-xs text-gray-500">{network.url}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveSocialNetwork(network.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Adicionar um novo link de seu perfil"
                value={newSocialLink}
                onChange={(e) => setNewSocialLink(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddSocialNetwork}>Adicionar</Button>
            </div>
          </div>

          {/* Comodidades da Loja */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Comodidades da Loja</h2>
            <p className="text-gray-500 text-sm mb-4">
              Quais facilidades o espaço físico da sua loja oferece para os clientes.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer ${amenity.checked ? "bg-gray-100" : ""}`}
                  onClick={() => toggleAmenity(amenity.id)}
                >
                  <Checkbox
                    checked={amenity.checked}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                    id={amenity.id}
                  />
                  <Label htmlFor={amenity.id} className="cursor-pointer text-sm">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={deselectAllAmenities}>
                Desmarcar Todos
              </Button>
              <Button>Adicionar</Button>
            </div>
          </div>

          {/* Horários de Atendimento */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Horários de Atendimento</h2>
            <p className="text-gray-500 text-sm mb-4">Adicione os dias e horários nos quais sua loja estará aberta.</p>

            <div className="space-y-2">
              {/* Segunda-Feira */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("segunda")}
                >
                  <div className="font-medium">Segunda-Feira</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.segunda.type === "custom"
                        ? `${businessHours.segunda.open} às ${businessHours.segunda.close}`
                        : businessHours.segunda.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "segunda" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedDay === "segunda" && (
                  <div className="p-4 border-t bg-gray-50">
                    <RadioGroup
                      value={businessHours.segunda.type}
                      onValueChange={(value) => {
                        handleHorarioTypeChange(value)
                        updateBusinessHour("segunda", "type", value)
                      }}
                      className="mb-4 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom">Adicionar horário</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="24h" id="24h" />
                        <Label htmlFor="24h">24 horas</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="closed" id="closed" />
                        <Label htmlFor="closed">Fechado</Label>
                      </div>
                    </RadioGroup>

                    {businessHours.segunda.type === "custom" && (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type="text"
                            value={businessHours.segunda.open}
                            onChange={(e) => updateBusinessHour("segunda", "open", e.target.value)}
                            className="pl-8"
                          />
                          <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <span>Até</span>
                        <div className="relative">
                          <Input
                            type="text"
                            value={businessHours.segunda.close}
                            onChange={(e) => updateBusinessHour("segunda", "close", e.target.value)}
                            className="pl-8"
                          />
                          <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={applyToAll}>
                        Aplicar a Todos
                      </Button>
                      <Button>Adicionar</Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Terça-Feira */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("terca")}
                >
                  <div className="font-medium">Terça-Feira</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.terca.type === "custom"
                        ? `${businessHours.terca.open} às ${businessHours.terca.close}`
                        : businessHours.terca.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "terca" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Quarta-Feira */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("quarta")}
                >
                  <div className="font-medium">Quarta-Feira</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.quarta.type === "custom"
                        ? `${businessHours.quarta.open} às ${businessHours.quarta.close}`
                        : businessHours.quarta.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "quarta" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Quinta-Feira */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("quinta")}
                >
                  <div className="font-medium">Quinta-Feira</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.quinta.type === "custom"
                        ? `${businessHours.quinta.open} às ${businessHours.quinta.close}`
                        : businessHours.quinta.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "quinta" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Sexta-Feira */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("sexta")}
                >
                  <div className="font-medium">Sexta-Feira</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.sexta.type === "custom"
                        ? `${businessHours.sexta.open} às ${businessHours.sexta.close}`
                        : businessHours.sexta.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "sexta" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Sábado */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("sabado")}
                >
                  <div className="font-medium">Sábado</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.sabado.type === "custom"
                        ? `${businessHours.sabado.open} às ${businessHours.sabado.close}`
                        : businessHours.sabado.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "sabado" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Domingo */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer"
                  onClick={() => toggleDayExpansion("domingo")}
                >
                  <div className="font-medium">Domingo</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {businessHours.domingo.type === "custom"
                        ? `${businessHours.domingo.open} às ${businessHours.domingo.close}`
                        : businessHours.domingo.type === "24h"
                          ? "24 horas"
                          : "Fechado"}
                    </span>
                    {expandedDay === "domingo" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab de Vitrine Web */}
        <TabsContent value="vitrine">
          <Tabs defaultValue="appearance" className="mb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="h-4 w-4" />
                Aparência
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Cores</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-10 h-10 rounded border" style={{ backgroundColor: primaryColor }} />
                      <Input
                        id="primary-color"
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usada para botões, links e elementos de destaque</p>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-10 h-10 rounded border" style={{ backgroundColor: secondaryColor }} />
                      <Input
                        id="secondary-color"
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usada para elementos de destaque secundários</p>
                  </div>
                </div>

                <h3 className="font-medium mb-2">Temas Pré-definidos</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-20 rounded-lg cursor-pointer border-2 border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-blue-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-green-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-purple-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-orange-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tipografia</h2>

                <div className="mb-4">
                  <Label htmlFor="font-family">Família de Fonte</Label>
                  <Select defaultValue={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family" className="mt-1">
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visualização</Label>
                  <div className="mt-2 p-4 border rounded-lg" style={{ fontFamily }}>
                    <h3 className="text-xl font-bold mb-2">Título de Exemplo</h3>
                    <p>Este é um texto de exemplo para visualizar a fonte selecionada. A fonte atual é {fontFamily}.</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Layout de Produtos</h2>

                <RadioGroup value={layout} onValueChange={setLayout} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "grid" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="grid" id="grid" className="sr-only" />
                    <Label htmlFor="grid" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="grid grid-cols-2 gap-2 w-24">
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Grade</p>
                    </Label>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "list" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="list" id="list" className="sr-only" />
                    <Label htmlFor="list" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="flex flex-col gap-2 w-24">
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Lista</p>
                    </Label>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "masonry" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="masonry" id="masonry" className="sr-only" />
                    <Label htmlFor="masonry" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="grid grid-cols-2 gap-2 w-24">
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-[1/1.5] bg-gray-200 rounded"></div>
                          <div className="aspect-[1/1.2] bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Mosaico</p>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Elementos da Interface</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-search" className="font-medium">
                        Barra de Pesquisa
                      </Label>
                      <p className="text-sm text-gray-500">Exibir barra de pesquisa no topo da vitrine</p>
                    </div>
                    <Switch id="show-search" checked={showSearch} onCheckedChange={setShowSearch} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-filters" className="font-medium">
                        Filtros
                      </Label>
                      <p className="text-sm text-gray-500">Exibir opções de filtro para os produtos</p>
                    </div>
                    <Switch id="show-filters" checked={showFilters} onCheckedChange={setShowFilters} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="products-per-row" className="font-medium">
                        Produtos por Linha
                      </Label>
                      <p className="text-sm text-gray-500">Número de produtos exibidos por linha</p>
                    </div>
                    <Select defaultValue="3">
                      <SelectTrigger id="products-per-row" className="w-24">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-prices" className="font-medium">
                        Exibir Preços
                      </Label>
                      <p className="text-sm text-gray-500">Mostrar preços dos produtos na vitrine</p>
                    </div>
                    <Switch id="show-prices" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-stock" className="font-medium">
                        Exibir Estoque
                      </Label>
                      <p className="text-sm text-gray-500">Mostrar quantidade em estoque dos produtos</p>
                    </div>
                    <Switch id="show-stock" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-cart" className="font-medium">
                        Carrinho de Compras
                      </Label>
                      <p className="text-sm text-gray-500">Habilitar funcionalidade de carrinho de compras</p>
                    </div>
                    <Switch id="enable-cart" defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Domínio e SEO</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain">Domínio Personalizado</Label>
                    <div className="flex gap-2">
                      <Input id="domain" defaultValue="lojadecalcados.com.br" />
                      <Button variant="outline">Verificar</Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Você precisa configurar os registros DNS para apontar para nossa plataforma
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-title">Título da Página (SEO)</Label>
                    <Input id="meta-title" defaultValue="Loja de Calçados - Qualidade e Conforto" />
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Descrição da Página (SEO)</Label>
                    <Textarea
                      id="meta-description"
                      defaultValue="Encontre os melhores calçados com qualidade e conforto na Loja de Calçados. Variedade de modelos para todos os gostos e ocasiões."
                      className="h-24"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-xs text-gray-500">Designed by REZZON</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </div>
    </div>
  )
}

