"use client"

import type { ReactNode } from "react"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, Lock } from "lucide-react"
import Link from "next/link"

interface PlanFeaturesGateProps {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeLink?: boolean
}

export function PlanFeaturesGate({ featureId, children, fallback, showUpgradeLink = true }: PlanFeaturesGateProps) {
  const planFeatures = usePlanFeatures()

  if (planFeatures.loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (planFeatures.hasFeature(featureId)) {
    return <>{children}</>
  }

  // If no fallback is provided, show a default message
  if (!fallback) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Recurso não disponível</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Este recurso não está disponível no seu plano atual.</p>
          {showUpgradeLink && (
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link href="/planos">
                <Lock className="mr-2 h-4 w-4" />
                Ver planos disponíveis
              </Link>
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return <>{fallback}</>
}

