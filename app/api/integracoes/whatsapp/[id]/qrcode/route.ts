import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import WhatsappIntegracao from "@/lib/models/whatsapp-integracao"

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
      // Primeiro, verificamos se a instância já existe
      const checkInstanceResponse = await fetch(
        `${integracao.evolutionApiUrl}/instance/instanceInfo/${integracao.nomeInstancia}`,
        {
          method: "GET",
          headers: {
            apikey: integracao.apiKey,
          },
        },
      )

      const instanceData = await checkInstanceResponse.json()

      // Se a instância não existe, criamos uma nova
      if (!checkInstanceResponse.ok || instanceData.error) {
        // Criar nova instância
        const createResponse = await fetch(`${integracao.evolutionApiUrl}/instance/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: integracao.apiKey,
          },
          body: JSON.stringify({
            instanceName: integracao.nomeInstancia,
          }),
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          return NextResponse.json({ error: "Erro ao criar instância", details: errorData }, { status: 500 })
        }
      }

      // Gerar QR Code
      const qrResponse = await fetch(`${integracao.evolutionApiUrl}/instance/qrcode/${integracao.nomeInstancia}`, {
        method: "GET",
        headers: {
          apikey: integracao.apiKey,
        },
      })

      if (!qrResponse.ok) {
        const errorData = await qrResponse.json()
        return NextResponse.json({ error: "Erro ao gerar QR Code", details: errorData }, { status: 500 })
      }

      const qrData = await qrResponse.json()

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
