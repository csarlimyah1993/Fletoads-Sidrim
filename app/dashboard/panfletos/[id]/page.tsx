import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PanfletoDetails } from "@/components/panfletos/panfleto-details"
import { getPanfletoById } from "@/lib/panfletos"

interface PanfletoPageProps {
  params: Promise<{ id: string }>
}

export default async function PanfletoPage({ params }: PanfletoPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/panfletos")
  }

  const { id } = await params
  const panfleto = await getPanfletoById(id)

  return (
    <div className="container mx-auto py-8">
      <PanfletoDetails panfleto={panfleto} />
    </div>
  )
}
