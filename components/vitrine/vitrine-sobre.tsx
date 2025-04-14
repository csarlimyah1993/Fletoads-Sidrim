"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineSobreProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrineSobre({ loja, config }: VitrineSobreProps) {
  return (
    <section className="py-16 px-4 bg-secondary-foreground text-secondary">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">{config.secaoSobre?.titulo || "Sobre Nossa Loja"}</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p className="text-lg">
                {config.secaoSobre?.conteudo ||
                  loja.descricao ||
                  "Somos uma empresa comprometida com a qualidade e satisfação dos nossos clientes. Nossa missão é oferecer produtos e serviços de excelência, sempre buscando superar as expectativas."}
              </p>
              <p>
                Fundada com o propósito de trazer inovação e qualidade ao mercado, nossa loja tem se destacado pela
                excelência no atendimento e pela variedade de produtos oferecidos.
              </p>
            </div>
            <div className="mt-8">
              <Button
                style={{
                  backgroundColor: config.corPrimaria,
                  color: config.corTexto,
                }}
              >
                Saiba mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image
              src={config.secaoSobre?.imagem || loja.banner || "/placeholder.svg"}
              alt="Sobre nossa loja"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
