"use client"

import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function CuponsContent() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Cupons de Retenção</h1>
          <p className="text-gray-500 mb-6">Crie e gerencie cupons de desconto para aumentar a retenção de clientes.</p>

          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-500">Gerenciador de cupons em desenvolvimento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

