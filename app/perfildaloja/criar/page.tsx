import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { LojaEditForm } from "@/components/perfil/loja-edit-form"

export const metadata = {
  title: "Criar Loja | FletoAds",
  description: "Crie sua loja para começar a usar todos os recursos do FletoAds",
}

export default async function CriarLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Criar uma loja vazia para o formulário de criação
  const lojaVazia = {
    _id: "",
    nome: "",
    descricao: "",
    endereco: "",
    telefone: "",
    email: "",
    website: "",
    horarioFuncionamento: "",
    dataFundacao: "",
    numeroFuncionarios: "",
    redesSociais: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    ativo: true,
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Loja</h1>
      <LojaEditForm loja={lojaVazia} isCriacao={true} />
    </div>
  )
}

