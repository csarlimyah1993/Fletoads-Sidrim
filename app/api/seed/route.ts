import { type NextRequest, NextResponse } from "next/server"
import Usuario from "@/lib/models/usuario"
import Panfleto from "@/lib/models/panfleto"
import Cliente from "@/lib/models/cliente"
import Campanha from "@/lib/models/campanha"

export async function GET(req: NextRequest) {
  try {
    // Verificar se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Esta rota só está disponível em ambiente de desenvolvimento" },
        { status: 403 },
      )
    }

    // Criar usuário admin se não existir
    const adminExistente = await Usuario.findOne({ cargo: "admin" })
    let admin
    if (!adminExistente) {
      admin = new Usuario({
        nome: "Administrador",
        email: "admin@fletoads.com",
        senha: "Admin@123",
        cargo: "admin",
        permissoes: ["admin"],
        dataCriacao: new Date(),
      })

      await admin.save()
    }

    // Criar alguns panfletos de exemplo
    const panfletosTitulos = [
      "Promoção de Verão",
      "Lançamento de Produto",
      "Evento Especial",
      "Liquidação Total",
      "Black Friday",
    ]

    const panfletos = []

    for (const titulo of panfletosTitulos) {
      const panfleto = new Panfleto({
        titulo,
        descricao: `Descrição do panfleto ${titulo}`,
        imagem: `https://source.unsplash.com/random/800x600?${titulo.toLowerCase().replace(/\s+/g, "-")}`,
        conteudo: `Conteúdo detalhado do panfleto ${titulo}. Aqui vão informações sobre a promoção, evento ou produto.`,
        categoria: "Promocional",
        tags: ["promoção", "marketing", titulo.toLowerCase()],
        status: Math.random() > 0.3 ? "publicado" : "rascunho",
        autor: "admin@fletoads.com",
        visualizacoes: Math.floor(Math.random() * 1000),
        compartilhamentos: Math.floor(Math.random() * 100),
      })

      await panfleto.save()
      panfletos.push(panfleto)
    }

    // Criar alguns clientes de exemplo
    const clientesNomes = ["Empresa ABC", "Comércio XYZ", "Indústria 123", "Serviços Rápidos", "Consultoria Eficaz"]

    const clientes = []

    for (const nome of clientesNomes) {
      const cliente = new Cliente({
        nome: `Contato de ${nome}`,
        email: `contato@${nome.toLowerCase().replace(/\s+/g, "")}.com`,
        telefone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
        empresa: nome,
        endereco: {
          rua: "Rua Exemplo",
          numero: `${Math.floor(Math.random() * 1000)}`,
          bairro: "Centro",
          cidade: "São Paulo",
          estado: "SP",
          cep: "01000-000",
        },
        status: ["ativo", "inativo", "prospecto"][Math.floor(Math.random() * 3)],
        observacoes: `Observações sobre ${nome}`,
      })

      await cliente.save()
      clientes.push(cliente)
    }

    // Criar algumas campanhas de exemplo
    const campanhasTitulos = ["Campanha de Verão", "Lançamento Trimestral", "Promoção de Fim de Ano"]

    const campanhas = []

    for (const titulo of campanhasTitulos) {
      const campanha = new Campanha({
        nome: titulo,
        descricao: `Descrição da campanha ${titulo}`,
        dataInicio: new Date(),
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias depois
        status: ["planejada", "em_andamento", "concluida"][Math.floor(Math.random() * 3)],
        orcamento: Math.floor(Math.random() * 10000) + 1000,
        panfletos: panfletos.slice(0, Math.floor(Math.random() * 3) + 1).map((p) => p._id),
        clientes: clientes.slice(0, Math.floor(Math.random() * 3) + 1).map((c) => c._id),
        responsavel: adminExistente?._id || admin._id,
        metricas: {
          alcance: Math.floor(Math.random() * 5000),
          conversoes: Math.floor(Math.random() * 500),
          roi: Math.random() * 5,
        },
      })

      await campanha.save()
      campanhas.push(campanha)
    }

    return NextResponse.json({
      message: "Dados de exemplo criados com sucesso",
      dados: {
        usuarios: adminExistente ? "Admin já existia" : "Admin criado",
        panfletos: panfletos.length,
        clientes: clientes.length,
        campanhas: campanhas.length,
      },
    })
  } catch (error) {
    console.error("Erro ao criar dados de exemplo:", error)
    return NextResponse.json({ error: "Erro ao criar dados de exemplo" }, { status: 500 })
  }
}

