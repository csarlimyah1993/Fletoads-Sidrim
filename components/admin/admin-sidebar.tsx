"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Users, CreditCard, Settings, LayoutDashboard, FileText, Bell, Headphones } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Usuários",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Planos",
    href: "/admin/planos",
    icon: CreditCard,
  },
  {
    title: "Panfletos",
    href: "/admin/panfletos",
    icon: FileText,
  },
  {
    title: "Métricas",
    href: "/admin/metricas",
    icon: BarChart3,
  },
  {
    title: "Notificações",
    href: "/admin/notificacoes",
    icon: Bell,
  },
  {
    title: "Configurações",
    href: "/admin/configuracoes",
    icon: Settings,
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-[#121212] text-gray-300 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white">
            fleto<span className="text-[#4AE3B5]">ads</span> Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors mb-1",
              pathname === item.href
                ? "bg-[#1E3A31] text-[#4AE3B5]"
                : "text-gray-300 hover:bg-gray-800 hover:text-gray-100",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/suporte"
          className="flex items-center justify-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
        >
          <Headphones className="h-5 w-5" />
          <span>Suporte</span>
        </Link>
        <div className="mt-4 text-xs text-gray-500 text-center">https://fletoads-sidrim.vercel.app</div>
      </div>
    </div>
  )
}

