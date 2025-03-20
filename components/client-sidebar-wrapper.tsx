"use client"

import { useSession } from "next-auth/react"
import UserSidebar from "@/components/user-sidebar"
import AdminSidebar from "@/components/admin/admin-sidebar"

export function ClientSidebarWrapper() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"

  if (!session) {
    return null
  }

  return isAdmin ? <AdminSidebar /> : <UserSidebar />
}

