import type React from "react"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DatabaseError } from "@/components/ui/database-error"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-1">
        <div className="container py-4">
          <DatabaseError />
          {children}
        </div>
      </main>
    </div>
  )
}

