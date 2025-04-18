"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function IntegracaoRedirect({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard/integracoes/${id}`)
  }, [router, id])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecionando...</p>
    </div>
  )
}
