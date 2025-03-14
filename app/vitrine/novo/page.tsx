import { Header } from "@/components/header"
import { AdicionarProdutoContent } from "@/components/adicionar-produto-content"

export default function NovoProdutoPage() {
  console.log("Renderizando página NovoProdutoPage")
  return (
    <>
      <Header />
      <div className="p-4">
        <AdicionarProdutoContent />
      </div>
    </>
  )
}

