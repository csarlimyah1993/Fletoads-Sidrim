"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function UserProfileTest() {
  const { data: session, status, update } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("UserProfileTest - Session:", session)
    console.log("UserProfileTest - Status:", status)
  }, [session, status])

  if (!mounted) return null

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-lg font-bold mb-2">User Profile Test</h2>
      <div className="space-y-2 mb-4">
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Email:</strong> {session?.user?.email || "N/A"}
        </p>
        <p>
          <strong>Name:</strong> {session?.user?.name || "N/A"}
        </p>
        <p>
          <strong>Role:</strong> {session?.user?.role || "N/A"}
        </p>
        <p>
          <strong>Tipo Usuário:</strong> {session?.user?.tipoUsuario || "N/A"}
        </p>
      </div>
      <Button onClick={() => update()} size="sm">
        Refresh Session
      </Button>
    </div>
  )
}
