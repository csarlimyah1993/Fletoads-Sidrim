import { Card, CardContent } from "@/components/ui/card"
import { Truck, ShieldCheck, Award, Heart, Star, Zap, Package, Clock, Smile } from "lucide-react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"
import type { LucideIcon } from "lucide-react"

interface VitrineValoresProps {
  loja: Loja
  config?: VitrineConfig
}

interface IconMap {
  [key: string]: LucideIcon
}

export function VitrineValores({ loja, config }: VitrineValoresProps) {
  if (!config?.secaoValores?.ativo || !config.secaoValores.valores?.length) {
    return null
  }

  // Map de ícones disponíveis
  const icones: IconMap = {
    truck: Truck,
    shield: ShieldCheck,
    award: Award,
    heart: Heart,
    star: Star,
    zap: Zap,
    package: Package,
    clock: Clock,
    smile: Smile,
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">{config.secaoValores.titulo || "Nossos Valores"}</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.secaoValores.valores.map((valor, index) => {
            const IconComponent = valor.icone && icones[valor.icone] ? icones[valor.icone] : Award

            return (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{valor.titulo}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{valor.descricao}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
