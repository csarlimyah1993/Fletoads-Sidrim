"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function ForceSessionRefresh() {
  const { update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setMessage("Refreshing session...")

      // Force a session refresh
      await update()

      // Also fetch the server-side session for comparison
      const response = await fetch("/api/auth/debug-session")
      const data = await response.json()

      setMessage(`Session refreshed. Server session exists: ${data.sessionExists}`)

      // If there's a mismatch between client and server session, reload the page
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Session Refresh</h3>
      <Button onClick={handleRefresh} disabled={isRefreshing} size="sm" variant="outline" className="text-xs h-7">
        {isRefreshing ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Refreshing...
          </>
        ) : (
          "Force Session Refresh"
        )}
      </Button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  )
}
