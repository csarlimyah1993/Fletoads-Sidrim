import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { PlanosSection } from "@/components/planos/planos-section"

export const metadata = {
  title: "Planos | FletoAds",
  description: "Escolha o plano ideal para o seu negócio",
}

export default async function PlanosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Planos</h1>
      <PlanosSection />
    </div>
  )
}

