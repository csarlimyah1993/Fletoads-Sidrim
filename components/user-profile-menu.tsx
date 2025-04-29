"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, UserCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserFromSession, isAuthenticated } from "@/lib/session-utils"

export function UserProfileMenu() {
  const { data: sessionData, status, update } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("UserProfileMenu - Session data:", sessionData)
    console.log("UserProfileMenu - Status:", status)
  }, [sessionData, status])

  // Don't render anything during SSR
  if (!mounted) return null

  // If loading, show a simple loading state
  if (status === "loading") {
    return <Loader2 className="h-5 w-5 animate-spin text-primary" />
  }

  // Check if authenticated using the same approach as session-diagnostic
  const authenticated = isAuthenticated(status, sessionData)
  const user = getUserFromSession(sessionData)

  console.log("UserProfileMenu - Authenticated:", authenticated)
  console.log("UserProfileMenu - User:", user)

  // If authenticated and we have user data, show the user menu
  if (authenticated && user) {
    const displayName = user.nome || user.name || user.email?.split("@")[0] || "Usuário"
    const profileLink = user.tipoUsuario === "visitante" ? "/perfil-visitante" : "/perfil"
    const userRole = user.role || "user"

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 h-9 px-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={user.image || ""} alt={displayName} />
              <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="max-w-[100px] truncate hidden sm:inline-block">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">{userRole}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={profileLink} className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/configuracoes" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // If not authenticated, show login buttons
  return (
    <>
      <Button variant="outline" asChild className="hidden sm:inline-flex">
        <Link href="/login">Entrar</Link>
      </Button>
      <Button asChild size="sm" className="text-sm">
        <Link href="/registro">Criar Conta</Link>
      </Button>
    </>
  )
}
