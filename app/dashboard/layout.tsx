import type { Metadata } from "next"
import type React from "react"
import { UserNav } from "@/components/user-nav"
import { Notificacoes } from "@/components/notificacoes"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { ModeToggle } from "@/components/mode-toggle"

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
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">FletoAds</h1>
          </div>
          <div className="flex items-center gap-4">
            <Notificacoes />
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-col overflow-hidden pt-4">{children}</main>
      </div>
    </div>
  )
}

