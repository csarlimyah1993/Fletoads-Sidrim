import { Header } from "@/components/header"
import { EventosContentUpdated } from "@/components/eventos-content-updated"

export default function EventosPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <EventosContentUpdated />
      </div>
    </>
  )
}

