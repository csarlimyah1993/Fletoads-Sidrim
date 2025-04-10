"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"

export function DashboardHeader() {
  const [userName, setUserName] = useState("")
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/usuario/perfil")
        if (response.ok) {
          const userData = await response.json()
          setUserName(userData.nome || "")
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      }
    }
    
    fetchUserData()
  }, [])

  return (
    <Card className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20 border-none">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">
            Bem-vindo, {userName || "Usuário"}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
