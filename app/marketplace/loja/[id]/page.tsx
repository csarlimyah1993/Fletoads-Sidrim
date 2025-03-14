import { Header } from "@/components/header"
import { LojaDetalheContent } from "@/components/loja-detalhe-content"

export default function LojaDetalhePage({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <div className="p-4 md:p-6 lg:p-8">
        <LojaDetalheContent id={params.id} />
      </div>
    </>
  )
}

