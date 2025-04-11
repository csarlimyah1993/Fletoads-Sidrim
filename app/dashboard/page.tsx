import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Extrair o nome do usuário da sessão
  const userName = session.user?.name || session.user?.email?.split("@")[0] || "Usuário"

  return <DashboardContent userName={userName} />
}
