import { TermosHeader } from "@/components/termos/termos-header"
import { TermosFooter } from "@/components/termos/termos-footer"
import { PdfViewer } from "@/components/termos/pdf-viewer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso e Política de Privacidade | FletoAds",
  description: "Termos de uso e política de privacidade da plataforma FletoAds",
}

export default function TermosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TermosHeader />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Termos de Uso</h2>
        <PdfViewer
          title="Termos de Uso"
          pdfPath="/assets/Termos de Uso_V1.pdf"
          fallbackPdfPath="/assets/termos-de-uso.pdf"
          description="Este documento estabelece as regras e condições para o uso da plataforma FletoAds."
        />

        <h2 className="text-2xl font-bold mb-6 mt-12">Política de Privacidade</h2>
        <PdfViewer
          title="Política de Privacidade"
          pdfPath="/assets/Politica_Privacidade_V1.pdf"
          fallbackPdfPath="/assets/politica-de-privacidade.pdf"
          description="Este documento explica como coletamos, usamos e protegemos seus dados pessoais."
        />
      </main>

      <TermosFooter />
    </div>
  )
}
