import { Suspense } from "react"
import { Loader2, Edit, QrCode, Printer, Globe, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import { redirect } from "next/navigation"

// Add cache control to prevent stale data
export const dynamic = "force-dynamic"
export const revalidate = 0

// Componente para ícones de amenidades com texto
function AmenityItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/50 rounded-md p-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}

// Componente para informações com label
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || "Não informado"}</p>
    </div>
  )
}

// Componente para métricas do plano
function PlanMetric({ label, current, total }: { label: string; current: number; total: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-medium">
          {current}/{total}
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${(current / total) * 100}%` }}></div>
      </div>
    </div>
  )
}

async function PerfilLojaContent() {
  console.log("PerfilLojaContent - Starting to fetch data")
  await connectToDatabase()

  const session = await getServerSession(authOptions)
  if (!session) {
    console.log("PerfilLojaContent - No session found, redirecting to login")
    redirect("/login")
  }

  console.log(`PerfilLojaContent - Session found for user: ${session.user.id}`)
  const loja = await Loja.findOne({ proprietarioId: session.user.id })

  if (!loja) {
    console.log(`PerfilLojaContent - No store found for user: ${session.user.id}`)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loja não encontrada</CardTitle>
          <CardDescription>Você ainda não possui uma loja cadastrada.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/perfil/editar">
              <Edit className="mr-2 h-4 w-4" />
              Criar Loja
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  console.log(`PerfilLojaContent - Store found: ${loja._id}`)
  console.log("PerfilLojaContent - Store data:", JSON.stringify(loja, null, 2))

  // Construir a URL da vitrine
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000"
  const vitrineUrl = `${baseUrl}/vitrine/${loja.slug || loja._id}`

  const amenities = [
    { icon: () => <span>🚽</span>, text: "Banheiros" },
    { icon: () => <span>👶</span>, text: "Acessível para crianças" },
    { icon: () => <span>🐕</span>, text: "Permitido Animais" },
    { icon: () => <span>❄️</span>, text: "Climatização" },
    { icon: () => <span>♿</span>, text: "Rampa de acessibilidade" },
    { icon: () => <span>📶</span>, text: "Wi-Fi Grátis" },
    { icon: () => <span>🚰</span>, text: "Bebedouro" },
  ]

  return (
    <div className="space-y-6">
      {/* Banner e informações básicas */}
      <Card className="w-full overflow-hidden">
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

          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              {loja.status === "ativo" ? "Ativo" : loja.status === "inativo" ? "Inativo" : "Pendente"}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-primary/10">
              Plano Prata
            </Badge>
          </div>
        </div>

        <CardHeader className="pt-20 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{loja.nome}</CardTitle>
              <CardDescription className="mt-1 text-sm">
                {loja.categorias && loja.categorias.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {loja.categorias.map((categoria: any) => (
                      <Badge key={categoria} variant="outline" className="text-xs">
                        {categoria}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/perfil/editar">
                <Edit className="mr-2 h-4 w-4" />
                Editar Loja
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de informações */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sobre Nossa Loja */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Sobre Nossa Loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity, index) => (
                <AmenityItem key={index} icon={amenity.icon} text={amenity.text} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {loja.descricao ||
                "Nossa loja física é um lugar acolhedor, onde você pode explorar uma ampla variedade de produtos em um ambiente confortável. Agora, você pode explorar nossos produtos e fazer compras online a qualquer momento e de qualquer lugar."}
            </p>
          </CardContent>
        </Card>

        {/* Informações Gerais */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Nome Fantasia" value={loja.nome} />
            <InfoItem label="CNPJ" value={loja.cnpj || "12.345.678/0001-90"} />
            <InfoItem
              label="Endereço"
              value={`${loja.endereco.rua || ""}, ${loja.endereco.numero || ""}, ${loja.endereco.bairro || ""}`}
            />
            <InfoItem label="Cidade" value={`${loja.endereco.cidade || ""}, ${loja.endereco.estado || ""}`} />
            <InfoItem label="E-Mail" value={loja.contato.email} />
            <InfoItem label="Site" value={loja.contato.site || "http://www.exemplo.com.br"} />
          </CardContent>
        </Card>

        {/* QR Code e Vitrine */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Seu QR Code</CardTitle>
            <CardDescription>Imprima o QR Code de acesso para a sua vitrine web.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square w-full max-w-[200px] mx-auto bg-white p-4 rounded-lg">
              <div className="w-full h-full bg-secondary/20 rounded flex items-center justify-center">
                <QrCode className="h-20 w-20 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/perfil/vitrine?tab=qrcode">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir Código
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/perfil/vitrine">
                  <Edit className="mr-2 h-4 w-4" />
                  Gerenciar Vitrine
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={vitrineUrl} target="_blank">
                  <Globe className="mr-2 h-4 w-4" />
                  Acessar Vitrine
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Horários de Funcionamento */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Horários de Funcionamento</CardTitle>
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

        {/* Informações de Contato */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <InfoItem label="Telefone" value={loja.contato.telefone || "(00) 0000-0000"} />
              <InfoItem label="WhatsApp" value={loja.contato.whatsapp || "(00) 00000-0000"} />
              <InfoItem label="Email" value={loja.contato.email} />

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Redes Sociais</p>
                <div className="flex gap-4">
                  {loja.contato.instagram && (
                    <a
                      href={`https://instagram.com/${loja.contato.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Instagram
                    </a>
                  )}

                  {loja.contato.facebook && (
                    <a
                      href={loja.contato.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pacote/Plano */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Pacote Prata</CardTitle>
              <CardDescription>Gerencie seu plano e recursos disponíveis</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver Detalhes
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">182</span>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-secondary"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * 182) / 365}
                      className="text-primary transform -rotate-90 origin-center"
                    />
                  </svg>
                  <div className="absolute bottom-0 w-full text-center text-sm text-muted-foreground">/365</div>
                  <div className="absolute -bottom-6 w-full text-center text-xs text-muted-foreground">
                    Dias restantes
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <PlanMetric label="Panfletos Ativos" current={0} total={10} />
                  <PlanMetric label="Panfletos Programados" current={0} total={10} />
                  <PlanMetric label="Hotpromos Diários" current={3} total={10} />
                  <PlanMetric label="Cupons" current={6} total={10} />
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <Button size="lg" className="w-full md:w-auto">
                  Aprimorar Seu Plano
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Perfil da Loja</h2>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <PerfilLojaContent />
      </Suspense>
    </div>
  )
}

