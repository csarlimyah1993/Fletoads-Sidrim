import { Header } from "@/components/header"
import { CriarPanfletoV7Content } from "@/components/criar-panfleto-v7-content"

export default function CriarPanfletoV7Page() {
  return (
    <>
      <Header />
      <div className="p-4">
        <CriarPanfletoV7Content />
      </div>
    </>
  )
}

