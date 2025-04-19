import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletosList } from "@/components/panfletos/panfletos-list"
import { HotPromosSection } from "@/components/panfletos/hot-promos-section"
import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Panfletos | FletoAds",
  description: "Gerencie seus panfletos digitais",
}

export default async function PanfletosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Panfletos" />
      <div className="container py-6 space-y-8">
        <HotPromosSection />
        <PanfletosList />
      </div>
    </div>
  )
}

