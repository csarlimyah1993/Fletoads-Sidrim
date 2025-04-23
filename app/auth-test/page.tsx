"use client"

import { BasicAuthMenu } from "@/components/basic-auth-menu"

export default function AuthTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>

      <div className="p-4 border rounded-md mb-6">
        <h2 className="text-lg font-medium mb-4">Basic Auth Menu Component</h2>
        <div className="flex justify-center">
          <BasicAuthMenu />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        This page demonstrates the BasicAuthMenu component, which simply checks if a session exists and renders either a
        user menu with logout button or a login button.
      </p>
    </div>
  )
}
