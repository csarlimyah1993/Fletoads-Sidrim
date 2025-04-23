"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { SimpleUserMenu } from "@/components/simple-user-menu"

export default function SessionCheckPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Session Check Page</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">User Menu Component:</h2>
        <div className="p-4 border rounded-md inline-block">
          <SimpleUserMenu />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Session Status:</h2>
        <div className="p-4 bg-gray-100 rounded-md">
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>User:</strong> {session?.user?.name || "Not logged in"}
          </p>
          <p>
            <strong>Email:</strong> {session?.user?.email || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {session?.user?.role || "N/A"}
          </p>
          <p>
            <strong>Tipo Usuário:</strong> {session?.user?.tipoUsuario || "N/A"}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Raw Session Data:</h2>
        <pre className="p-4 bg-gray-100 rounded-md overflow-auto max-h-60 text-sm">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}
