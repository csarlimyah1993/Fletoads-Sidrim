"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Mail, Globe, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatarHorario, isDiaAtual, isHorarioAberto } from "@/lib/vitrine-utils"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineContatoProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrineContato({ loja, config }: VitrineContatoProps) {
  if (!config.mostrarContato) {
    return null
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Entre em Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações de Contato */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Informações</h3>
                <ul className="space-y-3">
                  {loja.contato?.telefone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <a href={`tel:${loja.contato.telefone}`} className="hover:text-blue-500 transition-colors">
                        {loja.contato.telefone}
                      </a>
                    </li>
                  )}
                  {loja.contato?.whatsapp && config.mostrarWhatsapp && (
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-500"
                      >
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
                      </svg>
                      <a
                        href={`https://wa.me/${loja.contato.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-500 transition-colors"
                      >
                        {loja.contato.whatsapp}
                      </a>
                    </li>
                  )}
                  {loja.contato?.email && (
                    <li className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <a href={`mailto:${loja.contato.email}`} className="hover:text-blue-500 transition-colors">
                        {loja.contato.email}
                      </a>
                    </li>
                  )}
                  {loja.contato?.site && (
                    <li className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <a
                        href={loja.contato.site.startsWith("http") ? loja.contato.site : `https://${loja.contato.site}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 transition-colors"
                      >
                        {loja.contato.site}
                      </a>
                    </li>
                  )}
                  {config.mostrarEndereco && loja.endereco && (
                    <li className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {loja.endereco.rua || loja.endereco.logradouro}, {loja.endereco.numero}
                        </p>
                        <p className="text-gray-500">
                          {loja.endereco.complemento && `${loja.endereco.complemento}, `}
                          {loja.endereco.bairro}, {loja.endereco.cidade} - {loja.endereco.estado}
                        </p>
                        <p className="text-gray-500">{loja.endereco.cep}</p>
                      </div>
                    </li>
                  )}
                  {config.mostrarHorarios && loja.horarioFuncionamento && (
                    <>
                      <li className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" /> Horário de Funcionamento:
                      </li>
                      <ul className="ml-7 space-y-1">
                        {Object.entries(loja.horarioFuncionamento).map(([diaSemana, horario]) => (
                          <li key={diaSemana} className="flex items-center gap-2">
                            <span className="capitalize">{diaSemana}:</span>
                            <span>
                              {formatarHorario(horario)}
                              {isDiaAtual(diaSemana) && isHorarioAberto(horario) && (
                                <Badge className="ml-2">Aberto agora</Badge>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de Contato */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Envie uma Mensagem</h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input type="text" id="nome" placeholder="Seu nome" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="assunto">Assunto</Label>
                    <Input id="assunto" placeholder="Assunto da mensagem" />
                  </div>
                  <div>
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea id="mensagem" placeholder="Sua mensagem" rows={4} />
                  </div>
                  <Button
                    className="w-full"
                    style={{
                      backgroundColor: config.corPrimaria,
                      color: config.corTexto,
                    }}
                  >
                    Enviar mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
