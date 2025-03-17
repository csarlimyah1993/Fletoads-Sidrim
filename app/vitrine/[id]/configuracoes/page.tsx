import { Suspense } from "react"
import { Loader2, MapPin, Phone, Mail, Globe, Instagram, Facebook } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import Produto from "@/lib/models/produto"
import { notFound } from "next/navigation"

// Componente para informações com label
function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  if (!value) return null

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

// Componente para exibir um produto
function ProdutoCard({ produto }: { produto: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-800 relative">
        {produto.imagens && produto.imagens.length > 0 ? (
          <img
            src={produto.imagens[0] || "/placeholder.svg"}
            alt={produto.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
        )}
        {produto.promocao && (
          <Badge className="absolute top-2 right-2 bg-red-500">{produto.promocao.percentual}% OFF</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{produto.nome}</h3>
        <div className="flex items-center justify-between mt-2">
          {produto.promocao ? (
            <div className="flex flex-col">
              <span className="text-sm line-through text-muted-foreground">R$ {produto.preco.toFixed(2)}</span>
              <span className="font-bold text-red-500">
                R$ {(produto.preco * (1 - produto.promocao.percentual / 100)).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="font-bold">R$ {produto.preco.toFixed(2)}</span>
          )}
          <Button size="sm" variant="outline">
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

async function VitrineContent({ id }: { id: string }) {
  await connectToDatabase()

  // Buscar a loja pelo id
  const loja = await Loja.findOne({
    $or: [{ slug: id }, { _id: id }],
  })

  if (!loja) {
    notFound()
  }

  // Buscar produtos da loja
  const produtos = await Produto.find({
    lojaId: loja._id,
    status: "ativo",
  }).limit(8)

  return (
    <div className="space-y-6 pb-8">
      {/* Banner e informações básicas */}
      <div className="w-full overflow-hidden">
        <div className="relative">
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {loja.banner ? (
              <img
                src={loja.banner || "/placeholder.svg"}
                alt={`Banner da loja ${loja.nome}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Banner não disponível</div>
            )}
          </div>

          <div className="absolute -bottom-16 left-6 w-32 h-32 bg-white dark:bg-gray-950 rounded-lg shadow-md p-1">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {loja.logo ? (
                <img
                  src={loja.logo || "/placeholder.svg"}
                  alt={`Logo da loja ${loja.nome}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Logo</div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-20 pb-4 px-6">
          <h1 className="text-2xl font-bold">{loja.nome}</h1>
          {loja.categorias && loja.categorias.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {loja.categorias.map((categoria) => (
                <Badge key={categoria} variant="outline" className="text-xs">
                  {categoria}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="sobre" className="w-full px-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="contato">Contato</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
        </TabsList>

        {/* Sobre a loja */}
        <TabsContent value="sobre" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{loja.descricao || "Descrição não disponível."}</p>

              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Endereço</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p>
                    {loja.endereco.rua}, {loja.endereco.numero}
                    {loja.endereco.complemento && `, ${loja.endereco.complemento}`}
                    <br />
                    {loja.endereco.bairro}, {loja.endereco.cidade} - {loja.endereco.estado}
                    <br />
                    CEP: {loja.endereco.cep}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Produtos */}
        <TabsContent value="produtos" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produtos.length > 0 ? (
              produtos.map((produto) => <ProdutoCard key={produto._id.toString()} produto={produto} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
              </div>
            )}
          </div>

          {produtos.length > 0 && (
            <div className="mt-6 text-center">
              <Button>Ver todos os produtos</Button>
            </div>
          )}
        </TabsContent>

        {/* Contato */}
        <TabsContent value="contato" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={Phone} label="Telefone" value={loja.contato.telefone} />

              {loja.contato.whatsapp && <InfoItem icon={Phone} label="WhatsApp" value={loja.contato.whatsapp} />}

              <InfoItem icon={Mail} label="E-mail" value={loja.contato.email} />

              {loja.contato.site && <InfoItem icon={Globe} label="Site" value={loja.contato.site} />}

              {loja.contato.instagram && (
                <InfoItem icon={Instagram} label="Instagram" value={`@${loja.contato.instagram.replace("@", "")}`} />
              )}

              {loja.contato.facebook && <InfoItem icon={Facebook} label="Facebook" value={loja.contato.facebook} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Horários */}
        <TabsContent value="horarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Horários de Funcionamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Segunda-feira</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.segunda || "Fechado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Terça-feira</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.terca || "08:00 - 18:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quarta-feira</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.quarta || "08:00 - 18:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quinta-feira</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.quinta || "08:00 - 18:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sexta-feira</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.sexta || "08:00 - 18:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sábado</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.sabado || "08:00 - 13:00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Domingo</span>
                  <span className="text-sm font-medium">{loja.horarioFuncionamento?.domingo || "Fechado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function VitrinePage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <VitrineContent id={params.id} />
      </Suspense>
    </div>
  )
}

