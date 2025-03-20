"use client"

import { motion } from "framer-motion"

export function PlanosHeader() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-16 md:py-24">
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.h1
          className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Planos FletoAds
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-lg text-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Escolha o plano ideal para o seu negócio e comece a crescer com o FletoAds. Todos os planos incluem suporte
          técnico e atualizações gratuitas.
        </motion.p>
      </div>
    </div>
  )
}

