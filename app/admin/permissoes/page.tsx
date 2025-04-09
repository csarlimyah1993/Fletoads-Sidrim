import type { Metadata } from "next"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Save } from "lucide-react"

export const metadata: Metadata = {
  title: "Permissões - Admin FletoAds",
  description: "Gerenciamento de permissões de usuários",
}

interface Permissao {
  _id: string
  nome: string
  email: string
  role: string
  permissoes: {
    dashboard: boolean
    usuarios: boolean
    lojas: boolean
    produtos: boolean
    vendas: boolean
    relatorios: boolean
    configuracoes: boolean
  }
}

async function getPermissoes() {
  try {
    // Usar URL relativa
    const res = await fetch("/api/admin/permissoes", {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      throw new Error(`Falha ao carregar permissões: ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error("Erro ao buscar permissões:", error)
    return { permissoes: [] }
  }
}

export default async function PermissoesPage() {
  const { permissoes } = await getPermissoes()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Dashboard</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Lojas</TableHead>
              <TableHead>Produtos</TableHead>
              <TableHead>Vendas</TableHead>
              <TableHead>Relatórios</TableHead>
              <TableHead>Configurações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissoes && permissoes.length > 0 ? (
              permissoes.map((permissao: Permissao) => (
                <TableRow key={permissao._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{permissao.nome}</div>
                      <div className="text-sm text-muted-foreground">{permissao.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={permissao.role === "admin" ? "default" : "outline"}>
                      {permissao.role === "admin" ? "Administrador" : "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`dashboard-${permissao._id}`}
                      defaultChecked={permissao.permissoes.dashboard}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`usuarios-${permissao._id}`}
                      defaultChecked={permissao.permissoes.usuarios}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`lojas-${permissao._id}`}
                      defaultChecked={permissao.permissoes.lojas}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`produtos-${permissao._id}`}
                      defaultChecked={permissao.permissoes.produtos}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`vendas-${permissao._id}`}
                      defaultChecked={permissao.permissoes.vendas}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`relatorios-${permissao._id}`}
                      defaultChecked={permissao.permissoes.relatorios}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      id={`configuracoes-${permissao._id}`}
                      defaultChecked={permissao.permissoes.configuracoes}
                      disabled={permissao.role === "admin"}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Nota: As permissões de administradores não podem ser alteradas.</p>
      </div>
    </div>
  )
}

