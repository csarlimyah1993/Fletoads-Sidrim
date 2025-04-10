import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"

// GET: Obter configurações da vitrine
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lojaId = params.id

    // Verificar se o usuário tem permissão para acessar esta loja
    const usuario = await Usuario.findById(session.user.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a loja
    const loja = await Loja.findById(lojaId)
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é dono da loja
    if (loja.usuarioId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado a acessar esta loja" }, { status: 403 })
    }

    // Configurações padrão
    const defaultConfiguracoes = {
      cores: {
        primaria: "#4f46e5",
        secundaria: "#818cf8",
        texto: "#1f2937",
        fundo: "#ffffff",
        destaque: "#ef4444",
      },
      fontes: {
        titulo: "Inter",
        corpo: "Inter",
        tamanhoTitulo: "xl",
        tamanhoCorpo: "base",
      },
      layout: {
        mostrarLogo: true,
        mostrarBanner: true,
        mostrarRedes: true,
        mostrarHorarios: true,
        mostrarEndereco: true,
        mostrarContato: true,
      },
      seo: {
        titulo: "",
        descricao: "",
        palavrasChave: "",
      },
      estilos: {
        layout: "moderno",
        cores: {
          primaria: "#4f46e5",
          secundaria: "#818cf8",
          texto: "#1f2937",
        },
        widgets: ["produtos", "contato", "mapa", "redesSociais"],
      },
    }

    // Se encontrou a vitrine, retornar suas configurações
    if (loja && loja.vitrineConfig) {
      return NextResponse.json({
        configuracoes: {
          ...defaultConfiguracoes,
          ...loja.vitrineConfig,
        },
      })
    }

    // Se não encontrou configurações, retornar as padrão
    return NextResponse.json({ configuracoes: defaultConfiguracoes })
  } catch (error) {
    console.error("Erro ao buscar configurações da vitrine:", error)
    return NextResponse.json({ error: "Erro ao buscar configurações da vitrine" }, { status: 500 })
  }
}

// POST: Atualizar configurações da vitrine
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const lojaId = params.id

    // Verificar se o usuário tem permissão para acessar esta loja
    const usuario = await Usuario.findById(session.user.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a loja
    const loja = await Loja.findById(lojaId)
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se o usuário é dono da loja
    if (loja.usuarioId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado a acessar esta loja" }, { status: 403 })
    }

    // Obter as configurações enviadas
    const configuracoes = await req.json()

    // Verificar o plano do usuário e limitar recursos
    const plano = usuario.plano || "free"

    // Limitar widgets com base no plano
    if (plano === "free" && configuracoes.widgets && configuracoes.widgets.length > 3) {
      configuracoes.widgets = configuracoes.widgets.slice(0, 3)
    } else if (plano === "basic" && configuracoes.widgets && configuracoes.widgets.length > 5) {
      configuracoes.widgets = configuracoes.widgets.slice(0, 5)
    }

    // Atualizar as configurações da vitrine
    loja.vitrineConfig = {
      ...(loja.vitrineConfig || {}),
      ...configuracoes,
    }

    await loja.save()

    return NextResponse.json(loja.vitrineConfig)
  } catch (error) {
    console.error("Erro ao atualizar configurações da vitrine:", error)
    return NextResponse.json({ error: "Erro ao atualizar configurações da vitrine" }, { status: 500 })
  }
}