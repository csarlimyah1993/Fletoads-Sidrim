import { Header } from "@/components/header"
import { AfiliacaoContent } from "@/components/afiliacao-content"

export default function AfiliacaoPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <AfiliacaoContent />
      </div>
    </>
  )
}

