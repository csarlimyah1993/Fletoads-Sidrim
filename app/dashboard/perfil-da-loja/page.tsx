"use client"

import { CriarLojaForm } from "@/components/perfil/criar-loja-form"
import { useSession } from "next-auth/react"

export default function CriarPerfilDaLojaPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id || ""

  return (
    <div className="container mx-auto py-8">
      <CriarLojaForm userId={userId} />
    </div>
  )
}

