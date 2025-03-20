"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminDiagnosticPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setStatus("loading")
        setMessage("Checking database connection...")

        // Step 1: Check database connection
        const dbResponse = await fetch("/api/admin-diagnostic/check-db")
        const dbData = await dbResponse.json()
        setDbInfo(dbData)

        if (!dbData.connected) {
          setStatus("error")
          setMessage("Database connection failed")
          return
        }

        setMessage("Checking admin user...")

        // Step 2: Check if admin user exists
        const adminResponse = await fetch("/api/admin-diagnostic/check-admin")
        const adminData = await adminResponse.json()
        setAdminInfo(adminData)

        if (!adminData.exists) {
          setMessage("Creating admin user...")

          // Step 3: Create admin user if it doesn't exist
          const createResponse = await fetch("/api/admin-diagnostic/create-admin", {
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

          const createData = await createResponse.json()
          setCreateResult(createData)

          if (createData.success) {
            setStatus("success")
            setMessage("Admin user created successfully")
          } else {
            setStatus("error")
            setMessage("Failed to create admin user")
          }
        } else {
          // Step 4: Verify admin password
          setMessage("Verifying admin password...")

          const verifyResponse = await fetch("/api/admin-diagnostic/verify-password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "adminfletoads@gmail.com",
              password: "kkZMk411WDkv",
            }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.valid) {
            setStatus("success")
            setMessage("Admin user exists and password is valid")
          } else {
            setMessage("Resetting admin password...")

            // Step 5: Reset admin password if verification fails
            const resetResponse = await fetch("/api/admin-diagnostic/reset-password", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: "adminfletoads@gmail.com",
                password: "kkZMk411WDkv",
              }),
            })

            const resetData = await resetResponse.json()

            if (resetData.success) {
              setStatus("success")
              setMessage("Admin password reset successfully")
            } else {
              setStatus("error")
              setMessage("Failed to reset admin password")
            }
          }
        }
      } catch (error) {
        console.error("Diagnostic error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during diagnostics")
      }
    }

    runDiagnostics()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin User Diagnostic</CardTitle>
          <CardDescription>Checking and fixing admin user configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p>
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
            </Alert>
          )}

          {status !== "loading" && (
            <div className="mt-6 space-y-6">
              <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="font-medium">Database Information:</h3>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                  {JSON.stringify(dbInfo, null, 2)}
                </pre>
              </div>

              <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="font-medium">Admin User Information:</h3>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                  {JSON.stringify(adminInfo, null, 2)}
                </pre>
              </div>

              {createResult && (
                <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                  <h3 className="font-medium">Admin Creation Result:</h3>
                  <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                    {JSON.stringify(createResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="rounded-md bg-gray-50 p-4 dark:bg-gray-800">
                <h3 className="font-medium">Admin Credentials:</h3>
                <p className="mt-1 text-sm">Email: adminfletoads@gmail.com</p>
                <p className="text-sm">Password: kkZMk411WDkv</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status !== "loading" && (
            <div className="flex gap-4">
              <Button onClick={() => router.push("/login")}>Go to Login</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Run Diagnostics Again
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

