"use client"

import { Bell, Key, ShoppingBag, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

function NotificationItem({ title, description, time, isNew }) {
  return (
    <div className={`p-3 border-b hover:bg-gray-50 ${isNew ? "bg-blue-50" : ""}`}>
      <div className="flex items-center gap-2 mb-1">
        {isNew && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <p className="text-xs text-gray-600 mb-1">{description}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  )
}

export function Header() {
  const router = useRouter()

  const handleLogout = () => {
    // Aqui você poderia adicionar lógica para limpar tokens, cookies, etc.
    router.push("/login") // Redireciona para a página de login
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <Image src="/fleto-verde.svg" alt="Logo" width={32} height={32} />
        </Link>
        <h1 className="ml-4 text-lg md:text-xl font-semibold truncate">Bem-vindo, Loja De Calçados</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                4
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2 border-b">
              <h3 className="font-medium">Notificações</h3>
              <Button variant="ghost" size="sm" className="text-xs text-blue-500">
                Marcar todas como lidas
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <NotificationItem
                title="Sua Assinatura vai expirar logo!"
                description="Sua Assinatura vai expirar em 48 horas, não perca tempo e renove sua assinatura."
                time="2 horas atrás"
                isNew={true}
              />
              <NotificationItem
                title="2 Panfletos Ativos estão prestes a expirar"
                description="Clique para ver os panfletos e renovar a data ou arquivar."
                time="3 horas atrás"
                isNew={true}
              />
              <NotificationItem
                title="Novo Evento: Comércio de Bairro 2024"
                description="Um novo evento se aproxima. Cadastre-se a partir do dia 28/01/2023."
                time="1 dia atrás"
                isNew={false}
              />
              <NotificationItem
                title="Novo Evento: Dia Livre de Impostos 2024"
                description="Um novo evento se aproxima. Cadastre-se a partir do dia 28/01/2023."
                time="2 dias atrás"
                isNew={false}
              />
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="text-xs text-blue-500 w-full">
                Ver todas as notificações
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Substituir a div pelo DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Loja De Calçados</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push("/trocar-senha")} className="cursor-pointer">
              <Key className="h-4 w-4 mr-2" />
              Trocar senha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
            <div className="px-2 py-1 text-xs text-gray-500 border-t mt-1">Versão 1.0</div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

