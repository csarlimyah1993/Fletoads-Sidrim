"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react"

export default function RepairSessionPage() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [serverSession, setServerSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie.split(";").map((c) => c.trim()))

    // Check server session
    checkServerSession()
  }, [])

  const checkServerSession = async () => {
    try {
      setLoading(true)
      setMessage("Checking server session...")

      const res = await fetch("/api/auth/debug-session")
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      setServerSession(data)

      setMessage(
        data.sessionExists
          ? "Server session found. You can try refreshing the client session."
          : "No server session found. You may need to log in again.",
      )
    } catch (error) {
      setMessage(`Error checking server session: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setLoading(true)
      setMessage("Refreshing session...")

      await update()

      setMessage("Session refreshed. Check if your user data appears now.")
    } catch (error) {
      setMessage(`Error refreshing session: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const clearAllCookies = () => {
    try {
      setLoading(true)
      setMessage("Clearing all cookies...")

      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      })

      setMessage("All cookies cleared. You will be redirected to login page in 3 seconds...")

      setTimeout(() => {
        window.location.href = "/login"
      }, 3000)
    } catch (error) {
      setMessage(`Error clearing cookies: ${error instanceof Error ? error.message : String(error)}`)
      setLoading(false)
    }
  }

  const logoutAndRedirect = async () => {
    try {
      setLoading(true)
      setMessage("Logging out...")

      await signOut({ redirect: false })

      setMessage("Logged out successfully. Redirecting to login page...")

      setTimeout(() => {
        window.location.href = "/login"
      }, 1500)
    } catch (error) {
      setMessage(`Error during logout: ${error instanceof Error ? error.message : String(error)}`)
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Session Repair Tool</CardTitle>
          <CardDescription>Use this tool to diagnose and fix session-related issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Session Status */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Session Status</h3>
            <div className="p-4 bg-muted rounded-md">
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
          </div>

          {/* Server Session */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Server Session</h3>
            <div className="p-4 bg-muted rounded-md max-h-40 overflow-auto">
              {serverSession ? (
                <pre className="text-xs">{JSON.stringify(serverSession, null, 2)}</pre>
              ) : (
                <p className="text-muted-foreground">No server session data available</p>
              )}
            </div>
          </div>

          {/* Cookies */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Cookies</h3>
            <div className="p-4 bg-muted rounded-md max-h-40 overflow-auto">
              {cookies.length > 0 ? (
                <ul className="space-y-1">
                  {cookies.map((cookie, i) => (
                    <li key={i} className="text-xs">
                      {cookie}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No cookies found</p>
              )}
            </div>
          </div>

          {/* Status Message */}
          {message && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Status</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex flex-wrap gap-2 w-full">
            <Button onClick={checkServerSession} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Check Server Session
            </Button>
            <Button onClick={refreshSession} disabled={loading} className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh Client Session
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            <Button onClick={logoutAndRedirect} disabled={loading} variant="outline" className="flex-1">
              Logout & Redirect
            </Button>
            <Button onClick={clearAllCookies} disabled={loading} variant="destructive" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Cookies
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
