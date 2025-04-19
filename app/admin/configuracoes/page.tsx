"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)

    // Simulate API call teste
    setTimeout(() => {
      setSaving(false)
      toast.success("Configurações salvas com sucesso")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Plataforma</CardTitle>
              <CardDescription>Configure as informações básicas da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Nome da Plataforma</Label>
                <Input id="platform-name" defaultValue="FletoAds" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform-description">Descrição</Label>
                <Textarea
                  id="platform-description"
                  defaultValue="Plataforma de criação e gerenciamento de panfletos digitais"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contato</Label>
                <Input id="contact-email" type="email" defaultValue="contato@fletoads.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Email de Suporte</Label>
                <Input id="support-email" type="email" defaultValue="suporte@fletoads.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Conta</CardTitle>
              <CardDescription>Gerencie as configurações de conta dos usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Registro de Usuários</Label>
                  <p className="text-sm text-muted-foreground">Habilitar registro de novos usuários na plataforma</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Verificação de Email</Label>
                  <p className="text-sm text-muted-foreground">Exigir verificação de email para novos usuários</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Período de Teste</Label>
                  <p className="text-sm text-muted-foreground">Oferecer período de teste para novos usuários</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trial-days">Dias de Teste</Label>
                <Input id="trial-days" type="number" defaultValue="14" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="aparencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tema e Cores</CardTitle>
              <CardDescription>Personalize a aparência da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Cor Primária</Label>
                <div className="flex items-center gap-2">
                  <Input id="primary-color" defaultValue="#3b82f6" />
                  <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: "#3b82f6" }} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Cor Secundária</Label>
                <div className="flex items-center gap-2">
                  <Input id="secondary-color" defaultValue="#10b981" />
                  <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: "#10b981" }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">Habilitar modo escuro para todos os usuários</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Personalização</Label>
                  <p className="text-sm text-muted-foreground">Permitir que usuários personalizem suas interfaces</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Email</CardTitle>
              <CardDescription>Configure as notificações por email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input id="smtp-host" defaultValue="smtp.example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-port">Porta SMTP</Label>
                <Input id="smtp-port" defaultValue="587" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-user">Usuário SMTP</Label>
                <Input id="smtp-user" defaultValue="notificacoes@fletoads.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-password">Senha SMTP</Label>
                <Input id="smtp-password" type="password" defaultValue="********" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="avancado" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>Configurações avançadas da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Chave de API</Label>
                <div className="flex gap-2">
                  <Input id="api-key" defaultValue="sk_live_51NzT7QKG8J3KLzX9iZkT7Y6rP" readOnly />
                  <Button variant="outline">Regenerar</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL de Webhook</Label>
                <Input id="webhook-url" defaultValue="https://fletoads.com/api/webhook" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">Ativar modo de manutenção para todos os usuários</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logs Detalhados</Label>
                  <p className="text-sm text-muted-foreground">Habilitar logs detalhados para depuração</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

