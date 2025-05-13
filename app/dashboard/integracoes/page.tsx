import type { Metadata } from "next"
import IntegracoesPage from "./integracoes-page"

export const metadata: Metadata = {
  title: "Integrações | FletoAds",
  description: "Gerencie suas integrações com outras plataformas",
}

export default function IntegracoesPageWrapper() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-6">
          <IntegracoesPage />
        </div>
      </main>
    </div>
  )

// Adicionar estado para controle do modal de confirmação de exclusão e da instância a ser deletada
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [instanceToDelete, setInstanceToDelete] = useState<any>(null)
const [isDeletingInstance, setIsDeletingInstance] = useState(false)

// Função para deletar instância WhatsApp
const handleDeleteWhatsappInstance = async (instance: any) => {
  setIsDeletingInstance(true)
  try {
    const response = await fetch(`/api/integracoes/whatsapp/${instance._id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Erro ao excluir instância")
    }
    // Atualizar lista local removendo a instância deletada
    setIntegracoesAtivas((prev) => prev.filter((i) => i._id !== instance._id))
    toast.success("Instância excluída com sucesso!")
    setDeleteDialogOpen(false)
    setInstanceToDelete(null)
  } catch (error: any) {
    toast.error(error.message || "Erro ao excluir instância")
  } finally {
    setIsDeletingInstance(false)
  }
}

// Renderização das integrações do WhatsApp (exemplo, adapte conforme sua estrutura)
{integracoesAtivas
  .filter((i) => i.tipo === "whatsapp")
  .map((instance) => (
    <Card key={instance._id} className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
              <img src="/whatsapp-logo.svg" alt="WhatsApp" className="w-full h-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center">{instance.nomeInstancia}</CardTitle>
              <CardDescription>{instance.status}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">Integração WhatsApp</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
          onClick={() => {
            if (instance.status === "conectado") {
              setInstanceToDelete(instance)
              setDeleteDialogOpen(true)
            } else {
              handleDeleteWhatsappInstance(instance)
            }
          }}
          disabled={isDeletingInstance}
        >
          Excluir
        </Button>
      </CardFooter>
    </Card>
  ))}

{/* Modal de confirmação para instância conectada */}
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Excluir Instância Conectada</DialogTitle>
      <DialogDescription>
        Esta instância está conectada. Ao excluir, você perderá todos os dados relacionados à integração. Tem certeza que deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isDeletingInstance}>
        Cancelar
      </Button>
      <Button
        variant="destructive"
        onClick={() => instanceToDelete && handleDeleteWhatsappInstance(instanceToDelete)}
        disabled={isDeletingInstance}
      >
        {isDeletingInstance ? "Excluindo..." : "Excluir Instância"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
}
