"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PlanUpgradeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [planInfo, setPlanInfo] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          console.error("Erro na resposta da API:", response.status, response.statusText)
          return
        }

        const data = await response.json()
        setPlanInfo(data)

        // Verificar se deve mostrar o banner
        let shouldShow = false
        let bannerMessage = ""

        if (data.isFreeTier) {
          shouldShow = true
          bannerMessage = "Você está usando o plano gratuito com recursos limitados."
        } else if (data.limitReached?.produtos || data.limitReached?.panfletos) {
          shouldShow = true
          bannerMessage = "Você atingiu o limite do seu plano atual."
        }

        setIsVisible(shouldShow)
        setMessage(bannerMessage)
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
        setIsVisible(false)
      }
    }

    fetchUserPlan()
  }, [])

  if (!isVisible) return null

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Atualize seu plano</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {message}
        <Link href="/dashboard/planos" className="ml-0 sm:ml-2">
          <Button variant="outline" size="sm">
            Ver planos
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  )
}

