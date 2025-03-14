import { Header } from "@/components/header"
import { CuponsContent } from "@/components/cupons-content"

export default function CuponsPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <CuponsContent />
      </div>
    </>
  )
}

