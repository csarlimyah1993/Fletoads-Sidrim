"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IntegracaoRedirect({ params }: { params: { id: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/integracoes/${params.id}`)
  }, [router, params.id])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecionando...</p>
    </div>
  )
}

