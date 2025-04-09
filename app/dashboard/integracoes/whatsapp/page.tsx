import type { Metadata } from "next"
import { WhatsappIntegracao } from "@/components/integracoes/whatsapp-integracao"

export const metadata: Metadata = {
  title: "Integração com WhatsApp - FletoAds",
  description: "Conecte seu WhatsApp para enviar mensagens através da Evolution API",
}

export default function WhatsappIntegracaoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integração com WhatsApp</h2>
        <p className="text-muted-foreground">Conecte seu WhatsApp para enviar mensagens através da Evolution API</p>
      </div>
      <WhatsappIntegracao />
    </div>
  )
}

