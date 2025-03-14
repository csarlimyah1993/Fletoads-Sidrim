"use client"

import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ConfiguracoesVitrineContent() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Configurações</h1>
          <p className="text-gray-500 mb-6">Configure as opções gerais da sua loja e produtos.</p>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="store-name">Nome da Loja</Label>
                    <p className="text-sm text-gray-500">Nome que aparecerá para seus clientes</p>
                  </div>
                  <Input id="store-name" className="w-1/2" defaultValue="Loja de Calçados" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <p className="text-sm text-gray-500">Moeda padrão para seus produtos</p>
                  </div>
                  <Select defaultValue="brl">
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="Selecione uma moeda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brl">Real Brasileiro (R$)</SelectItem>
                      <SelectItem value="usd">Dólar Americano ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-gray-500">Ativar modo de manutenção para sua loja</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Configurações de Checkout</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Checkout em uma página</Label>
                    <p className="text-sm text-gray-500">Mostrar todo o processo de checkout em uma única página</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Termos e Condições</Label>
                    <p className="text-sm text-gray-500">Exigir aceitação dos termos e condições</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cupons no Checkout</Label>
                    <p className="text-sm text-gray-500">Permitir uso de cupons durante o checkout</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>Salvar Configurações</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

