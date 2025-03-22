"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  // Inicializa o tema com base na preferência do usuário ou localStorage
  useEffect(() => {
    // Verifica se há uma preferência salva no localStorage
    const savedTheme = localStorage.getItem("vitrine-theme") as "light" | "dark" | null

    // Se não houver, verifica a preferência do sistema
    if (!savedTheme) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(prefersDark ? "dark" : "light")
      return
    }

    setTheme(savedTheme || "light")

    // Aplica o tema ao documento
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  // Função para alternar o tema
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    // Salva a preferência no localStorage
    localStorage.setItem("vitrine-theme", newTheme)

    // Aplica o tema ao documento
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label={theme === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}

