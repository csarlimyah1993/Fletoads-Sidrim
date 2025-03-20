import type { Metadata } from "next"
import PlanosClientPage from "./planosClientPage"

export const metadata: Metadata = {
  title: "Planos - FletoAds",
  description: "Escolha o plano ideal para o seu negócio e comece a crescer com o FletoAds",
}

export default function PlanosPage() {
  return <PlanosClientPage />
}

