"use client"

import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeBannerProps {
  requiredFeature: string
  featureTitle: string
}

export function UpgradeBanner({ requiredFeature, featureTitle }: UpgradeBannerProps) {
  const { hasFeature, planLevel } = usePlanFeatures()
  const router = useRouter()

  // If the user has the feature, don't show the banner
  if (hasFeature(requiredFeature as any)) {
    return null
  }

  // Determine which plan they need to upgrade to
  let targetPlan = "Start"
  if (planLevel === "free") {
    targetPlan = "Start"
  } else if (planLevel === "start") {
    targetPlan = "Pro/Business"
  } else if (planLevel === "pro" || planLevel === "business") {
    targetPlan = "Enterprise/Premium"
  }

  return (
    <Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20">
      <AlertTitle>Funcionalidade não disponível no seu plano atual</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          Para acessar <span className="font-bold">{featureTitle}</span>, você precisa fazer upgrade para o plano{" "}
          {targetPlan}.
        </div>
        <Button onClick={() => router.push("/planos")} className="sm:flex-shrink-0">
          Ver planos
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

