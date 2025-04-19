import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Novo Panfleto | FletoAds",
  description: "Crie um novo panfleto digital",
}

export default async function NovoPanfletoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Novo Panfleto" />
      <div className="container py-6">
        <PanfletoForm />
      </div>
    </div>
  )
}

