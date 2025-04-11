import { PerfilDaLojaClient } from "@/components/perfil/perfil-da-loja-client"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"

export const dynamic = "force-dynamic"

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/perfil-da-loja")
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Perfil da Loja</h1>
      <PerfilDaLojaClient />
    </div>
  )
}
