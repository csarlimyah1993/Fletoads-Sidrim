import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "../../../../lib/auth"
import { getIntegrationById } from "@/lib/integrations"
import IntegrationForm from "@/components/integrations-form"

interface Params {
  id: string
}

interface Props {
  params: Promise<Params> // Corrigido para Promise<Params>
}

// Função de metadados agora espera um "params" que é uma Promise
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params // Agora aguardamos a resolução do params

  const integration = await getIntegrationById(id)

  if (!integration) {
    return {
      title: "Integração não encontrada | FletoAds",
    }
  }

  return {
    title: `${integration.name} | FletoAds`,
  }
}

const IntegrationPage = async ({ params }: Props) => {
  const { id } = await params // Aguardamos os parâmetros aqui também
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const integration = await getIntegrationById(id, session.user.id)

  if (!integration) {
    redirect("/dashboard/integracoes")
  }

  // Create a complete integration object with all required properties
  const completeIntegration = {
    ...integration,
    description: `Configuração da integração ${integration.name}`, // Simply add the description without trying to access the non-existent property
    // Add any other missing required properties here
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{integration.name}</h1>
          <p className="text-sm text-muted-foreground">Configure as opções da sua integração.</p>
        </div>
      </div>
      <div className="mt-10">
        <IntegrationForm
          integration={completeIntegration}
          webhookUrl={integration.settings?.webhookUrl || ""}
          apiKey={integration.settings?.apiKey || ""}
        />
      </div>
    </div>
  )
}

export default IntegrationPage
