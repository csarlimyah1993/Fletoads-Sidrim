import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import { checkInstanceStatus, fetchInstances } from "@/lib/utils/evolution-api"

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    const { id } = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const integracao = await WhatsappIntegracao.findOne({
      _id: id,
      userId: session.user.id,
    })

    if (!integracao) {
      return NextResponse.json({ error: "Integração não encontrada" }, { status: 404 })
    }

    try {
      // Configurar variáveis de ambiente temporariamente para usar as funções utilitárias
      process.env.EVOLUTION_API_BASE_URL = integracao.evolutionApiUrl;
      process.env.EVOLUTION_API_KEY = integracao.apiKey;
      
      // Verificar status da conexão
      let statusData;
      try {
        statusData = await checkInstanceStatus(integracao.nomeInstancia);
      } catch (error) {
        console.error("Erro ao verificar status da instância:", error);
        return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 });
      }

      // Atualizar status da integração
      let novoStatus = "pendente"
      if (statusData.state === "open") {
        novoStatus = "conectado"

        // Buscar informações do telefone conectado
        try {
          const profileData = await fetchInstances(integracao.nomeInstancia);
          if (profileData.instance && profileData.instance.owner) {
            await WhatsappIntegracao.findByIdAndUpdate(id, {
              $set: {
                telefone: profileData.instance.owner,
                ultimaConexao: new Date(),
              },
            });
          }
        } catch (error) {
          console.error("Erro ao buscar informações do telefone:", error);
        }
      } else if (statusData.state === "close") {
        novoStatus = "desconectado"
      }

      await WhatsappIntegracao.findByIdAndUpdate(id, {
        $set: { status: novoStatus },
      })

      return NextResponse.json({
        ...statusData,
        status: novoStatus,
      })
    } catch (error) {
      console.error("Erro ao comunicar com Evolution API:", error)
      return NextResponse.json({ error: "Erro ao comunicar com Evolution API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 })
  }
}
