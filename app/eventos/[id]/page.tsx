import { EventoDetalhes } from "@/components/evento-detalhes"

export default function EventoDetalhesPage({ params }) {
  return <EventoDetalhes id={params.id} />
}

