"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Changed from next/router to next/navigation

const VitrineGerenciamentoContent = () => {
  const [activeTab, setActiveTab] = useState<"produtos" | "panfletos" | "cupons" | "hotpromo">("produtos")
  const router = useRouter()

  const handleTabChange = (tab: "produtos" | "panfletos" | "cupons" | "hotpromo") => {
    setActiveTab(tab)
  }

  const handleEditItem = (id: number) => {
    switch (activeTab) {
      case "produtos":
        router.push(`/vitrine/${id}/configuracoes`)
        break
      case "panfletos":
        router.push(`/panfletos/${id}/editar`)
        break
      case "cupons":
        // Implementar rota para editar cupom
        console.log(`Editar cupom ${id}`)
        break
      case "hotpromo":
        // Implementar rota para editar hotpromo
        console.log(`Editar hotpromo ${id}`)
        break
    }
  }

  const handleDeleteItem = (id: number) => {
    console.log(`Excluir item ${id} da aba ${activeTab}`)
    // Implementar lógica de exclusão
  }

  return (
    <div>
      <div>
        <button onClick={() => handleTabChange("produtos")}>Produtos</button>
        <button onClick={() => handleTabChange("panfletos")}>Panfletos</button>
        <button onClick={() => handleTabChange("cupons")}>Cupons</button>
        <button onClick={() => handleTabChange("hotpromo")}>Hotpromo</button>
      </div>

      <div>
        {activeTab === "produtos" && (
          <div>
            <h2>Produtos</h2>
            <button onClick={() => handleEditItem(1)}>Editar Produto 1</button>
            <button onClick={() => handleDeleteItem(1)}>Excluir Produto 1</button>
          </div>
        )}
        {activeTab === "panfletos" && (
          <div>
            <h2>Panfletos</h2>
            <button onClick={() => handleEditItem(1)}>Editar Panfleto 1</button>
            <button onClick={() => handleDeleteItem(1)}>Excluir Panfleto 1</button>
          </div>
        )}
        {activeTab === "cupons" && (
          <div>
            <h2>Cupons</h2>
            <button onClick={() => handleEditItem(1)}>Editar Cupom 1</button>
            <button onClick={() => handleDeleteItem(1)}>Excluir Cupom 1</button>
          </div>
        )}
        {activeTab === "hotpromo" && (
          <div>
            <h2>Hotpromo</h2>
            <button onClick={() => handleEditItem(1)}>Editar Hotpromo 1</button>
            <button onClick={() => handleDeleteItem(1)}>Excluir Hotpromo 1</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VitrineGerenciamentoContent