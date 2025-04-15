import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CuponsList } from "@/components/cupons/cupons-list"

export default async function CuponsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cupons</h2>
      </div>
      <div className="grid gap-4">
        <CuponsList />
      </div>
    </div>
  )
}
