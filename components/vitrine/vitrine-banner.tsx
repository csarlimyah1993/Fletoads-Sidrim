"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineBannerProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrineBanner({ loja, config }: VitrineBannerProps) {
  // Determinar o estilo do banner com base no layout
  const getBannerStyle = () => {
    switch (config.layout) {
      case "moderno":
        return "h-[60vh] rounded-b-3xl overflow-hidden mx-4"
      case "minimalista":
        return "h-64 md:h-80"
      case "magazine":
        return "h-[70vh] relative"
      default:
        return "h-64 md:h-96 lg:h-[500px]"
    }
  }

  return (
    <div className={`relative w-full overflow-hidden ${getBannerStyle()}`}>
      <Image
        src={config.bannerPrincipal || loja.banner || "/placeholder.svg"}
        alt={loja.nome}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center justify-center">
        <div className="text-center text-white p-4 max-w-3xl">
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Bem-vindo à {loja.nome}
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl opacity-90 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {config.descricao || loja.descricao || "Conheça nossos produtos e serviços"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
              Ver produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
