import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import IntegracaoConfigClient from "./integracao-config-client"

export default async function IntegracaoConfigPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params to get the id
  const { id } = await params

  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <IntegracaoConfigClient integracaoId={id} />
    </Suspense>
  )
}
