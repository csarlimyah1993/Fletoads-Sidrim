"use client"

import type React from "react"

import Image from "next/image"
import {
  Bath,
  Accessibility,
  Wifi,
  PawPrint,
  Baby,
  Snowflake,
  Info,
  Edit,
  QrCode,
  Printer,
  FileText,
  Calendar,
  Zap,
  Ticket,
  Globe,
  Layout,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Define interfaces for component props
interface SocialButtonProps {
  icon: React.ReactNode
}

interface AmenityBadgeProps {
  icon: React.ReactNode
  label: string
}

interface InfoItemProps {
  label: string
  value: string
}

interface PlanItemProps {
  icon: React.ReactNode
  label: string
  value: string
  total: string
}

export function PerfilContent() {
  const router = useRouter()

  return (
    <>
      {/* Store Showcase */}
      <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
        <Image src="/placeholder.svg?height=300&width=1200" alt="Vitrine da Loja" fill className="object-cover" />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <SocialButton
            icon={<Image src="/placeholder.svg?height=24&width=24" alt="Instagram" width={24} height={24} />}
          />
          <SocialButton
            icon={<Image src="/placeholder.svg?height=24&width=24" alt="WhatsApp" width={24} height={24} />}
          />
          <SocialButton
            icon={<Image src="/placeholder.svg?height=24&width=24" alt="Facebook" width={24} height={24} />}
          />
          <SocialButton icon={<Image src="/placeholder.svg?height=24&width=24" alt="Email" width={24} height={24} />} />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
          <div className="h-2 w-2 rounded-full bg-white opacity-70"></div>
          <div className="h-2 w-2 rounded-full bg-white opacity-70"></div>
          <div className="h-2 w-2 rounded-full bg-white"></div>
          <div className="h-2 w-2 rounded-full bg-white opacity-70"></div>
        </div>
      </div>

      {/* Store Profile Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="h-16 w-16 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Loja De Calçados"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Loja De Calçados</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <span>Segunda à sexta</span>
                  <span className="font-medium">08:00 às 18:00</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Sábado</span>
                  <span className="font-medium">08:00 às 12:00</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Domingo</span>
                  <span className="font-medium">Fechado</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => router.push("/perfil/editar")}>
            <Edit className="h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* About Our Store */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Sobre Nossa Loja</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <AmenityBadge icon={<Bath className="h-4 w-4" />} label="Banheiros" />
            <AmenityBadge icon={<Accessibility className="h-4 w-4" />} label="Rampa de acessibilidade" />
            <AmenityBadge icon={<Baby className="h-4 w-4" />} label="Acessível para crianças" />
            <AmenityBadge icon={<Wifi className="h-4 w-4" />} label="Wi-Fi Grátis" />
            <AmenityBadge icon={<PawPrint className="h-4 w-4" />} label="Permitido Animais" />
            <AmenityBadge icon={<Baby className="h-4 w-4" />} label="Bebedouro" />
            <AmenityBadge icon={<Snowflake className="h-4 w-4" />} label="Climatização" />
          </div>

          <p className="text-gray-600 text-sm mb-6">
            Nossa loja física é um lugar acolhedor, onde você pode explorar uma ampla variedade de produtos em um
            ambiente confortável. Agora, você pode explorar nossos produtos e fazer compras online a qualquer momento e
            de qualquer lugar.
          </p>
        </Card>

        {/* General Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Informações Gerais</h3>
          </div>

          <div className="space-y-4">
            <InfoItem label="Nome Fantasia" value="Loja de Calçados" />
            <InfoItem label="CNPJ" value="12.345.678/0001-90" />
            <InfoItem label="Endereço" value="Rua Nossa Senhora de Lourdes, nº 111, Cidade de Deus, 69099325" />
            <InfoItem label="Cidade" value="Manaus, AM" />
            <InfoItem label="E-Mail" value="loja@calcados.com" />
            <InfoItem label="Site" value="http://www.lojadecalçados.com.br" />
          </div>
        </Card>

        {/* QR Code e Gerenciamento */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">Seu QR Code</h3>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="border p-2 rounded-lg">
              <Image src="/placeholder.svg?height=100&width=100" alt="QR Code" width={100} height={100} />
            </div>
            <p className="text-sm text-gray-600">Imprima o QR Code de acesso para a sua vitrine web.</p>
          </div>

          <Button variant="outline" className="w-full mb-6 gap-2">
            <Printer className="h-4 w-4" />
            Imprimir Código
          </Button>

          <div className="space-y-2">
            <Button variant="outline" className="w-full gap-2" onClick={() => router.push("/vitrine-gerenciamento")}>
              <Layout className="h-4 w-4" />
              Gerenciar Vitrine
            </Button>
            <Button variant="outline" className="w-full gap-2" onClick={() => router.push("/vitrine-publica-nova")}>
              <Globe className="h-4 w-4" />
              Acessar Vitrine
            </Button>
          </div>
        </Card>

        {/* Silver Package */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">Pacote Prata</h3>
            </div>
            <Button variant="link" className="text-blue-500 p-0 h-auto">
              Ver Detalhes
            </Button>
          </div>

          <div className="flex justify-center mb-6">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="10"
                  strokeDasharray={`${(182 / 365) * 283} 283`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">182</span>
                <span className="text-sm text-gray-500">/365</span>
                <span className="text-xs text-gray-500 mt-1">Dias restantes</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <PlanItem icon={<FileText className="h-4 w-4" />} label="Panfletos Ativos" value="0" total="10" />
            <PlanItem icon={<Calendar className="h-4 w-4" />} label="Panfletos Programados" value="0" total="10" />
            <PlanItem icon={<Zap className="h-4 w-4" />} label="Hotpromos Diários" value="3" total="10" />
            <PlanItem icon={<Ticket className="h-4 w-4" />} label="Cupons" value="6" total="10" />
          </div>

          <Button className="w-full mt-6 bg-blue-500 hover:bg-blue-600">Aprimorar Seu Plano</Button>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </>
  )
}

// Components
function SocialButton({ icon }: SocialButtonProps) {
  return <button className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">{icon}</button>
}

function AmenityBadge({ icon, label }: AmenityBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-xs bg-gray-100 rounded-md px-2 py-1">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  )
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function PlanItem({ icon, label, value, total }: PlanItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="font-medium">
        <span className={value === "0" ? "text-gray-400" : ""}>{value}</span>
        <span className="text-gray-400">/{total}</span>
      </div>
    </div>
  )
}
