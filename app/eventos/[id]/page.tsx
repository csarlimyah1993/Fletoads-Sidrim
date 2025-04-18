import { EventoDetalhes } from "@/components/evento-detalhes"

// Define the type for the params object
interface PageParams {
  id: string
}

export default async function EventoDetalhesPage({ params }: { params: Promise<PageParams> }) {
  // Await the params Promise to get the actual params object
  const resolvedParams = await params

  return <EventoDetalhes id={resolvedParams.id} />
}
