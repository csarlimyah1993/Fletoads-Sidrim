"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ChevronLeft, ChevronRight, FileText, Home, Package, Settings, Store, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AdminSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className, ...props }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const routes = [
    {
      href: "/admin",
      icon: Home,
      title: "Dashboard",
    },
    {
      href: "/admin/clientes",
      icon: Users,
      title: "Clientes",
    },
    {
      href: "/admin/panfletos",
      icon: FileText,
      title: "Panfletos",
    },
    {
      href: "/admin/campanhas",
      icon: BarChart3,
      title: "Campanhas",
    },
    {
      href: "/admin/produtos",
      icon: Package,
      title: "Produtos",
    },
    {
      href: "/admin/lojas",
      icon: Store,
      title: "Lojas",
    },
    {
      href: "/admin/configuracoes",
      icon: Settings,
      title: "Configurações",
    },
  ]

  return (
    <div
      className={cn(
        "relative h-screen border-r bg-background transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[240px]",
        className,
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <div className="mt-6 px-4">
        <div className="mb-2 px-2 text-xs font-medium uppercase text-muted-foreground">{!collapsed && "Menu"}</div>
        <nav className="space-y-1 px-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={pathname === route.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === route.href ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/50",
                collapsed ? "h-10 px-2" : "h-10 px-3",
              )}
              asChild
            >
              <Link href={route.href} className="flex items-center">
                <route.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                {!collapsed && <span className="text-sm">{route.title}</span>}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}

