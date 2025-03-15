"use client"

import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, Store, Key } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Notificacoes } from "@/components/notificacoes"

export function UserNav() {
  const { session, logout } = useAuth()
  const router = useRouter()
  const [loja, setLoja] = useState<any>(null)

  // Buscar dados da loja
  useEffect(() => {
    const fetchLoja = async () => {
      try {
        const response = await fetch("/api/loja/perfil")

        if (response.ok) {
          const data = await response.json()
          setLoja(data)
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
      }
    }

    if (session?.user) {
      fetchLoja()
    }
  }, [session])

  if (!session?.user) {
    return null
  }

  const initials = session.user.nome
    ? session.user.nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : session.user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <div className="flex items-center gap-2">
      <Notificacoes />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {session.user.perfil?.foto ? (
                <AvatarImage src={session.user.perfil.foto} alt={session.user.nome || "Usuário"} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.nome || "Usuário"}</p>
              <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push("/dashboard/perfil")}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            {loja && (
              <DropdownMenuItem onClick={() => router.push("/perfil")}>
                <Store className="mr-2 h-4 w-4" />
                <span>Loja: {loja.nome}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracoes")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/configuracoes")}>
              <Key className="mr-2 h-4 w-4" />
              <span>Alterar Senha</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

