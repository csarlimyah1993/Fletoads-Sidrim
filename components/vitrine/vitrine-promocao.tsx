"use client"

import { X } from "lucide-react"
import { useState } from "react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrinePromocaoProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrinePromocao({ loja, config }: VitrinePromocaoProps) {
  const [dismissed, setDismissed] = useState(false)

  if (!config.widgetPromocao?.ativo || dismissed) {
    return null
  }

  return (
    <div
      className="py-2 px-4 text-center relative"
      style={{
        backgroundColor: config.widgetPromocao.corFundo || "#ffedd5",
        color: config.widgetPromocao.corTexto || "#9a3412",
      }}
    >
      <p className="font-medium">
        <span className="font-bold">{config.widgetPromocao.titulo || "Promoção Especial"}</span>
        {config.widgetPromocao.descricao && ` - ${config.widgetPromocao.descricao}`}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-black/10"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
