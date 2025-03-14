"use client"

import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function OfertasContent() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Gerenciador de Ofertas</h1>
          <p className="text-gray-500 mb-6">Gerencie todas as suas ofertas e produtos disponíveis na sua vitrine.</p>

          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-500">Conteúdo do gerenciador de ofertas em desenvolvimento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

