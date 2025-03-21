"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LojaInfoCard } from "@/components/perfil/loja-info-card"
import { QRCodeGenerator } from "@/components/perfil/qr-code-generator"
import { PlanoDashboardCard } from "@/components/perfil/plano-dashboard-card"
import { Edit, Share2, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"
import { useRouter } from "next/navigation"
import { Wifi, Accessibility, Baby, Dog, Droplets, Snowflake, Bath } from "lucide-react"

interface LojaPerfilContentProps {
  loja: any
}

export function LojaPerfilContent({ loja }: LojaPerfilContentProps) {
  const router = useRouter()

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case "banheiros":
        return <Bath className="h-4 w-4" />
      case "acessibilidade":
        return <Accessibility className="h-4 w-4" />
      case "criancas":
        return <Baby className="h-4 w-4" />
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "animais":
        return <Dog className="h-4 w-4" />
      case "bebedouro":
        return <Droplets className="h-4 w-4" />
      case "climatizacao":
        return <Snowflake className="h-4 w-4" />
      default:
        return null
    }
  }

  const getTagName = (tag: string) => {
    switch (tag) {
      case "banheiros":
        return "Banheiros"
      case "acessibilidade":
        return "Rampa de acessibilidade"
      case "criancas":
        return "Acessível para crianças"
      case "wifi":
        return "Wi-Fi Grátis"
      case "animais":
        return "Permitido Animais"
      case "bebedouro":
        return "Bebedouro"
      case "climatizacao":
        return "Climatização"
      default:
        return tag
    }
  }

  // URL da loja para o QR Code
  const storeUrl = loja.website || `https://fletoads.com/loja/${loja._id}`

  return (
    <div className="space-y-8">
      {/* Banner e Logo */}
      <div className="relative">
        <div className="w-full h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
          {loja.banner ? (
            <img
              src={loja.banner || "/placeholder.svg"}
              alt={`Banner da ${loja.nome}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem banner</div>
          )}
        </div>
        <div className="absolute -bottom-16 left-8 w-32 h-32 bg-background rounded-full border-4 border-background overflow-hidden">
          {loja.logo ? (
            <img
              src={loja.logo || "/placeholder.svg"}
              alt={`Logo da ${loja.nome}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-muted-foreground">
              Logo
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => router.push("/perfil-da-loja/editar")}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Informações da Loja */}
      <div className="pt-16 px-4">
        <h1 className="text-3xl font-bold">{loja.nome}</h1>
        {loja.descricao && <p className="mt-2 text-muted-foreground">{loja.descricao}</p>}

        {/* Tags */}
        {loja.tags && loja.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {loja.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-3 py-1.5">
                {getTagIcon(tag)}
                {getTagName(tag)}
              </Badge>
            ))}
          </div>
        )}

        {/* Redes Sociais */}
        {loja.redesSociais && (
          <div className="mt-4 flex gap-2">
            {loja.redesSociais.facebook && (
              <Button variant="outline" size="icon" asChild>
                <a href={loja.redesSociais.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            )}
            {loja.redesSociais.instagram && (
              <Button variant="outline" size="icon" asChild>
                <a href={loja.redesSociais.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {loja.redesSociais.twitter && (
              <Button variant="outline" size="icon" asChild>
                <a href={loja.redesSociais.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-4 w-4" />
                </a>
              </Button>
            )}
            {loja.redesSociais.linkedin && (
              <Button variant="outline" size="icon" asChild>
                <a href={loja.redesSociais.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
            {loja.redesSociais.youtube && (
              <Button variant="outline" size="icon" asChild>
                <a href={loja.redesSociais.youtube} target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Cards de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        <LojaInfoCard loja={loja} />
        {/* Usando o componente QRCodeGenerator com as props corretas */}
        <QRCodeGenerator url={storeUrl} storeName={loja.nome || "Minha Loja"} logoUrl={loja.logo} />
        <PlanoDashboardCard />
      </div>

      {/* Vitrine Web (Placeholder) */}
      <Card className="mx-4">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Vitrine Web</h2>
          <p className="text-muted-foreground mb-4">
            Sua loja online está disponível para seus clientes. Compartilhe o link e aumente suas vendas.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"
              >
                Produto {item}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Ver Vitrine Completa</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

