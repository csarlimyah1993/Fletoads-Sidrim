"use client"

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface CriarPanfletoButtonProps extends ButtonProps {
  eventoId?: string
  variant?: "default" | "outline" | "ghost"
  showIcon?: boolean
}

export function CriarPanfletoButton({
  eventoId,
  variant = "default",
  showIcon = true,
  className,
  children,
  ...props
}: CriarPanfletoButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    const url = eventoId ? `/panfletos/criar/v7?evento=${eventoId}` : "/panfletos/criar/v7"

    console.log(`Navegando para: ${url}`)
    router.push(url)
  }

  return (
    <Button variant={variant} className={className} onClick={handleClick} {...props}>
      {showIcon && <Plus className="h-4 w-4 mr-2" />}
      {children || "Criar Panfleto"}
    </Button>
  )
}

