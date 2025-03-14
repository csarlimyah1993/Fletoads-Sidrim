import { Header } from "@/components/header"
import { MarketplaceContent } from "@/components/marketplace-content"

export const metadata = {
  title: "Marketplace de Parceiros | Fletoads",
  description: "Explore perfis de lojas parceiras do Fletoads e seus produtos disponíveis para revenda",
}

export default function MarketplacePage() {
  return (
    <>
      <Header />
      <div className="p-4 md:p-6 lg:p-8">
        <MarketplaceContent />
      </div>
    </>
  )
}

