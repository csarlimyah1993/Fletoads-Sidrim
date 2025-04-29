"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Loader2 } from "lucide-react"
import { getUserFromSession } from "@/lib/session-utils"

export function BasicAuthMenu() {
  const { data: session, status } = useSession()
  const user = getUserFromSession(session)

  // Handle loading state
  if (status === "loading") {
    return <Loader2 className="h-5 w-5 animate-spin" />
  }

  // Handle unauthenticated state
  if (status === "unauthenticated" || !user) {
    return (
      <Button asChild size="sm">
        <Link href="/login">
          <User className="mr-2 h-4 w-4" />
          Entrar
        </Link>
      </Button>
    )
  }

  // User is authenticated
  const displayName = user.name || user.nome || user.email?.split("@")[0] || "Usuário"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
