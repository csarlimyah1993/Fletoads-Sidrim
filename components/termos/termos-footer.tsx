import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye, Download, Home } from "lucide-react"

export const TermosFooter = () => {
  return (
    <footer className="mt-12 border-t pt-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">FletoAds</h3>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} Todos os direitos reservados.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar para o início
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/termos/visualizar">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar documentos
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href="/termos/debug">
              <Download className="h-4 w-4 mr-2" />
              Diagnóstico
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}
