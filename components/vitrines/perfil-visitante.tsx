"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserFromSession, isAuthenticated } from "@/lib/session-utils"
import { useRouter } from "next/navigation"

export default function PerfilVisitante() {
  const { data: sessionData, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    console.log("PerfilVisitante - Session data:", sessionData)
    console.log("PerfilVisitante - Status:", status)
  }, [sessionData, status])

  // Não renderizar nada durante SSR
  if (!mounted) return null

  // Check if authenticated using the same approach as session-diagnostic
  const authenticated = isAuthenticated(status, sessionData)
  const user = getUserFromSession(sessionData)

  console.log("PerfilVisitante - Authenticated:", authenticated)
  console.log("PerfilVisitante - User:", user)

  // Vamos atualizar a função handleLogout para usar o router em vez de window.location
  const handleLogout = async () => {
    try {
      // 1. Fazer logout via NextAuth
      await signOut({ redirect: false })

      // 2. Limpar todos os cookies
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      })

      // 3. Limpar localStorage e sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      // 4. Redirecionar para a página de login usando o router
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Em caso de erro, redirecionar para a página de reset de autenticação
      router.push("/reset-auth")
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
      </div>
    )
  }

  // Verificação mais explícita para garantir que temos um usuário autenticado
  if (authenticated && user) {
    const displayName = user.nome || user.name || user.email?.split("@")[0] || "Visitante"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || ""} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/perfil-visitante">Meu Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Se não estiver autenticado ou não tiver usuário, mostrar o link de login
  return (
    <Link href="/login" className="flex items-center space-x-2">
      <User className="h-5 w-5" />
      <span>Entrar</span>
    </Link>
  )
}
