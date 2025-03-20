"use client"

import type * as React from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  BarChart3,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Store,
  User,
  Bot,
  Zap,
  Plug,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toogle"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function NewSidebar({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const { features, planName } = usePlanFeatures()
  const pathname = usePathname()

  const getPlanBadgeColor = () => {
    switch (planName) {
      case "Gratuito":
        return "bg-gray-500 hover:bg-gray-600"
      case "Básico":
        return "bg-blue-500 hover:bg-blue-600"
      case "Profissional":
        return "bg-violet-500 hover:bg-violet-600"
      case "Empresarial":
        return "bg-amber-500 hover:bg-amber-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Store className="h-6 w-6" />
            <span className="font-bold text-xl">FletoAds</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/vendas")}>
                    <Link href="/vendas">
                      <BarChart3 className="h-4 w-4" />
                      <span>Vendas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/produtos")}>
                    <Link href="/produtos">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Produtos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/panfletos")}>
                    <Link href="/panfletos">
                      <FileText className="h-4 w-4" />
                      <span>Panfletos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/perfil-da-loja")}>
                    <Link href="/perfil-da-loja">
                      <Store className="h-4 w-4" />
                      <span>Perfil da Loja</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {(features.panAssistant || features.hotPromos || features.integracoes) && (
            <SidebarGroup>
              <SidebarGroupLabel>Recursos Premium</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {features.panAssistant && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/pan-assistant")}>
                        <Link href="/pan-assistant">
                          <Bot className="h-4 w-4" />
                          <span>Pan Assistant</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {features.hotPromos && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/hot-promos")}>
                        <Link href="/hot-promos">
                          <Zap className="h-4 w-4" />
                          <span>Hot Promos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {features.integracoes && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/integracoes")}>
                        <Link href="/integracoes">
                          <Plug className="h-4 w-4" />
                          <span>Integrações</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/ajuda">
                  <HelpCircle className="h-4 w-4" />
                  <span>Ajuda</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-2 py-1.5">
                <ModeToggle />
                <Badge className={getPlanBadgeColor()}>Plano {planName}</Badge>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback>{session?.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{session?.user?.name || "Usuário"}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/configuracoes">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/planos">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Planos</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="w-full">{children}</SidebarInset>
    </SidebarProvider>
  )
}

