import type { Metadata } from "next"
import type React from "react"
import { UserNav } from "@/components/user-nav"
import { Notificacoes } from "@/components/notificacoes"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { SidebarToggleScript } from "@/components/sidebar-toggle-script"

export const metadata: Metadata = {
  title: "Dashboard - FletoAds",
  description: "Painel de controle da plataforma FletoAds",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SidebarToggleScript />
      <Sidebar />
      <div
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out ml-[70px] md:ml-64"
        id="main-content"
      >
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-16 items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Notificacoes />
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
