"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Users, FileText, Settings, User, ShoppingBag, Store, MessageSquare, Smartphone } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  disabled?: boolean
}

export function DashboardNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
    },
    {
      title: "Clientes",
      href: "/dashboard/clientes",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Campanhas",
      href: "/dashboard/campanhas",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Panfletos",
      href: "/dashboard/panfletos",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Produtos",
      href: "/dashboard/produtos",
      icon: <ShoppingBag className="mr-2 h-4 w-4" />,
    },
    {
      title: "Perfil da Loja",
      href: "/dashboard/perfil-da-loja",
      icon: <Store className="mr-2 h-4 w-4" />,
    },
    {
      title: "Vitrine",
      href: "/dashboard/vitrine",
      icon: <Store className="mr-2 h-4 w-4" />,
    },
    {
      title: "PanAI",
      href: "/dashboard/pan-ai",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
    },
    {
      title: "Integrações",
      href: "/dashboard/integracoes",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: "WhatsApp",
      href: "/dashboard/integracoes/whatsapp",
      icon: <Smartphone className="mr-2 h-4 w-4" />,
    },
    {
      title: "Perfil",
      href: "/dashboard/perfil",
      icon: <User className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.disabled ? "#" : item.href}
          className={cn(
            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            item.disabled && "cursor-not-allowed opacity-80",
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}

