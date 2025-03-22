import type React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DatabaseError } from "@/components/ui/database-error"
import { NewSidebar } from "@/components/new-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <NewSidebar />
      <main className="flex-1 ml-[80px] lg:ml-[280px]">
        <div className="container py-4">
          <DatabaseError />
          {children}
        </div>
      </main>
    </div>
  )
}

