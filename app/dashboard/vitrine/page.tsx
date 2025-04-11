import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import VitrineClientPage from "./VitrineClientPage"

export const dynamic = "force-dynamic"

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/vitrine")
  }

  // Buscar dados da loja e vitrine do usuário
  const fetchLoja = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/loja`, {
        cache: "no-store",
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar loja:", error)
      return null
    }
  }

  const fetchVitrine = async (lojaId: string) => {
    if (!lojaId) return null

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/vitrines?lojaId=${lojaId}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.length > 0 ? data[0] : null
    } catch (error) {
      console.error("Erro ao buscar vitrine:", error)
      return null
    }
  }

  const loja = await fetchLoja()
  const vitrine = loja ? await fetchVitrine(loja._id) : null

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Vitrine Online</h1>
      <VitrineClientPage loja={loja} vitrine={vitrine} />
    </div>
  )
}
