import { MapPin, Phone, Mail, Globe, Clock, Instagram, Facebook } from "lucide-react"
import type { Loja, Endereco, HorarioFuncionamento } from "@/types/loja"

interface VitrineInfoProps {
  loja: Loja
}

export function VitrineInfo({ loja }: VitrineInfoProps) {
  // Fix for "Property 'id' does not exist on type 'string'"
  const isPlanoPago = loja.plano !== "gratis"

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"

  // Format address as string
  const formatEndereco = (endereco: Endereco): string => {
    return `${endereco.rua || endereco.logradouro || ""}, ${endereco.numero || ""}, ${endereco.bairro || ""}, ${endereco.cidade || ""} - ${endereco.estado || ""}`
  }

  // Format business hours as string
  const formatHorarioFuncionamento = (horario: HorarioFuncionamento): string => {
    const formatDia = (
      dia: string | { open?: boolean; abertura?: string; fechamento?: string } | undefined,
    ): string => {
      if (!dia) return "Fechado"
      if (typeof dia === "string") return dia
      if (dia.open === false) return "Fechado"
      return `${dia.abertura || ""} - ${dia.fechamento || ""}`
    }

    return `Seg: ${formatDia(horario.segunda)}, Ter: ${formatDia(horario.terca)}, Qua: ${formatDia(horario.quarta)}, Qui: ${formatDia(horario.quinta)}, Sex: ${formatDia(horario.sexta)}, Sáb: ${formatDia(horario.sabado)}, Dom: ${formatDia(horario.domingo)}`
  }

  // Verificar se há informações de contato para exibir
  const hasContactInfo =
    loja.endereco ||
    loja.telefone ||
    loja.email ||
    loja.website ||
    loja.horarioFuncionamento ||
    loja.redesSociais?.instagram ||
    loja.redesSociais?.facebook ||
    loja.instagram ||
    loja.facebook

  if (!loja.descricao && !hasContactInfo) {
    return null
  }

  return (
    <section className="py-8 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {loja.descricao && (
            <div className="mb-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">{loja.descricao}</p>
            </div>
          )}

          {hasContactInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loja.endereco && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Endereço</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatEndereco(loja.endereco)}</p>
                  </div>
                </div>
              )}

              {loja.telefone && (
                <div className="flex items-start gap-3">
                  <Phone
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Telefone</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{loja.telefone}</p>
                  </div>
                </div>
              )}

              {loja.email && (
                <div className="flex items-start gap-3">
                  <Mail
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{loja.email}</p>
                  </div>
                </div>
              )}

              {loja.website && (
                <div className="flex items-start gap-3">
                  <Globe
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Website</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <a href={loja.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {loja.website}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {loja.horarioFuncionamento && (
                <div className="flex items-start gap-3">
                  <Clock
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Horário de Funcionamento</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatHorarioFuncionamento(loja.horarioFuncionamento)}
                    </p>
                  </div>
                </div>
              )}

              {(loja.redesSociais?.instagram || loja.instagram) && (
                <div className="flex items-start gap-3">
                  <Instagram
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Instagram</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <a
                        href={`https://instagram.com/${(loja.redesSociais?.instagram || loja.instagram || "").replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {loja.redesSociais?.instagram || loja.instagram}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {(loja.redesSociais?.facebook || loja.facebook) && (
                <div className="flex items-start gap-3">
                  <Facebook
                    className="h-5 w-5 text-gray-500 shrink-0 mt-0.5 dark:text-gray-400"
                    style={{ color: corPrimaria }}
                  />
                  <div>
                    <p className="font-medium dark:text-white">Facebook</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <a
                        href={loja.redesSociais?.facebook || loja.facebook || ""}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {loja.redesSociais?.facebook || loja.facebook}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {/* Remove or comment out the Twitter, LinkedIn, and YouTube sections since they're not in the type definition */}
              {/* If you want to keep them, you'll need to update the Loja interface in types/loja.ts */}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
