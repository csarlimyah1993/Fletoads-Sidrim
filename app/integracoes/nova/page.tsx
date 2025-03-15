"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NovaIntegracaoRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/integracoes/nova")
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecionando...</p>
    </div>
  )
}

