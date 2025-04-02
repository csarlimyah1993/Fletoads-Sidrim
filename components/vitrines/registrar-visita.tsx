"use client"

import { useEffect } from "react"

interface RegistrarVisitaProps {
  lojaId: string
}

export function RegistrarVisita({ lojaId }: RegistrarVisitaProps) {
  useEffect(() => {
    const registrarVisita = async () => {
      try {
        // Obter token da sessão
        const token = sessionStorage.getItem("eventoToken")

        if (!token) return

        // Registrar visita
        await fetch("/api/evento/registrar-visita", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, lojaId }),
        })
      } catch (error) {
        console.error("Erro ao registrar visita:", error)
      }
    }

    registrarVisita()
  }, [lojaId])

  return null // Componente não renderiza nada
}

