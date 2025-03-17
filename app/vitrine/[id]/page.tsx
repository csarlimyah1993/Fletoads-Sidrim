import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import Produto from "@/lib/models/produto"
import mongoose from "mongoose"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Phone, MessageCircle, ShoppingBag } from "lucide-react"

// Função local para formatar moeda
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor)
}

// Função para formatar número de telefone para WhatsApp
function formatarTelefoneWhatsApp(telefone: string): string {
  // Remove todos os caracteres não numéricos
  const numerosApenas = telefone.replace(/\D/g, "")

  // Verifica se já tem o código do país
  if (numerosApenas.startsWith("55")) {
    return numerosApenas
  }

  // Adiciona o código do Brasil (55) se não tiver
  return `55${numerosApenas}`
}

// Função para gerar link do WhatsApp
function gerarLinkWhatsApp(telefone: string, mensagem: string): string {
  const telefoneFormatado = formatarTelefoneWhatsApp(telefone)
  const mensagemCodificada = encodeURIComponent(mensagem)
  return `https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`
}

async function VitrineContent({ id }: { id: string }) {
  try {
    await connectToDatabase()

    // Verificar se o ID é de um produto
    if (mongoose.Types.ObjectId.isValid(id)) {
      const produto = await Produto.findById(id)
      if (produto) {
        console.log(`ID ${id} é de um produto. Exibindo detalhes do produto.`)

        // Buscar a loja do produto
        const loja = await Loja.findById(produto.lojaId)

        if (!loja) {
          throw new Error(`Loja não encontrada para o produto: ${id}`)
        }

        // Preparar mensagem para WhatsApp
        const mensagemWhatsApp = `Olá! Vi o produto "${produto.nome}" na sua vitrine e gostaria de mais informações.`

        // Determinar qual número usar para contato
        const numeroContato = loja.contato?.whatsapp || loja.contato?.telefone

        // Exibir detalhes do produto
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href={`/vitrine/${loja._id}`} className="text-primary hover:underline flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Voltar para a loja {loja.nome}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-lg overflow-hidden border bg-card">
                {produto.imagens && produto.imagens.length > 0 ? (
                  <img
                    src={produto.imagens[0] || "/placeholder.svg?height=600&width=600"}
                    alt={produto.nome}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="bg-muted w-full h-[300px] flex items-center justify-center">
                    <span className="text-muted-foreground">Sem imagem</span>
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">{produto.nome}</h1>

                <div className="flex items-baseline gap-2 mb-4">
                  {produto.precoPromocional ? (
                    <>
                      <span className="text-2xl font-bold text-primary">{formatarMoeda(produto.precoPromocional)}</span>
                      <span className="text-lg line-through text-muted-foreground">{formatarMoeda(produto.preco)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">{formatarMoeda(produto.preco)}</span>
                  )}
                </div>

                {produto.estoque > 0 ? (
                  <div className="text-sm text-green-600 dark:text-green-400 mb-4">
                    Em estoque: {produto.estoque} unidades
                  </div>
                ) : (
                  <div className="text-sm text-red-600 dark:text-red-400 mb-4">Produto esgotado</div>
                )}

                <div className="prose dark:prose-invert max-w-none mb-6">
                  <h3 className="text-xl font-semibold mb-2">Descrição</h3>
                  <p>{produto.descricao || "Sem descrição disponível."}</p>
                </div>

                {produto.especificacoes && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Especificações</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="whitespace-pre-wrap">{produto.especificacoes}</pre>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 mt-6">
                  {numeroContato && (
                    <a
                      href={gerarLinkWhatsApp(numeroContato, mensagemWhatsApp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Contatar vendedor via WhatsApp
                    </a>
                  )}

                  {loja.contato?.telefone && (
                    <a
                      href={`tel:${loja.contato.telefone}`}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      Ligar para {loja.contato.telefone}
                    </a>
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-2">Informações da Loja</h3>
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-medium text-lg">{loja.nome}</h4>
                    {loja.descricao && <p className="text-muted-foreground mt-1">{loja.descricao}</p>}
                    <Link href={`/vitrine/${loja._id}`} className="text-primary hover:underline mt-2 inline-block">
                      Ver todos os produtos
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    }

    // Verificar se o ID é um ObjectId válido
    let query: any = { slug: id }
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ slug: id }, { _id: id }] }
    }

    // Buscar a loja pelo id ou slug
    const loja = await Loja.findOne(query)

    if (!loja) {
      console.error(`Loja não encontrada para id/slug: ${id}`)
      notFound()
    }

    // Buscar produtos da loja
    const produtos = await Produto.find({ lojaId: loja._id, ativo: true })
      .sort({ destaque: -1, createdAt: -1 })
      .limit(12)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{loja.nome}</h1>
          {loja.descricao && <p className="text-muted-foreground mt-2">{loja.descricao}</p>}
        </div>

        {produtos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produtos.map((produto) => (
              <Link key={produto._id.toString()} href={`/vitrine/${produto._id}`} className="group">
                <div className="border rounded-lg overflow-hidden bg-card transition-all hover:shadow-md">
                  <div className="aspect-square relative bg-muted">
                    {produto.imagens && produto.imagens.length > 0 ? (
                      <img
                        src={produto.imagens[0] || "/placeholder.svg?height=300&width=300"}
                        alt={produto.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{produto.nome}</h3>
                    <div className="mt-2">
                      {produto.precoPromocional ? (
                        <div className="flex flex-col">
                          <span className="text-primary font-bold">{formatarMoeda(produto.precoPromocional)}</span>
                          <span className="text-sm line-through text-muted-foreground">
                            {formatarMoeda(produto.preco)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold">{formatarMoeda(produto.preco)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">Nenhum produto disponível</h2>
            <p className="text-muted-foreground">Esta loja ainda não possui produtos cadastrados.</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar vitrine:", error)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Erro ao carregar vitrine</h2>
        <p className="text-muted-foreground">Ocorreu um erro ao carregar os dados da loja.</p>
      </div>
    )
  }
}

export default async function VitrinePage({ params }: { params: Promise<{ id: string }> }) {
  // Aguardar os parâmetros antes de acessar suas propriedades
  const resolvedParams = await params
  const id = resolvedParams.id

  return <VitrineContent id={id} />
}

