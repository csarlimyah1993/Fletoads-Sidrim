"use client"

import type React from "react"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { UserSidebar } from "@/components/user-sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export function SidebarContainer({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  if (!session) {
    return <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900">{children}</div>
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-900">
        {isAdmin ? <AdminSidebar /> : <UserSidebar />}
        <SidebarInset className="w-full">
          <main className="p-6 w-full">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
