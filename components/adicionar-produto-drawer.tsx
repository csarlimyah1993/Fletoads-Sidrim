"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// Adicionar a importação do ícone Plus no topo do arquivo, junto com os outros imports
import { Plus } from "lucide-react"
import { motion } from "framer-motion"

interface AdicionarProdutoDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdicionarProdutoDrawer({ open, onOpenChange }: AdicionarProdutoDrawerProps) {
  const [tipoProduto, setTipoProduto] = useState("produto")
  const [possuiLoginSenha, setPossuiLoginSenha] = useState(false)
  const [cienteRegras, setCienteRegras] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Implementar lógica para salvar o produto
    console.log("Produto salvo")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90vw] max-w-[800px] sm:max-w-[800px] overflow-y-auto p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Adicionar Produto</SheetTitle>
          <SheetDescription>Preencha as informações para adicionar um novo produto à sua vitrine.</SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b">
            <div className="px-4 overflow-x-auto">
              <TabsList className="h-12">
                <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
                <TabsTrigger value="precos">Preços e Estoque</TabsTrigger>
                <TabsTrigger value="variacoes">Variações</TabsTrigger>
                <TabsTrigger value="imagens">Imagens</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <TabsContent value="informacoes">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Tipo de produto */}
                <div className="space-y-3">
                  <Label className="text-base">Selecione o tipo do seu produto</Label>
                  <RadioGroup value={tipoProduto} onValueChange={setTipoProduto} className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="produto" id="produto" />
                      <Label htmlFor="produto" className="font-normal">
                        Produtos / venda presencial
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="servico" id="servico" />
                      <Label htmlFor="servico" className="font-normal">
                        Serviço
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="link" id="link" />
                      <Label htmlFor="link" className="font-normal">
                        Links de pagamento
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator className="my-6" />

                {/* Informações externas */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Informações externas</h3>
                  <p className="text-sm text-gray-500">Serão disponibilizadas para os compradores</p>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="nome">Nome do produto</Label>
                      <Input id="nome" placeholder="Ex: Tênis Casual Masculino" />
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição breve</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva seu produto em poucas palavras..."
                        className="h-20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select>
                        <SelectTrigger id="categoria">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calcados">Calçados</SelectItem>
                          <SelectItem value="roupas">Roupas</SelectItem>
                          <SelectItem value="acessorios">Acessórios</SelectItem>
                          <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                          <SelectItem value="servicos">Serviços</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="idioma">Idioma principal</Label>
                      <Input id="idioma" value="Português" disabled />
                    </div>

                    <div>
                      <Label htmlFor="moeda">Moeda base</Label>
                      <Input id="moeda" value="Real (R$)" disabled />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Informações internas */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Informações internas</h3>
                  <p className="text-sm text-gray-500">Serão usadas pela nossa equipe para avaliar o seu produto</p>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="info-complementares">Informações complementares</Label>
                      <Textarea
                        id="info-complementares"
                        placeholder="Adicione informações importantes sobre seu produto..."
                        className="h-20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="pagina-vendas">Página de vendas (onde está sua oferta)</Label>
                      <Input id="pagina-vendas" placeholder="https://" />
                    </div>

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="login-senha"
                        checked={possuiLoginSenha}
                        onCheckedChange={(checked) => setPossuiLoginSenha(checked as boolean)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="login-senha" className="font-normal">
                          O seu produto entregue possui login e senha?
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="precos">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Preços e Estoque</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preco-original">Preço Original (R$)</Label>
                      <Input id="preco-original" type="number" placeholder="349.90" />
                    </div>
                    <div>
                      <Label htmlFor="preco-promocional">Preço Promocional (R$)</Label>
                      <Input id="preco-promocional" type="number" placeholder="299.90" />
                    </div>
                    <div>
                      <Label htmlFor="custo">Custo (R$)</Label>
                      <Input id="custo" type="number" placeholder="Custo do produto" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="estoque">Estoque</Label>
                      <Input id="estoque" type="number" placeholder="Quantidade em estoque" />
                    </div>
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" placeholder="Código de referência" />
                    </div>
                    <div>
                      <Label htmlFor="codigo-barras">Código de Barras</Label>
                      <Input id="codigo-barras" placeholder="EAN / GTIN" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="variacoes">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Variações do Produto</h3>
                <p className="text-gray-500">Adicione opções como tamanhos, cores ou outros atributos.</p>
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Variações</h4>
                    <Button size="sm">Adicionar Variação</Button>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma variação cadastrada</p>
                    <p className="text-sm">Clique em "Adicionar Variação" para começar</p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="imagens">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Imagens do Produto</h3>
                <p className="text-gray-500">Adicione imagens do seu produto. A primeira imagem será a principal.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="seo">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Otimização para Motores de Busca (SEO)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="titulo-seo">Título SEO</Label>
                    <Input id="titulo-seo" placeholder="Título para SEO" />
                    <p className="text-xs text-gray-500 mt-1">Recomendado: 50-60 caracteres</p>
                  </div>
                  <div>
                    <Label htmlFor="descricao-seo">Descrição SEO</Label>
                    <Textarea id="descricao-seo" placeholder="Descrição para SEO" />
                    <p className="text-xs text-gray-500 mt-1">Recomendado: 150-160 caracteres</p>
                  </div>
                  <div>
                    <Label htmlFor="url-amigavel">URL amigável</Label>
                    <Input id="url-amigavel" placeholder="url-amigavel-do-produto" />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="configuracoes">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold">Configurações do Produto</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status do Produto</Label>
                    <Select>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="visibilidade">Visibilidade</Label>
                    <Select>
                      <SelectTrigger id="visibilidade">
                        <SelectValue placeholder="Selecione a visibilidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publico">Público</SelectItem>
                        <SelectItem value="privado">Privado</SelectItem>
                        <SelectItem value="protegido">Protegido por senha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            {/* Termos e condições */}
            <div className="flex items-start space-x-2 pt-4 border-t mt-6">
              <Checkbox
                id="termos"
                checked={cienteRegras}
                onCheckedChange={(checked) => setCienteRegras(checked as boolean)}
                required
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="termos" className="font-normal">
                  Estou ciente que o meu produto será avaliado de acordo com as Regras da Plataforma.
                </Label>
              </div>
            </div>

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!cienteRegras}>
                Salvar Produto
              </Button>
            </SheetFooter>
          </form>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

