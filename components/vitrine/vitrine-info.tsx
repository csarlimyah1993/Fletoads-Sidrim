import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone, Mail, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"
import { isDiaAtual, isLojaAbertaAgora } from "@/lib/vitrine-utils"

interface VitrineInfoProps {
  loja: Loja
  config?: VitrineConfig
}

interface HorarioFuncionamento {
  [key: string]:
    | {
        aberto?: boolean
        horaAbertura?: string
        horaFechamento?: string
      }
    | undefined
}

export function VitrineInfo({ loja, config }: VitrineInfoProps) {
  const isAberto = loja.horarioFuncionamento ? isLojaAbertaAgora(loja.horarioFuncionamento) : false

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Informações básicas */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{loja.nome}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{loja.descricao}</p>

                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant={isAberto ? "default" : "outline"}
                    className={cn(
                      "px-2 py-1 text-xs font-medium",
                      isAberto ? "bg-green-500 hover:bg-green-600" : "text-red-500 border-red-500",
                    )}
                  >
                    {isAberto ? "Aberto agora" : "Fechado"}
                  </Badge>
                </div>
              </div>

              {/* Contato e endereço */}
              {(config?.mostrarContato || config?.mostrarEndereco) && (
                <div className="flex-1">
                  {config?.mostrarEndereco && loja.endereco && (
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm">
                          {loja.endereco.rua}, {loja.endereco.numero}
                          {loja.endereco.complemento && `, ${loja.endereco.complemento}`}
                        </p>
                        <p className="text-sm">
                          {loja.endereco.bairro}, {loja.endereco.cidade} - {loja.endereco.estado}
                        </p>
                        <p className="text-sm">{loja.endereco.cep}</p>
                      </div>
                    </div>
                  )}

                  {config?.mostrarContato && loja.contato && (
                    <>
                      {loja.contato.telefone && (
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{loja.contato.telefone}</span>
                        </div>
                      )}

                      {loja.contato.email && (
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{loja.contato.email}</span>
                        </div>
                      )}

                      {loja.contato.site && (
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <a
                            href={loja.contato.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {loja.contato.site.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Horários de funcionamento */}
              {config?.mostrarHorarios && loja.horarioFuncionamento && (
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Horários de Funcionamento
                  </h3>

                  <div className="grid grid-cols-1 gap-1 text-sm">
                    {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia) => {
                      const diaFormatado =
                        dia === "terca" ? "terça" : dia === "sabado" ? "sábado" : dia === "domingo" ? "domingo" : dia

                      const horario = loja.horarioFuncionamento
                        ? (loja.horarioFuncionamento as HorarioFuncionamento)[dia]
                        : undefined
                      const isHoje = isDiaAtual(dia)

                      return (
                        <div key={dia} className={cn("flex justify-between py-0.5", isHoje && "font-medium")}>
                          <span className={isHoje ? "text-primary" : ""}>
                            {diaFormatado.charAt(0).toUpperCase() + diaFormatado.slice(1)}
                            {isHoje && " (hoje)"}
                          </span>
                          <span>
                            {horario && horario.aberto
                              ? `${horario.horaAbertura} - ${horario.horaFechamento}`
                              : "Fechado"}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
