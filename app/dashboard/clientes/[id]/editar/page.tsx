// NÃO USE "use client" aqui
import EditarClienteClient from "@/components/editar-client-client"

interface PageProps {
  params: { id: string }
}

export default function EditarClientePage({ params }: PageProps) {
  return <EditarClienteClient clienteId={params.id} />
}
