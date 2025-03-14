import { Header } from "@/components/header"
import { AdicionarProdutoContent } from "@/components/adicionar-produto-content"

export default function AdicionarProdutoPage() {
  console.log("Renderizando página AdicionarProdutoPage")
  return (
    <>
      <Header />
      <div className="p-4">
        <AdicionarProdutoContent />
      </div>
    </>
  )
}

