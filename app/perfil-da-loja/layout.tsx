import type React from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NewSidebar } from "@/components/new-sidebar"

export default async function PerfilDaLojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <NewSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

