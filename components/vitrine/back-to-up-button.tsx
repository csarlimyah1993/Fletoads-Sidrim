"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"
import type { BackToTopButtonProps } from "@/types/vitrine"

export function BackToTopButton({ config }: BackToTopButtonProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        size="icon"
        className="rounded-full shadow-lg h-12 w-12"
        onClick={scrollToTop}
        style={{
          backgroundColor: config.corPrimaria || "#3b82f6",
          color: config.corTexto || "#ffffff",
        }}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </motion.div>
  )
}
