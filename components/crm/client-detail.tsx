// d:\Workspace\Fleto-v10\Fletoads-Sidrim\components\crm\client-detail.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Client, ClientInteraction, ProductInterest, CrmStage, ClientSentiment } from './types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, PlusCircle, MessageSquare, ShoppingBag, DollarSign, Smile, Meh, Frown, HelpCircle, User, Briefcase, Mail, Phone, CalendarDays, Tag, BarChart3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
  onEdit: (client: Client) => void;
  // Optional: Pass API functions if needed, or ClientDetailComponent can fetch its own data
  // getClientById: (id: string) => Promise<Client | null>; 
  // addInteractionToApi: (interaction: ClientInteraction) => Promise<ClientInteraction>;
}

// Mock data can be removed or commented out once API integration is complete
/*
const mockClientDetail: Client = {
  id: '1',
  nome: 'João Silva',
  email: 'joao.silva@example.com',
  telefone: '(11) 98765-4321',
  empresa: 'Empresa Alpha',
  dataCriacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  ultimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  origem: 'whatsapp',
  tags: ['VIP', 'Lead Quente', 'Produto X Interessado'],
  sentimentoIA: 'positivo',
  historicoSentimento: [
    { data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), sentimento: 'neutro', nota: 'Primeiro contato' },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), sentimento: 'positivo', nota: 'Demonstrou interesse na demo' },
  ],
  interessesProdutos: [
    { id: 'prod1', nome: 'Produto X', valorEstimado: 1500, notas: 'Precisa de customização Y' },
    { id: 'prod2', nome: 'Serviço Z', valorEstimado: 750, notas: 'Avaliar após Produto X' },
  ],
  etapaAtualCRM: 'proposta-enviada',
  historicoEtapasCRM: [
    { id: 'lead', nome: 'Lead', valorNegociado: 0, ordem: 1 },
    { id: 'contato-inicial', nome: 'Contato Inicial', valorNegociado: 0, ordem: 2 },
    { id: 'qualificacao', nome: 'Qualificação', valorNegociado: 1500, ordem: 3 },
    { id: 'proposta-enviada', nome: 'Proposta Enviada', valorNegociado: 1500, ordem: 4 },
  ],
  valorTotalNegociado: 1500,
  responsavelId: 'user123',
  notasGerais: 'Cliente estratégico, potencial de expansão. Acompanhar de perto após a proposta.',
};

const mockInteractions: ClientInteraction[] = [
  {
    id: 'int1',
    clientId: '1',
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'chat',
    conteudo: 'Cliente entrou em contato pelo WhatsApp perguntando sobre o Produto X.',
    sentimentoAnalisado: 'neutro',
  },
  {
    id: 'int2',
    clientId: '1',
    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'ligacao',
    conteudo: 'Ligação para apresentar a empresa e entender melhor as necessidades. Agendada demo.',
    sentimentoAnalisado: 'positivo',
  },
  {
    id: 'int3', 
    clientId: '1',
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'email',
    conteudo: 'Email enviado com resumo da demo e proposta comercial anexada.',
    sentimentoAnalisado: 'positivo',
  },
];
*/

const ClientDetailComponent: React.FC<ClientDetailProps> = ({ clientId, onBack, onEdit }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]); // Assuming interactions might be part of client object or fetched separately
  const [newInteractionContent, setNewInteractionContent] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<'chat' | 'email' | 'ligacao' | 'nota'>('nota');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define API functions directly or use passed ones
  const api = {
    getClientById: async (id: string): Promise<Client | null> => {
      const response = await fetch(`/api/crm/clients/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Falha ao buscar detalhes do cliente.');
      }
      return response.json();
    },
    // Example: addInteraction might be part of a client update or a separate endpoint
    addInteraction: async (clientId: string, interactionData: Omit<ClientInteraction, 'id' | 'clientId' | 'data'>): Promise<ClientInteraction> => {
      // This is a placeholder. You'd typically POST to an interactions endpoint or update the client.
      // For now, let's assume interactions are part of the client object and we PUT the whole client.
      // This is NOT ideal for production but simplifies the mock.
      const currentClient = await api.getClientById(clientId);
      if (!currentClient) throw new Error ("Client not found for adding interaction");

      const newInteraction: ClientInteraction = {
        id: `int_${Date.now()}`,
        clientId: clientId,
        data: new Date().toISOString(),
        ...interactionData
      };
      
      const updatedInteractions = [newInteraction, ...(currentClient.interactions || [])];
      // Update client with new interaction (mocking this part)
      // In a real scenario, you might have a specific endpoint: POST /api/crm/clients/${clientId}/interactions
      // Or update the client object: PUT /api/crm/clients/${clientId}
      console.log("Simulating saving interaction by updating client...", updatedInteractions);
      // For this example, we'll just return the new interaction and expect parent to handle state
      return newInteraction; 
      // If interactions are part of the client object that's saved:
      // const updatedClient = { ...currentClient, interactions: updatedInteractions };
      // const response = await fetch(`/api/crm/clients/${clientId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedClient),
      // });
      // if (!response.ok) throw new Error('Failed to save interaction by updating client');
      // const savedClient = await response.json();
      // return savedClient.interactions.find(i => i.id === newInteraction.id) || newInteraction;
    }
  };

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) return;
      setIsLoading(true);
      setError(null);
      try {
        const fetchedClient = await api.getClientById(clientId);
        if (fetchedClient) {
          setClient(fetchedClient);
          setInteractions(fetchedClient.interactions || []); // Assuming interactions are part of client data
        } else {
          setError('Cliente não encontrado.');
        }
      } catch (err) {
        console.error("Error fetching client details:", err);
        setError((err as Error).message || 'Ocorreu um erro ao buscar o cliente.');
      }
      setIsLoading(false);
    };

    fetchClientDetails();
  }, [clientId]);

  const handleAddInteraction = async () => {
    if (!newInteractionContent.trim() || !client) return;
    try {
      // This is a simplified interaction addition. 
      // A real app might POST to /api/crm/clients/:clientId/interactions
      // or update the client object with the new interaction.
      const interactionData = {
        tipo: newInteractionType,
        conteudo: newInteractionContent,
        // sentimentoAnalisado: 'nao_analisado', // IA would analyze this later
      };
      // const savedInteraction = await api.addInteraction(client.id, interactionData);
      // For now, just add to local state and simulate
      const newMockInteraction: ClientInteraction = {
        id: `int_mock_${Date.now()}`,
        clientId: client.id,
        data: new Date().toISOString(),
        tipo: newInteractionType,
        conteudo: newInteractionContent,
      };
      setInteractions([newMockInteraction, ...interactions]);
      setNewInteractionContent('');
      alert('Interação adicionada (localmente)! API call simulada.');
      // TODO: Persist interaction via API and refresh client data or interactions list if necessary
    } catch (err) {
      console.error("Error adding interaction:", err);
      alert(`Erro ao adicionar interação: ${(err as Error).message}`);
    }
  };

  const getSentimentIcon = (sentiment?: ClientSentiment, size: string = "h-5 w-5") => {
  id: '1',
  nome: 'João Silva',
  email: 'joao.silva@example.com',
  telefone: '(11) 98765-4321',
  empresa: 'Empresa Alpha',
  dataCriacao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  ultimaAtualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  origem: 'whatsapp',
  tags: ['VIP', 'Lead Quente', 'Produto X Interessado'],
  sentimentoIA: 'positivo',
  historicoSentimento: [
    { data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), sentimento: 'neutro', nota: 'Primeiro contato' },
    { data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), sentimento: 'positivo', nota: 'Demonstrou interesse na demo' },
  ],
  interessesProdutos: [
    { id: 'prod1', nome: 'Produto X', valorEstimado: 1500, notas: 'Precisa de customização Y' },
    { id: 'prod2', nome: 'Serviço Z', valorEstimado: 750, notas: 'Avaliar após Produto X' },
  ],
  etapaAtualCRM: 'proposta-enviada',
  historicoEtapasCRM: [
    { id: 'lead', nome: 'Lead', valorNegociado: 0, ordem: 1 },
    { id: 'contato-inicial', nome: 'Contato Inicial', valorNegociado: 0, ordem: 2 },
    { id: 'qualificacao', nome: 'Qualificação', valorNegociado: 1500, ordem: 3 },
    { id: 'proposta-enviada', nome: 'Proposta Enviada', valorNegociado: 1500, ordem: 4 },
  ],
  valorTotalNegociado: 1500,
  responsavelId: 'user123',
  notasGerais: 'Cliente estratégico, potencial de expansão. Acompanhar de perto após a proposta.',
};

const mockInteractions: ClientInteraction[] = [
  {
    id: 'int1',
    clientId: '1',
    data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'chat',
    conteudo: 'Cliente entrou em contato pelo WhatsApp perguntando sobre o Produto X.',
    sentimentoAnalisado: 'neutro',
  },
  {
    id: 'int2',
    clientId: '1',
    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'ligacao',
    conteudo: 'Ligação para apresentar a empresa e entender melhor as necessidades. Agendada demo.',
    sentimentoAnalisado: 'positivo',
  },
  {
    id: 'int3', 
    clientId: '1',
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tipo: 'email',
    conteudo: 'Email enviado com resumo da demo e proposta comercial anexada.',
    sentimentoAnalisado: 'positivo',
  },
];

const ClientDetailComponent: React.FC<ClientDetailProps> = ({ clientId, onBack, onEdit }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [newInteractionContent, setNewInteractionContent] = useState('');
  const [newInteractionType, setNewInteractionType] = useState<'chat' | 'email' | 'ligacao' | 'nota'>('nota');

  // useEffect to fetch data is now above, using api.getClientById

// handleAddInteraction is now async and uses the api object (commented out for full API call)

  const getSentimentIcon = (sentiment?: ClientSentiment, size: string = "h-5 w-5") => {
    switch (sentiment) {
      case 'positivo': return <Smile className={`${size} text-green-500`} />;
      case 'neutro': return <Meh className={`${size} text-yellow-500`} />;
      case 'negativo': return <Frown className={`${size} text-red-500`} />;
      default: return <HelpCircle className={`${size} text-gray-400`} />;
    }
  };

  const getOriginText = (origin: ClientOrigin, details?: string) => {
    const origins: Record<ClientOrigin, string> = {
        whatsapp: 'WhatsApp',
        instagram: 'Instagram',
        site: 'Site',
        feira: 'Feira/Evento',
        indicacao: 'Indicação',
        outro: 'Outro'
    }
    if (origin === 'outro' && details) {
        return `${origins[origin]} (${details})`;
    }
    return origins[origin] || 'Desconhecida';
  }

  const getStageName = (stageId: string) => {
    // This should ideally come from a shared config or API
    const stage = client?.historicoEtapasCRM?.find(s => s.id === stageId);
    return stage?.nome || stageId;
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando dados do cliente...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro: {error} <Button onClick={onBack} variant="link">Voltar</Button></div>;
  }

  if (!client) {
    return <div className="p-4 text-center">Cliente não encontrado. <Button onClick={onBack} variant="link">Voltar</Button></div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
            </Button>
            <CardTitle className="flex items-center">
              {getSentimentIcon(client.sentimentoIA, "h-7 w-7 mr-2")} {client.nome}
            </CardTitle>
            <CardDescription>
              {client.empresa ? `${client.empresa} - ` : ''}
              <a href={`mailto:${client.email}`} className="text-blue-500 hover:underline">{client.email}</a>
              {client.telefone ? ` - ${client.telefone}` : ''}
            </CardDescription>
          </div>
          <Button onClick={() => onEdit(client)}><Edit className="mr-2 h-4 w-4" /> Editar Cliente</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="interacoes">Interações</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="produtos">Interesses</TabsTrigger>
            <TabsTrigger value="pipeline">Funil & Valores</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Informações Básicas</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong><Mail className="inline mr-1 h-4 w-4" />Email:</strong> {client.email || 'N/A'}</p>
                  <p><strong><Phone className="inline mr-1 h-4 w-4" />Telefone:</strong> {client.telefone || 'N/A'}</p>
                  <p><strong><Briefcase className="inline mr-1 h-4 w-4" />Empresa:</strong> {client.empresa || 'N/A'}</p>
                  <p><strong><Tag className="inline mr-1 h-4 w-4" />Origem:</strong> {getOriginText(client.origem, client.origemDetalhes)}</p>
                  <p><strong><CalendarDays className="inline mr-1 h-4 w-4" />Cliente desde:</strong> {new Date(client.dataCriacao).toLocaleDateString('pt-BR')}</p>
                  <p><strong><CalendarDays className="inline mr-1 h-4 w-4" />Última Atualização:</strong> {new Date(client.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
                  <div><strong>Tags:</strong> {client.tags?.map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>) || 'Nenhuma'}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary"/>Status CRM</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Etapa Atual:</strong> <Badge variant={client.etapaAtualCRM.includes('fechado') ? (client.etapaAtualCRM.includes('ganho') ? 'success' : 'destructive') : 'default'}>{getStageName(client.etapaAtualCRM)}</Badge></p>
                  <p><strong>Sentimento (IA):</strong> {getSentimentIcon(client.sentimentoIA)} {client.sentimentoIA || 'Não analisado'}</p>
                  <p><strong>Valor Total Negociado:</strong> <span className="font-semibold text-green-600">R$ {client.valorTotalNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                  <p><strong>Responsável:</strong> {client.responsavelId || 'N/A'}</p> 
                  {client.notasGerais && (
                    <>
                        <Separator className="my-2" />
                        <p className="font-semibold">Notas Gerais:</p>
                        <p className="text-xs p-2 bg-muted rounded whitespace-pre-wrap">{client.notasGerais}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="interactions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary"/>Histórico de Interações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <Select value={newInteractionType} onValueChange={(v) => setNewInteractionType(v as 'chat' | 'email' | 'ligacao' | 'nota')}>
                    <SelectTrigger><SelectValue placeholder="Tipo de Interação" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nota">Nota Interna</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="ligacao">Ligação</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea 
                    placeholder={`Adicionar ${newInteractionType === 'nota' ? 'uma nota' : 'um registro de ' + newInteractionType}...`}
                    value={newInteractionContent}
                    onChange={(e) => setNewInteractionContent(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddInteraction} disabled={!newInteractionContent.trim()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Interação
                  </Button>
                </div>
                <Separator />
                <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                  {(client.interactions?.length || interactions.length) === 0 && <p className="text-muted-foreground">Nenhuma interação registrada.</p>}
                  {/* Display interactions from client.interactions or local interactions state */}
                  {(client.interactions || interactions).map(interaction => (
                  {interactions.map(interaction => (
                    <div key={interaction.id} className="p-3 border rounded-md bg-card-foreground/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold capitalize">{interaction.tipo} - {new Date(interaction.data).toLocaleString('pt-BR')}</span>
                        {interaction.sentimentoAnalisado && getSentimentIcon(interaction.sentimentoAnalisado)}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{interaction.conteudo}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de WhatsApp */}
          <TabsContent value="whatsapp" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
                  Conversas do WhatsApp
                </CardTitle>
                <CardDescription>Histórico de mensagens trocadas pelo WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && !client ? (
                  <p>Carregando mensagens...</p>
                ) : error && error.includes('WhatsApp') ? (
                  <p className="text-destructive">{error}</p>
                ) : whatsappMessages.length > 0 ? (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {whatsappMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${msg.sender === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'agent' ? 'text-right' : 'text-left'} text-muted-foreground`}>
                            {new Date(msg.timestamp).toLocaleString('pt-BR')} {msg.status && `(${msg.status})`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma mensagem do WhatsApp encontrada para este cliente.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Interesses em Produtos */}
          <TabsContent value="produtos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>Interesses em Produtos/Serviços</CardTitle>
                {/* TODO: Add button to add new product interest */} 
              </CardHeader>
              <CardContent>
                {client.interessesProdutos?.length === 0 || !client.interessesProdutos ? (
                  <p className="text-muted-foreground">Nenhum interesse em produto registrado.</p>
                ) : (
                  <ul className="space-y-3">
                    {client.interessesProdutos.map(interest => (
                      <li key={interest.id} className="p-3 border rounded-md">
                        <div className="font-semibold">{interest.nome}</div>
                        {interest.valorEstimado && <p className="text-sm text-green-600">Valor Estimado: R$ {interest.valorEstimado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>}
                        {interest.notas && <p className="text-xs text-muted-foreground mt-1">Notas: {interest.notas}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipeline">
            <Card>
                <CardHeader><CardTitle className="text-lg flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Histórico no Funil de Vendas</CardTitle></CardHeader>
                <CardContent>
                    {client.historicoEtapasCRM?.length === 0 || !client.historicoEtapasCRM ? (
                        <p className="text-muted-foreground">Nenhum histórico de etapas no funil.</p>
                    ) : (
                        <div className="space-y-2">
                            {client.historicoEtapasCRM.sort((a,b) => a.ordem - b.ordem).map(stage => (
                                <div key={stage.id} className={`p-3 border rounded-md ${client.etapaAtualCRM === stage.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{stage.nome}</span>
                                        <Badge variant={client.etapaAtualCRM === stage.id ? 'default' : 'outline'}>Ordem: {stage.ordem}</Badge>
                                    </div>
                                    <p className="text-sm text-green-600">Valor Negociado na Etapa: R$ {stage.valorNegociado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                    {/* TODO: Add date of entry/exit from stage */} 
                                </div>
                            ))}
                        </div>
                    )}
                    <Separator className="my-4" />
                    <div className="text-right font-bold text-lg">
                        Valor Total Consolidado: R$ {client.valorTotalNegociado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Cliente ID: {client.id}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ClientDetailComponent;