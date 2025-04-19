import type React from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "../../lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

export const metadata: Metadata = {
  title: "Admin - FletoAds",
  description: "Painel administrativo da plataforma FletoAds",
}

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
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">FletoAds Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <AdminSidebar />
        </aside>
        <main className="flex w-full flex-col overflow-hidden pt-4">{children}</main>
      </div>
    </div>
  )
}