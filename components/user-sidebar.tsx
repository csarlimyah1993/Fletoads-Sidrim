"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Zap,
  Store,
  ShoppingCart,
  Bot,
  Bell,
  MapPin,
  Eye,
  BarChart2,
  Users,
  Megaphone,
  HelpCircle,
  LogOut,
  Puzzle,
  Moon,
  Sun,
  Settings,
  User,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function UserSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { hasFeature, planLevel, planName, isLoading } = usePlanFeatures()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Define all menu items with their feature requirements
  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      feature: null, // Always visible
    },
    {
      title: "Produtos",
      href: "/produtos",
      icon: ShoppingBag,
      feature: "produtos" as const,
    },
    {
      title: "Panfletos",
      href: "/panfletos",
      icon: FileText,
      feature: "panfletos" as const,
    },
    {
      title: "Hot Promos",
      href: "/hot-promos",
      icon: Zap,
      feature: "hotPromos" as const,
    },
    {
      title: "Perfil da Loja",
      href: "/perfil-da-loja",
      icon: Store,
      feature: "vitrine" as const,
    },
    {
      title: "Vendas",
      href: "/vendas",
      icon: ShoppingCart,
      feature: "vendas" as const,
    },
    {
      title: "Pan Assistant",
      href: "/pan-assistant",
      icon: Bot,
      feature: "panAssistant" as const,
      badge:
        planLevel === "start"
          ? 1
          : planLevel === "pro" || planLevel === "business"
            ? 3
            : planLevel === "enterprise" || planLevel === "premium"
              ? "Ilimitado"
              : 0,
    },
    {
      title: "Integrações",
      href: "/integracoes",
      icon: Puzzle,
      feature: "integracoes" as const,
    },
    {
      title: "Notificações",
      href: "/notificacoes",
      icon: Bell,
      feature: "notificacoes" as const,
    },
    {
      title: "Clientes Próximos",
      href: "/clientes-proximos",
      icon: MapPin,
      feature: "clientesProximos" as const,
    },
    {
      title: "Sinalização Visual",
      href: "/sinalizacao-visual",
      icon: Eye,
      feature: "sinalizacaoVisual" as const,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
      feature: "analytics" as const,
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: Users,
      feature: "clientes" as const,
    },
    {
      title: "Campanhas",
      href: "/campanhas",
      icon: Megaphone,
      feature: "campanhas" as const,
    },
    {
      title: "Suporte",
      href: "/suporte",
      icon: HelpCircle,
      feature: "suporte" as const,
    },
  ]

  // Filter menu items based on the user's plan
  const visibleMenuItems = menuItems.filter((item) => item.feature === null || hasFeature(item.feature))

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // If still loading, show a simplified sidebar
  if (isLoading) {
    return (
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-4 py-2">
            <h1 className="text-lg font-bold">FletoAds</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-bold">FletoAds</h1>
          <Badge variant="outline" className="ml-2">
            {planName}
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Alternar tema</span>
            </Button>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/suporte">
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Ajuda</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Perfil</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {session?.user?.nome?.charAt(0) || "U"}
                  </div>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session?.user?.nome || "Usuário"}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email || ""}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/configuracoes">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

