import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import VitrineClientPage from "./VitrineClientPage"

export const dynamic = "force-dynamic"

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/vitrine")
  }

  console.log("Session in vitrine page:", {
    userId: session?.user?.id,
    userEmail: session?.user?.email,
  })

  // Buscar dados da loja e vitrine do usuário
  const fetchLoja = async () => {
    try {
      // Use absolute URL with proper environment variable
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "http://localhost:3000"

      // Add the user ID directly in the URL to ensure it's passed correctly
      const userId = session?.user?.id
      console.log("Fetching loja with userId:", userId)

      const response = await fetch(`${baseUrl}/api/loja?userId=${userId}`, {
        cache: "no-store",
        // Don't use cookies() here since it's causing issues
        // Just rely on the userId in the query parameter
      })

      if (!response.ok) {
        console.error(`Erro ao buscar loja: ${response.status} ${response.statusText}`)
        return null
      }

      const data = await response.json()
      return data.loja
    } catch (error) {
      console.error("Erro ao buscar loja:", error)
      return null
    }
  }

  const fetchVitrine = async (lojaId: string) => {
    if (!lojaId) return null

    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || "http://localhost:3000"

      const response = await fetch(`${baseUrl}/api/vitrines?lojaId=${lojaId}`, {
        cache: "no-store",
        // Don't use cookies() here since it's causing issues
        // Just rely on the lojaId in the query parameter
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
