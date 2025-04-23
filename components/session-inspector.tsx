"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function SessionInspector() {
  const { data, status, update } = useSession()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    console.log("SessionInspector - Full session data:", data)
  }, [data])

  if (!mounted) return null

  // Extract user data safely regardless of structure
  const sessionData = data as any // Use type assertion to avoid TypeScript errors
  const user = sessionData?.user || sessionData?.session?.user
  const email = user?.email
  const name = user?.name || user?.nome
  const role = user?.role
  const tipoUsuario = user?.tipoUsuario

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Session Inspector</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white" onClick={() => setExpanded(!expanded)}>
          {expanded ? "−" : "+"}
        </Button>
      </div>

      <div className="space-y-1">
        <p>
          <strong>Status:</strong> {status}
        </p>
        <p>
          <strong>Email:</strong> {email || "N/A"}
        </p>
        <p>
          <strong>Name:</strong> {name || "N/A"}
        </p>
        <p>
          <strong>Role:</strong> {role || "N/A"}
        </p>
        <p>
          <strong>TipoUsuario:</strong> {tipoUsuario || "N/A"}
        </p>
      </div>

      {expanded && (
        <>
          <div className="mt-2">
            <h4 className="font-semibold">Raw Session Data:</h4>
            <pre className="mt-1 text-xs overflow-auto max-h-40">{JSON.stringify(data, null, 2)}</pre>
          </div>

          <div className="mt-2">
            <Button onClick={() => update()} size="sm" variant="outline" className="text-xs h-7 w-full">
              Refresh Session
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
