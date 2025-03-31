import type React from "react"
import { NewSidebar } from "@/components/new-sidebar"
import { UserNav } from "@/components/user-nav"
import { Notificacoes } from "@/components/notificacoes"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Redirecionar para o painel de admin se o usuário for admin
  if (session.user.role === "admin") {
    redirect("/admin")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header fixo */}
      <header className="fixed top-0 z-40 w-full border-b bg-background pl-[280px]">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="hidden md:inline-block">FletoAds</span>
            <span className="hidden md:inline-block">Dashboard</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Notificacoes />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <NewSidebar />
        <div className="flex-1 pl-[280px]">
          <main className="flex-1 p-4 pt-20">{children}</main>
        </div>
      </div>
    </div>
  )
}

