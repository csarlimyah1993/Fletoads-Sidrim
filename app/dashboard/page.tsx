import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/auth"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userName = session.user?.name || session.user?.email?.split("@")[0] || "Usuário"
  const plan = session.user?.plano || "gratuito"

  const planExpiresAt = undefined

  return <DashboardContent userName={userName} plan={plan} planExpiresAt={planExpiresAt} />
}
