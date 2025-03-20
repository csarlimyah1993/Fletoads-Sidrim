import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import mongoose from "mongoose"

// POST - Inicializar planos padrão
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Get the Plano model
    const Plano =
      mongoose.models.Plano ||
      mongoose.model(
        "Plano",
        new mongoose.Schema({
          nome: String,
          slug: { type: String, unique: true },
          preco: Number,
          descricao: String,
          recursos: [String],
          popular: Boolean,
          ativo: { type: Boolean, default: true },
          limitacoes: {
            produtos: { type: Number, default: 0 },
            lojas: { type: Number, default: 1 },
            panfletos: { type: Number, default: 0 },
            promocoes: { type: Number, default: 0 },
            whatsapp: { type: Number, default: 0 },
          },
        }),
      )

    // Planos padrão
    const planosDefault = [
      {
        nome: "FletoAds - Grátis",
        slug: "gratis",
        preco: 0,
        descricao: "Ideal para quem está começando e quer experimentar a plataforma.",
        recursos: ["Vitrine WEB produtos (10 unidades)", "Sinalização visual"],
        popular: false,
        ativo: true,
        limitacoes: {
          produtos: 10,
          lojas: 1,
          panfletos: 0,
          promocoes: 0,
          whatsapp: 0,
        },
      },
      {
        nome: "FletoAds - Start",
        slug: "start",
        preco: 297,
        descricao: "Perfeito para pequenos negócios que querem começar a crescer online.",
        recursos: [
          "1 WhatsApp",
          "Pan assistente básico + CRM",
          "Vitrine WEB produtos (30 unidades)",
          "Panfletos (20 unidades)",
          "Hot Promos (5 unidades)",
          "Pin no Mapa",
          "Notificação de pesquisa",
          "Clientes Próximos",
          "Sinalização visual",
        ],
        popular: false,
        ativo: true,
        limitacoes: {
          produtos: 30,
          lojas: 1,
          panfletos: 20,
          promocoes: 5,
          whatsapp: 1,
        },
      },
      {
        nome: "FletoAds - Básico",
        slug: "basico",
        preco: 799,
        descricao: "Nosso plano mais popular, com recursos essenciais para o seu negócio.",
        recursos: [
          "1 WhatsApp",
          "Pan assistente básico + CRM",
          "Panfletos (30 unidades)",
          "Hot Promos (10 unidades)",
          "Pin no Mapa",
          "Notificação de Pesquisa",
          "Clientes próximos",
          "Sinalização visual",
        ],
        popular: true,
        ativo: true,
        limitacoes: {
          produtos: 0,
          lojas: 1,
          panfletos: 30,
          promocoes: 10,
          whatsapp: 1,
        },
      },
      {
        nome: "FletoAds - Completo",
        slug: "completo",
        preco: 1599,
        descricao: "Solução completa para negócios que querem maximizar sua presença online.",
        recursos: [
          "Tour Virtual básico 360° indoorviews",
          "1 WhatsApp",
          "Pan assistente básico + CRM",
          "Vitrine WEB Produtos (60 unidades)",
          "Panfletos (50 unidades)",
          "Hot Promos (20 unidades)",
          "Pin no Mapa",
          "Notificação de pesquisa",
          "Clientes Próximos",
          "Sinalização visual",
        ],
        popular: false,
        ativo: true,
        limitacoes: {
          produtos: 60,
          lojas: 1,
          panfletos: 50,
          promocoes: 20,
          whatsapp: 1,
        },
      },
      {
        nome: "FletoAds - Premium",
        slug: "premium",
        preco: 2200,
        descricao: "Para negócios que buscam uma solução premium com recursos avançados.",
        recursos: [
          "Tour visual completo 360° indoorviews",
          "2 WhatsApp",
          "Pan assistente completo + CRM",
          "Vitrine WEB produtos (120 unidades)",
          "Panfletos (100 unidades)",
          "Hot Promos (50 unidades)",
          "Pin no mapa",
          "Notificação de pesquisa",
          "Clientes próximos",
          "Sinalização visual",
        ],
        popular: false,
        ativo: true,
        limitacoes: {
          produtos: 120,
          lojas: 1,
          panfletos: 100,
          promocoes: 50,
          whatsapp: 2,
        },
      },
      {
        nome: "FletoAds - Empresarial",
        slug: "empresarial",
        preco: 9999,
        descricao: "Solução empresarial completa para grandes negócios e franquias.",
        recursos: [
          "Tour virtual Premium 360° Indoorviews",
          "4 Pan WhatsApp",
          "Pan Assistente premium + CRM",
          "Vitrine WEB Produtos (400 unidades)",
          "Panfletos (200 unidades)",
          "Hot Promos (100 unidades)",
          "Pin no mapa",
          "Notificação de pesquisa",
          "Clientes próximos",
          "Sinalização visual",
        ],
        popular: false,
        ativo: true,
        limitacoes: {
          produtos: 400,
          lojas: 9999,
          panfletos: 200,
          promocoes: 100,
          whatsapp: 4,
        },
      },
    ]

    // Limpar planos existentes e inserir os novos
    await Plano.deleteMany({})
    await Plano.insertMany(planosDefault)

    return NextResponse.json({ message: "Planos inicializados com sucesso", count: planosDefault.length })
  } catch (error) {
    console.error("Erro ao inicializar planos:", error)
    return NextResponse.json({ error: "Erro ao inicializar planos" }, { status: 500 })
  }
}

