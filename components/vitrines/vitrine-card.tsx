import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, Globe, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface VitrineCardProps {
  loja: any
}

export function VitrineCard({ loja }: VitrineCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-md transition-all duration-300">
      <div className="relative h-48 w-full bg-muted overflow-hidden">
        {loja.banner ? (
          <Image
            src={loja.banner || "/placeholder.svg?height=192&width=384"}
            alt={`Banner da loja ${loja.nome}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          {loja.destaque && (
            <Badge variant="secondary" className="bg-amber-500 text-white hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1 fill-current" /> Destaque
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="relative pb-2">
        <div className="absolute -top-8 left-4 w-16 h-16 bg-background rounded-md shadow-md p-1 border">
          <div className="w-full h-full bg-muted rounded overflow-hidden">
            {loja.logo ? (
              <Image
                src={loja.logo || "/placeholder.svg?height=64&width=64"}
                alt={`Logo da loja ${loja.nome}`}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Logo</div>
            )}
          </div>
        </div>

        <div className="ml-20">
          <CardTitle className="text-lg line-clamp-1">{loja.nome}</CardTitle>
          <CardDescription className="line-clamp-1">
            {loja.categorias && loja.categorias.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {loja.categorias.slice(0, 3).map((categoria: string) => (
                  <Badge key={categoria} variant="outline" className="text-xs">
                    {categoria}
                  </Badge>
                ))}
                {loja.categorias.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{loja.categorias.length - 3}
                  </Badge>
                )}
              </div>
            ) : (
              "Sem categorias"
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {loja.descricao || "Sem descrição disponível."}
        </p>

        <div className="space-y-2 text-sm">
          {loja.endereco && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground line-clamp-2">
                {`${loja.endereco.cidade || "Cidade não informada"}, ${loja.endereco.estado || "Estado não informado"}`}
              </span>
            </div>
          )}

          {loja.contato?.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{loja.contato.telefone}</span>
            </div>
          )}

          {loja.contato?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{loja.contato.email}</span>
            </div>
          )}

          {loja.contato?.site && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{loja.contato.site}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-4">
        <Button asChild className="w-full">
          <Link href={`/vitrines/${loja._id}`}>Ver Vitrine</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

