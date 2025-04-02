import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Estatísticas | FletoAds",
  description: "Visualize as estatísticas do seu negócio",
}

export default function EstatisticasPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Estatísticas</h1>

      <div className="bg-card p-6 rounded-lg shadow-sm">
        <p className="text-lg text-muted-foreground">
          Estamos trabalhando na implementação das estatísticas. Em breve você poderá visualizar dados detalhados sobre
          seus panfletos, campanhas e clientes.
        </p>
      </div>
    </div>
  )
}

