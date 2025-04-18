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
      // Verificar status da conexão
      const statusResponse = await fetch(
        `${integracao.evolutionApiUrl}/instance/connectionState/${integracao.nomeInstancia}`,
        {
          method: "GET",
          headers: {
            apikey: integracao.apiKey,
          },
        },
      )

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json()
        return NextResponse.json({ error: "Erro ao verificar status", details: errorData }, { status: 500 })
      }

      const statusData = await statusResponse.json()

      // Atualizar status da integração
      let novoStatus = "pendente"
      if (statusData.state === "open") {
        novoStatus = "conectado"

        // Buscar informações do telefone conectado
        try {
          const profileResponse = await fetch(
            `${integracao.evolutionApiUrl}/instance/fetchInstances/${integracao.nomeInstancia}`,
            {
              method: "GET",
              headers: {
                apikey: integracao.apiKey,
              },
            },
          )

          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            if (profileData.instance && profileData.instance.owner) {
              await WhatsappIntegracao.findByIdAndUpdate(id, {
                $set: {
                  telefone: profileData.instance.owner,
                  ultimaConexao: new Date(),
                },
              })
            }
          }
        } catch (error) {
          console.error("Erro ao buscar informações do telefone:", error)
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
