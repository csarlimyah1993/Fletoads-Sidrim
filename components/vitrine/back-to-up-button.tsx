"use client"

import { ChevronUp } from "lucide-react"
import { motion } from "framer-motion"
import type { VitrineConfig } from "@/types/vitrine"

interface BackToTopButtonProps {
  config?: VitrineConfig
}

export function BackToTopButton({ config }: BackToTopButtonProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-50"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      style={{
        backgroundColor: config?.corPrimaria || "#3b82f6",
        color: config?.corTexto || "#ffffff",
      }}
    >
      <ChevronUp className="h-6 w-6" />
    </motion.button>
  )
}
