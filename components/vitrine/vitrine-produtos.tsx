"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { VitrineProdutosProps } from "@/types/vitrine"

const VitrineProdutos: React.FC<VitrineProdutosProps> = ({
  loja,
  config,
  produtos,
  categorias,
  categoriaAtiva,
  setCategoriaAtiva,
  favoritos,
  toggleFavorito,
}) => {
  // Fix the useState line to use optional chaining
  const [layout, setLayout] = useState(config?.layout || "padrao")

  useEffect(() => {
    // You can add logic here to handle layout changes or other side effects
    console.log("Vitrine layout:", layout)
  }, [layout])

  const handleLayoutChange = (newLayout: string) => {
    setLayout(newLayout)
  }

  return (
    <div>
      <h2>Vitrine de Produtos</h2>
      <p>Layout: {layout}</p>
      <button onClick={() => handleLayoutChange("padrao")}>Layout Padrão</button>
      <button onClick={() => handleLayoutChange("alternativo")}>Layout Alternativo</button>

      <div className="product-list">
        {produtos.map((produto) => (
          <div key={produto._id} className="product-item">
            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>
            <p>Preço: R${produto.preco}</p>
            {/* Add more product details here */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default VitrineProdutos
