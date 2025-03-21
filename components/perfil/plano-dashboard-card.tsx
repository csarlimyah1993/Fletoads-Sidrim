import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { ArrowRight, Check } from "lucide-react"

export function PlanoDashboardCard() {
  const { planName, planLevel, features, isFreePlan } = usePlanFeatures()

  // Função para determinar a cor do plano
  const getPlanColor = () => {
    switch (planLevel) {
      case "free":
        return "bg-gray-100 dark:bg-gray-800"
      case "basic":
        return "bg-blue-100 dark:bg-blue-900"
      case "pro":
        return "bg-purple-100 dark:bg-purple-900"
      case "enterprise":
        return "bg-amber-100 dark:bg-amber-900"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader className={`${getPlanColor()} rounded-t-lg`}>
        <CardTitle className="text-lg">Seu Plano</CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground">{planName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      {isFreePlan && (
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="/planos">
              Fazer upgrade
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

