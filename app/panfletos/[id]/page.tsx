import { PanfletoDetalhes } from "@/components/panfleto-detalhes"

// Define the type for the params object
interface PageParams {
  id: string
}

export default async function PanfletoDetalhesPage({ params }: { params: Promise<PageParams> }) {
  // Await the params Promise to get the actual params object
  const resolvedParams = await params

  return <PanfletoDetalhes id={resolvedParams.id} />
}
