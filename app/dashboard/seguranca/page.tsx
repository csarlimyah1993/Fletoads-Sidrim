import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import  SecuritySettings  from "@/components/security-settings"

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Segurança da Conta</h1>
      <SecuritySettings />
    </div>
  )
}
