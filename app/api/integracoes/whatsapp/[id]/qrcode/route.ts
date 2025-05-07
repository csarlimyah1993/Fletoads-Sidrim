import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"
import { createInstance, checkInstanceStatus } from "@/lib/utils/evolution-api"

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
      
      let qrData;
      
      try {
        // Tentar criar/reconectar a instância com QR code
        const instanceData = await createInstance({
          instanceName: integracao.nomeInstancia,
          number: integracao.numero,
          integration: 'WHATSAPP-BAILEYS',
          qrcode: true
        });
        
        // O QR code já vem na resposta da criação da instância
        qrData = instanceData;
        
        // Verificar se temos o QR code na resposta
        if (!qrData.qrcode) {
          console.error("QR code não encontrado na resposta:", instanceData);
          return NextResponse.json({ error: "QR code não disponível" }, { status: 500 });
        }
      } catch (error) {
        console.error("Erro ao criar/reconectar instância:", error);
        return NextResponse.json({ error: "Erro ao criar instância ou gerar QR Code" }, { status: 500 });
      }

      // Atualizar status da integração
      await WhatsappIntegracao.findByIdAndUpdate(id, {
        $set: { status: "pendente" },
      })

      return NextResponse.json(qrData)
    } catch (error) {
      console.error("Erro ao comunicar com Evolution API:", error)
      return NextResponse.json({ error: "Erro ao comunicar com Evolution API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erro ao gerar QR Code:", error)
    return NextResponse.json({ error: "Erro ao gerar QR Code" }, { status: 500 })
  }
}
