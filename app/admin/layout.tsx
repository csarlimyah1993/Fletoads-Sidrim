import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { UserNav } from "@/components/user-nav"
import { Notificacoes } from "@/components/notificacoes"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header fixo */}
      <header className="fixed top-0 z-40 w-full border-b bg-background">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="hidden md:inline-block">FletoAds</span>
            <span className="hidden md:inline-block">Admin</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Notificacoes />
            <UserNav />
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        {" "}
        {/* Adicionado pt-16 para compensar o header fixo */}
        <Sidebar className="fixed z-30 hidden lg:block" />
        <div className="flex-1 lg:pl-64">
          {" "}
          {/* Ajustado para compensar a sidebar */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

