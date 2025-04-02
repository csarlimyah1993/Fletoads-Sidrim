import type { Metadata } from "next"
import EventoForm from "@/components/evento/evento-form"

export const metadata: Metadata = {
  title: "Evento FletoAds - Cadastro",
  description: "Cadastre-se para acessar as lojas próximas a você",
}

export default function EventoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            fleto<span className="text-foreground">Ads</span>
          </h1>
          <p className="text-muted-foreground">
            Antes de acessar as lojas perto de você, precisamos de algumas informações
          </p>
        </div>

        <EventoForm />
      </div>
    </div>
  )
}

