"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function FixImagesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFixImages = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/fix-image-urls")
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Sucesso",
          description: data.message,
        })
        setResult("URLs de imagens corrigidas com sucesso!")
      } else {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive",
        })
        setResult(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error("Erro ao corrigir URLs de imagens:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao corrigir as URLs de imagens.",
        variant: "destructive",
      })
      setResult("Ocorreu um erro ao corrigir as URLs de imagens.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Corrigir URLs de Imagens</CardTitle>
          <CardDescription>
            Esta ferramenta irá corrigir todas as URLs de imagens que usam o serviço via.placeholder.com,
            substituindo-as por URLs do picsum.photos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Clique no botão abaixo para iniciar a correção. Este processo pode levar alguns segundos.
          </p>

          {result && (
            <div className={`p-4 rounded-md mb-4 ${result.includes("Erro") ? "bg-destructive/10" : "bg-primary/10"}`}>
              {result}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleFixImages} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Corrigindo URLs...
              </>
            ) : (
              "Corrigir URLs de Imagens"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

