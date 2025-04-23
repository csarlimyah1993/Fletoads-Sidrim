"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function SessionDiagnostic() {
  const { data: sessionData, status, update } = useSession()
  const [mounted, setMounted] = useState(false)
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    setCookies(document.cookie.split(";").map((c) => c.trim()))
  }, [])

  if (!mounted) return null

  // Extract user data safely regardless of structure
  const session = sessionData as any // Use type assertion to avoid TypeScript errors
  const user = session?.user || (session?.session?.user as any)

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs overflow-auto max-h-60">
      <h3 className="font-bold mb-2">Session Diagnostic</h3>
      <p>Status: {status}</p>
      <p>
        <strong>Email:</strong> {user?.email || "N/A"}
      </p>
      <p>
        <strong>Name:</strong> {user?.name || user?.nome || "N/A"}
      </p>
      <p>
        <strong>Role:</strong> {user?.role || "N/A"}
      </p>
      <p>
        <strong>TipoUsuario:</strong> {user?.tipoUsuario || "N/A"}
      </p>

      <div className="mt-2">
        <h4 className="font-semibold">Cookies:</h4>
        <ul className="mt-1 space-y-1">
          {cookies.map((cookie, i) => (
            <li key={i} className="truncate">
              {cookie}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 flex gap-2">
        <Button onClick={() => update()} size="sm" variant="outline" className="text-xs h-7">
          Atualizar Sessão
        </Button>
        <Button
          onClick={() => {
            document.cookie.split(";").forEach((cookie) => {
              const [name] = cookie.trim().split("=")
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
            })
            window.location.href = "/login"
          }}
          size="sm"
          variant="destructive"
          className="text-xs h-7"
        >
          Limpar Cookies
        </Button>
      </div>
      <div className="mt-2">
        <h4 className="font-semibold">Raw Session Data:</h4>
        <pre className="mt-1 text-xs overflow-auto max-h-40">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  )
}
