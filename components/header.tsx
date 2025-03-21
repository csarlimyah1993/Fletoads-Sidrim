"use client"

import { Bell, Menu, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { NotificationsDropdown } from './notifications-dropdown'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              FletoAds
            </span>
          </a>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {title && <h1 className="text-lg font-semibold">{title}</h1>}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="mr-2 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <Sidebar />
          </SheetContent>
        </Sheet>
        {pathname === "/" && (
          <a
            className="flex items-center space-x-2 md:hidden"
            href="/"
          >
            <span className="font-bold">FletoAds</span>
          </a>
        )}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <NotificationsDropdown />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "Avatar"} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/perfil">Perfil</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/configuracoes">Configurações</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}