// d:\Workspace\Fleto-v10\Fletoads-Sidrim\components\crm\client-form.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Client, ClientOrigin, ClientSentiment, ProductInterest, CrmStage } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';

interface ClientFormProps {
  client?: Client | null; // Client data for editing, null or undefined for new client
  onSave: (client: Client) => void;
  onCancel: () => void;
}

const ClientFormComponent: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [productInterests, setProductInterests] = useState<Partial<ProductInterest>[]>([]);

  useEffect(() => {
    if (client) {
      setFormData(client);
      setProductInterests(client.interessesProdutos || []);
    } else {
      // Default values for a new client
      setFormData({
        origem: 'whatsapp',
        sentimentoIA: 'nao_analisado',
        etapaAtualCRM: 'lead', // Default stage
        valorTotalNegociado: 0,
        tags: [],
      });
      setProductInterests([]);
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleProductInterestChange = (index: number, field: keyof ProductInterest, value: string | number) => {
    const updatedInterests = [...productInterests];
    updatedInterests[index] = { ...updatedInterests[index], [field]: value };
    setProductInterests(updatedInterests);
  };

  const addProductInterest = () => {
    setProductInterests([...productInterests, { nome: '', valorEstimado: 0, notas: '' }]);
  };

  const removeProductInterest = (index: number) => {
    setProductInterests(productInterests.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const finalClientData: Client = {
      id: formData.id || `client_${Date.now()}`,
      nome: formData.nome || '',
      email: formData.email,
      telefone: formData.telefone,
      empresa: formData.empresa,
      dataCriacao: formData.dataCriacao || now,
      ultimaAtualizacao: now,
      origem: formData.origem || 'outro',
      origemDetalhes: formData.origem === 'outro' ? formData.origemDetalhes : undefined,
      tags: formData.tags || [],
      sentimentoIA: formData.sentimentoIA || 'nao_analisado',
      interessesProdutos: productInterests.filter(p => p.nome).map(p => ({
        id: p.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: p.nome || '',
        valorEstimado: Number(p.valorEstimado) || 0,
        notas: p.notas
      })),
      etapaAtualCRM: formData.etapaAtualCRM || 'lead',
      // Calculate valorTotalNegociado based on interests or manual input if needed
      valorTotalNegociado: productInterests.reduce((sum, p) => sum + (Number(p.valorEstimado) || 0), 0),
      responsavelId: formData.responsavelId,
      notasGerais: formData.notasGerais,
      // historicoSentimento and historicoEtapasCRM would be managed by backend or more complex logic
    };
    onSave(finalClientData);
  };

  const clientOrigins: { value: ClientOrigin; label: string }[] = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'site', label: 'Site' },
    { value: 'feira', label: 'Feira/Evento' },
    { value: 'indicacao', label: 'Indicação' },
    { value: 'outro', label: 'Outro' },
  ];

  // Mock stages - in a real app, these would come from config or API
  const crmStages: { id: string; nome: string }[] = [
    { id: 'lead', nome: 'Lead' },
    { id: 'contato-inicial', nome: 'Contato Inicial' },
    { id: 'qualificacao', nome: 'Qualificação' },
    { id: 'proposta-enviada', nome: 'Proposta Enviada' },
    { id: 'negociacao', nome: 'Negociação' },
    { id: 'fechado-ganho', nome: 'Fechado (Ganho)' },
    { id: 'fechado-perdido', nome: 'Fechado (Perdido)' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo*</Label>
              <Input id="nome" name="nome" value={formData.nome || ''} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" value={formData.telefone || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input id="empresa" name="empresa" value={formData.empresa || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origem">Origem*</Label>
              <Select name="origem" value={formData.origem || ''} onValueChange={(value) => handleSelectChange('origem', value)} required>
                <SelectTrigger id="origem">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  {clientOrigins.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.origem === 'outro' && (
              <div>
                <Label htmlFor="origemDetalhes">Detalhes da Origem</Label>
                <Input id="origemDetalhes" name="origemDetalhes" value={formData.origemDetalhes || ''} onChange={handleChange} />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="etapaAtualCRM">Etapa do CRM*</Label>
            <Select name="etapaAtualCRM" value={formData.etapaAtualCRM || ''} onValueChange={(value) => handleSelectChange('etapaAtualCRM', value)} required>
              <SelectTrigger id="etapaAtualCRM">
                <SelectValue placeholder="Selecione a etapa" />
              </SelectTrigger>
              <SelectContent>
                {crmStages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input id="tags" name="tags" value={formData.tags?.join(', ') || ''} onChange={handleTagChange} />
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">Interesses em Produtos/Serviços</h3>
            {productInterests.map((interest, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border p-3 rounded-md mb-2">
                <Input 
                  placeholder="Nome do Produto/Serviço"
                  value={interest.nome || ''} 
                  onChange={(e) => handleProductInterestChange(index, 'nome', e.target.value)}
                  className="md:col-span-2"
                />
                <Input 
                  type="number"
                  placeholder="Valor Estimado"
                  value={interest.valorEstimado || ''} 
                  onChange={(e) => handleProductInterestChange(index, 'valorEstimado', parseFloat(e.target.value))}
                />
                <Textarea 
                  placeholder="Notas sobre o interesse"
                  value={interest.notas || ''} 
                  onChange={(e) => handleProductInterestChange(index, 'notas', e.target.value)}
                  className="md:col-span-3 mt-1"
                  rows={2}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeProductInterest(index)} className="text-red-500 md:col-start-3 justify-self-end">
                  <Trash2 className="h-4 w-4 mr-1" /> Remover Interesse
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addProductInterest} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Interesse
            </Button>
          </div>

          <div>
            <Label htmlFor="notasGerais">Notas Gerais</Label>
            <Textarea id="notasGerais" name="notasGerais" value={formData.notasGerais || ''} onChange={handleChange} rows={4} />
          </div>

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" /> Salvar Cliente
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ClientFormComponent;