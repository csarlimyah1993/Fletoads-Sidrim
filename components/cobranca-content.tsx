"use client"

import { useState } from "react"
import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function CobrancaContent() {
  // Add state for sidebar open/close functionality
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Editor de Checkout</h1>
          <p className="text-gray-500 mb-6">Personalize a experiência de checkout para seus clientes.</p>

          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-500">Editor de checkout em desenvolvimento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
