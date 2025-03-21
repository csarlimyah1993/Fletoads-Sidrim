import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { getIntegrationById } from "@/lib/integrations"
import IntegrationForm from "@/components/integrations-form"

interface Params {
  id: string
}

interface Props {
  params: Params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const integrationId = params.id

  const integration = await getIntegrationById(integrationId)

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
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const integrationId = params.id

  const integration = await getIntegrationById(integrationId, session.user.id)

  if (!integration) {
    redirect("/dashboard/integracoes")
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
          integration={integration}
          webhookUrl={integration.settings?.webhookUrl || ""}
          apiKey={integration.settings?.apiKey || ""}
        />
      </div>
    </div>
  )
}

export default IntegrationPage

