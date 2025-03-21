"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Store,
  Settings,
  ChevronDown,
  ChevronRight,
  Users,
  CreditCard,
  BarChart,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Verificar se o usuário é admin
  const isAdmin = session?.user?.role === "admin"

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: pathname === "/admin",
    },
    {
      title: "Usuários",
      icon: <Users className="h-5 w-5" />,
      submenu: true,
      active: pathname.includes("/admin/usuarios"),
      submenuItems: [
        {
          title: "Lista de Usuários",
          href: "/admin/usuarios",
          active: pathname === "/admin/usuarios",
        },
        {
          title: "Adicionar Usuário",
          href: "/admin/usuarios/adicionar",
          active: pathname === "/admin/usuarios/adicionar",
        },
      ],
    },
    {
      title: "Produtos",
      icon: <ShoppingBag className="h-5 w-5" />,
      submenu: true,
      active: pathname.includes("/admin/produtos"),
      submenuItems: [
        {
          title: "Lista de Produtos",
          href: "/admin/produtos",
          active: pathname === "/admin/produtos",
        },
        {
          title: "Adicionar Produto",
          href: "/admin/produtos/adicionar",
          active: pathname === "/admin/produtos/adicionar",
        },
        {
          title: "Categorias",
          href: "/admin/produtos/categorias",
          active: pathname === "/admin/produtos/categorias",
        },
      ],
    },
    {
      title: "Panfletos",
      icon: <FileText className="h-5 w-5" />,
      submenu: true,
      active: pathname.includes("/admin/panfletos"),
      submenuItems: [
        {
          title: "Lista de Panfletos",
          href: "/admin/panfletos",
          active: pathname === "/admin/panfletos",
        },
        {
          title: "Adicionar Panfleto",
          href: "/admin/panfletos/adicionar",
          active: pathname === "/admin/panfletos/adicionar",
        },
      ],
    },
    {
      title: "Lojas",
      icon: <Store className="h-5 w-5" />,
      submenu: true,
      active: pathname.includes("/admin/lojas"),
      submenuItems: [
        {
          title: "Lista de Lojas",
          href: "/admin/lojas",
          active: pathname === "/admin/lojas",
        },
        {
          title: "Adicionar Loja",
          href: "/admin/lojas/adicionar",
          active: pathname === "/admin/lojas/adicionar",
        },
      ],
    },
    {
      title: "Assinaturas",
      icon: <CreditCard className="h-5 w-5" />,
      submenu: true,
      active: pathname.includes("/admin/assinaturas"),
      submenuItems: [
        {
          title: "Planos",
          href: "/admin/assinaturas/planos",
          active: pathname === "/admin/assinaturas/planos",
        },
        {
          title: "Assinantes",
          href: "/admin/assinaturas/assinantes",
          active: pathname === "/admin/assinaturas/assinantes",
        },
      ],
    },
    {
      title: "Relatórios",
      href: "/admin/relatorios",
      icon: <BarChart className="h-5 w-5" />,
      active: pathname === "/admin/relatorios",
    },
    {
      title: "Configurações",
      href: "/admin/configuracoes",
      icon: <Settings className="h-5 w-5" />,
      active: pathname === "/admin/configuracoes",
    },
  ]

  // Se o usuário não for admin, não mostrar o sidebar
  if (!isAdmin) {
    return null
  }

  return (
    <div className="h-full w-64 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center font-semibold">
          <div className="h-6 w-6 rounded-full bg-primary mr-2"></div>
          <span>Admin Panel</span>
        </Link>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                      item.active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    {openMenus[item.title] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {openMenus[item.title] && (
                    <div className="mt-1 space-y-1 pl-10">
                      {item.submenuItems?.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href || "#"}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm font-medium",
                            subItem.active
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    item.active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

