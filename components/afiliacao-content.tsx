"use client"

import { useState } from "react"
import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function AfiliacaoContent() {
  // Add state for sidebar open/close functionality
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Programa de Afiliação</h1>
          <p className="text-gray-500 mb-6">
            Configure seu programa de afiliados para marketing e revenda de seus produtos.
          </p>

          <div className="bg-white p-8 rounded-lg border text-center">
            <p className="text-gray-500">Gerenciador de afiliação em desenvolvimento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
