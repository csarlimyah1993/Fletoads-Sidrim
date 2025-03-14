"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Home, ShoppingBag, User, Settings, PieChart, Package, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "Início", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: PieChart },
    { href: "/panfletos", label: "Panfletos", icon: ShoppingBag },
    { href: "/eventos", label: "Eventos", icon: Package },
    { href: "/perfil", label: "Perfil", icon: User },
    { href: "/vitrine", label: "Vitrine", icon: Store },
    { href: "/configuracoes", label: "Configurações", icon: Settings },
  ]

  return (
    <div className="md:hidden border-b sticky top-0 z-50 bg-background">
      <div className="flex h-16 items-center px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <div className="px-2 py-6">
              <div className="flex items-center justify-between mb-4 px-4">
                <Link href="/" className="flex items-center space-x-2 font-semibold">
                  <span className="text-xl">Panfletex</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2 mt-6">
                {routes.map((route) => {
                  const Icon = route.icon
                  const isActive = pathname === route.href

                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{route.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center justify-center gap-2 font-semibold">
          <span className="text-lg">Panfletex</span>
        </Link>
      </div>
    </div>
  )
}

