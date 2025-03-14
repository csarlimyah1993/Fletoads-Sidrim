import { Header } from "@/components/header"
import { ConfiguracoesProdutoContent } from "@/components/configuracoes-produto-content"

export default function ConfiguracoesProdutoPage({ params }) {
  return (
    <>
      <Header />
      <div className="p-4">
        <ConfiguracoesProdutoContent id={params.id} />
      </div>
    </>
  )
}

