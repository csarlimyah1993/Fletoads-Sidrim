"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugSession() {
  const { data: session, status, update } = useSession()
  const [serverSession, setServerSession] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkServerSession = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use a timestamp to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/auth/session?t=${timestamp}`)

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setServerSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Session Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Client Session Status: {status}</h3>
          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button onClick={checkServerSession} disabled={loading} size="sm">
            {loading ? "Checking..." : "Check Server Session"}
          </Button>
          <Button onClick={() => update()} size="sm" variant="outline">
            Refresh Session
          </Button>
        </div>

        {error && <div className="p-2 bg-destructive/10 text-destructive rounded-md text-sm">Error: {error}</div>}

        {serverSession && (
          <div>
            <h3 className="font-medium mb-2">Server Session:</h3>
            <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
              {JSON.stringify(serverSession, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
