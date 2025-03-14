"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Eye, Heart, MessageSquare, Share2, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { FolderIcon as PanfleteIcon, Store, Users, Plus, Calendar } from "lucide-react"
import Link from "next/link"

export function HomeContent() {
  const router = useRouter()

  // Função para lidar com o clique no botão "Criar Panfleto"
  const handleCreatePanfleto = () => {
    console.log("Redirecionando para /panfletos/criar/v7 a partir da Home")
    router.push("/panfletos/criar/v7")
  }

  return (
    <ResponsiveLayout>
      <div className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Panfletos Ativos</CardTitle>
                <PanfleteIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 este mês</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45</div>
                <p className="text-xs text-muted-foreground">+8 esta semana</p>
              </CardContent>
            </Card>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,298</div>
                <p className="text-xs text-muted-foreground">+189 este mês</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Novo panfleto criado</p>
                    <p className="text-xs text-muted-foreground">Hoje, 14:30</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Produto adicionado à vitrine</p>
                    <p className="text-xs text-muted-foreground">Hoje, 11:20</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                  <div className="flex-1">
                    <p className="text-sm">Atualização no perfil</p>
                    <p className="text-xs text-muted-foreground">Ontem, 16:45</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/panfletos/criar">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Panfleto
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/eventos">
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerenciar Eventos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/vitrine-publica-nova">
                  <Store className="mr-2 h-4 w-4" />
                  Visualizar Vitrine
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  )
}

// Components
function PromoBanner({ title, description, bgColor, textColor, badge, eventId = "1" }) {
  const router = useRouter()

  const handleSaibaMais = () => {
    router.push(`/eventos/${eventId}`)
  }

  return (
    <div className={`relative rounded-lg p-4 ${bgColor} ${textColor}`}>
      {badge && <Badge className="absolute right-2 top-2 bg-white text-blue-600">{badge}</Badge>}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-4 text-sm opacity-90">{description}</p>
      <Button
        variant="outline"
        size="sm"
        className={`${textColor} border-current hover:bg-white/10`}
        onClick={handleSaibaMais}
      >
        Saiba Mais
      </Button>
    </div>
  )
}

function Pagination() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((page) => (
          <div key={page} className={`h-2 w-2 rounded-full ${page === 1 ? "bg-blue-600" : "bg-gray-300"}`} />
        ))}
      </div>
      <Button variant="outline" size="icon" className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function StatCard({ icon, value, label }) {
  return (
    <Card className="flex flex-col items-center justify-center p-4">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </Card>
  )
}

function NotificationCard({ title, description, time, priority }) {
  const priorityColors = {
    high: "border-l-red-500",
    medium: "border-l-yellow-500",
    low: "border-l-blue-500",
  }

  return (
    <div className={`bg-white rounded-lg p-4 border border-l-4 ${priorityColors[priority]} flex justify-between`}>
      <div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
      <Checkbox />
    </div>
  )
}

function ProductCard({ title, price, period, stats }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-gray-100 relative">
        <Image src="/placeholder.svg?height=200&width=200" alt={title} fill className="object-cover" />
        <Badge className="absolute left-2 top-2 bg-blue-500">PANFLETO</Badge>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{period}</p>
        <h3 className="text-sm font-medium line-clamp-2 h-10">{title}</h3>
        <div className="mt-2">
          <p className="text-xs text-gray-500">R$</p>
          <p className="text-lg font-bold text-orange-500">{price}</p>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{stats.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{stats.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            <span>{stats.shares}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{stats.comments}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

