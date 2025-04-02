import { Suspense } from "react"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EditarPerfilUsuarioPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
      </div>

      <div className="bg-card rounded-lg shadow">
        <Suspense fallback={<Skeleton className="h-[500px]" />}>
          <UsuarioPerfilForm />
        </Suspense>
      </div>
    </div>
  )
}

