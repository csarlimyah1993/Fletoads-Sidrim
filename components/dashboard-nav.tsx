"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// Adicione o import do ShoppingBag se ainda não estiver presente
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  Settings,
  BarChart,
  Sparkles,
  MessageSquare,
  FileCheck,
  ShoppingBag,
  Package,
} from "lucide-react"

// Atualize o array navItems para incluir o item de Produtos após Panfletos
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Vendas",
    href: "/dashboard/vendas",
    icon: ShoppingBag,
  },
  {
    title: "Panfletos",
    href: "/dashboard/panfletos",
    icon: FileText,
  },
  {
    title: "Produtos",
    href: "/dashboard/produtos",
    icon: Package,
  },
  {
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: Users,
  },
  {
    title: "Campanhas",
    href: "/dashboard/campanhas",
    icon: Calendar,
  },
  {
    title: "Assistente IA",
    href: "/dashboard/ai",
    icon: Sparkles,
  },
  {
    title: "Pan AI",
    href: "/dashboard/pan-ai",
    icon: MessageSquare,
  },
  {
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
  {
    title: "Diagnóstico",
    href: "/dashboard/diagnostico",
    icon: FileCheck,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 pt-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  )
}

