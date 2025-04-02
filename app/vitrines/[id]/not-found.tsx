import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function VitrineNotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/assets/image.png" alt="FletoAds Logo" width={150} height={40} className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/registro">Criar Conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Vitrine não encontrada</h1>
          <p className="text-gray-600 mb-8 max-w-md">A vitrine que você está procurando não existe ou foi removida.</p>
          <Button asChild>
            <Link href="/vitrines">Voltar para Vitrines</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

