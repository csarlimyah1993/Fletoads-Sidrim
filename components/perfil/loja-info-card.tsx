"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Globe, Clock, Calendar, Users } from "lucide-react"

interface LojaInfoCardProps {
  loja: any
}

export function LojaInfoCard({ loja }: LojaInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loja.endereco && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Endereço</p>
              <p className="text-sm text-muted-foreground">{loja.endereco}</p>
            </div>
          </div>
        )}

        {loja.telefone && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Telefone</p>
              <p className="text-sm text-muted-foreground">{loja.telefone}</p>
            </div>
          </div>
        )}

        {loja.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{loja.email}</p>
            </div>
          </div>
        )}

        {loja.website && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Website</p>
              <p className="text-sm text-muted-foreground">
                <a href={loja.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {loja.website}
                </a>
              </p>
            </div>
          </div>
        )}

        {loja.horarioFuncionamento && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Horário de Funcionamento</p>
              <p className="text-sm text-muted-foreground">{loja.horarioFuncionamento}</p>
            </div>
          </div>
        )}

        {loja.dataFundacao && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Data de Fundação</p>
              <p className="text-sm text-muted-foreground">{loja.dataFundacao}</p>
            </div>
          </div>
        )}

        {loja.numeroFuncionarios && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Número de Funcionários</p>
              <p className="text-sm text-muted-foreground">{loja.numeroFuncionarios}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

