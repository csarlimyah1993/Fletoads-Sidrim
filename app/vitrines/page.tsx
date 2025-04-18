// app/vitrines/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'

type VitrineType = {
  _id: string
  nome: string
  cidade: string
  estado: string
  categoria: string
  imagem: string
}

export default function VitrinesPage() {
  const [vitrines, setVitrines] = useState<VitrineType[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get('/api/vitrines-ativas')
        setVitrines(data)
      } catch (error) {
        console.error('Erro ao buscar vitrines:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const vitrinesFiltradas = vitrines.filter((vitrine) => {
    return (
      (filtroEstado ? vitrine.estado === filtroEstado : true) &&
      (filtroCategoria ? vitrine.categoria === filtroCategoria : true)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Vitrines Ativas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Filtrar por estado (ex: CE)"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value.toUpperCase())}
          className="w-48"
        />
        <Input
          placeholder="Filtrar por categoria (ex: Moda)"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="w-64"
        />
        <Button variant="outline" onClick={() => {
          setFiltroEstado('')
          setFiltroCategoria('')
        }}>
          Limpar filtros
        </Button>
      </div>

      {/* Lista de vitrines */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : vitrinesFiltradas.length === 0 ? (
        <p>Nenhuma vitrine encontrada com os filtros atuais.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {vitrinesFiltradas.map((vitrine) => (
            <Card key={vitrine._id}>
              <img
                src={vitrine.imagem || '/placeholder.png'}
                alt={vitrine.nome}
                className="w-full h-40 object-cover rounded-t-xl"
              />
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold">{vitrine.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  {vitrine.cidade}, {vitrine.estado}
                </p>
                <Badge variant="secondary" className="mt-2">{vitrine.categoria}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
