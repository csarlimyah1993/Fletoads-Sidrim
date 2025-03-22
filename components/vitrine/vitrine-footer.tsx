import Link from "next/link"
import type { Loja } from "@/types/loja"

interface VitrineFooterProps {
  loja: Loja
}

export function VitrineFooter({ loja }: VitrineFooterProps) {
  const isPlanoPago = loja.plano?.id !== "gratis"
  const anoAtual = new Date().getFullYear()

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"
  const corSecundaria = loja.cores?.secundaria || "#f9fafb"
  const corTexto = loja.cores?.texto || "#111827"

  return (
    <footer
      className="py-6 transition-colors duration-200"
      style={{
        backgroundColor: isPlanoPago ? corPrimaria : "var(--footer-bg, #f3f4f6)",
        color: isPlanoPago ? "#ffffff" : "var(--footer-text, #4b5563)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className={isPlanoPago ? "text-white" : "dark:text-gray-300"}>
              &copy; {anoAtual} {loja.nome}. Todos os direitos reservados.
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-sm">
            <p className={isPlanoPago ? "text-white/80" : "dark:text-gray-400"}>
              Desenvolvido com{" "}
              <Link href="https://fletoads.com" className="underline">
                FletoAds
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

