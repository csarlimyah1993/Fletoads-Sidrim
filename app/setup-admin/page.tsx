"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupAdminPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function createAdmin() {
      try {
        // Create admin user directly from this page
        const response = await fetch("/api/setup-admin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "adminfletoads@gmail.com",
            password: "kkZMk411WDkv",
            nome: "Admin FletoAds",
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage(data.message || "Admin user created successfully")
          setDetails(data)
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to create admin user")
          setDetails(data)
        }
      } catch (error) {
        console.error("Error creating admin:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
        setDetails({ error: String(error) })
      }
    }

    createAdmin()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Setup Admin User</CardTitle>
          <CardDescription>Creating admin user for FletoAds</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-center text-sm text-muted-foreground">Creating admin user...</p>
            </div>
          )}

          {status === "success" && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20">
              <AlertDescription className="text-green-800 dark:text-green-300">{message}</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
              {details && (
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                  {JSON.stringify(details, null, 2)}
                </pre>
              )}
            </Alert>
          )}

          {status !== "loading" && (
            <div className="mt-4 rounded-md bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="font-medium">Admin Credentials:</h3>
              <p className="mt-1 text-sm">Email: adminfletoads@gmail.com</p>
              <p className="text-sm">Password: kkZMk411WDkv</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "loading" && <Button onClick={() => router.push("/login")}>Go to Login</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}

