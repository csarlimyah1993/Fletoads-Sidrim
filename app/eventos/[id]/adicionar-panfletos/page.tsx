import { Header } from "@/components/header"
import { AdicionarPanfletosEvento } from "@/components/adicionar-panfletos-evento"

// Define the type for the params object
interface PageParams {
  id: string
  // Add any other route parameters if needed
}

export default async function AdicionarPanfletosEventoPage({ params }: { params: Promise<PageParams> }) {
  // Await the params Promise to get the actual params object
  const resolvedParams = await params

  return (
    <>
      <Header />
      <AdicionarPanfletosEvento eventoId={resolvedParams.id} />
    </>
  )
}
