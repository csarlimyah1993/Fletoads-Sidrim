import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CupomForm } from "@/components/cupons/cupom-form"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditarCupomPage({ params }: PageProps) {
  const { id } = await params

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { db } = await connectToDatabase()

  const cupom = await db.collection("cupons").findOne({
    _id: new ObjectId(id),
    lojaId: session.user.lojaId,
  })

  if (!cupom) {
    redirect("/dashboard/cupons")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Editar Cupom</h2>
      </div>
      <div className="grid gap-4">
        <CupomForm cupom={cupom} />
      </div>
    </div>
  )
}
