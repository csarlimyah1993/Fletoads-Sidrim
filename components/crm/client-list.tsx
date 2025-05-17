// d:\Workspace\Fleto-v10\Fletoads-Sidrim\components\crm\client-list.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Client, CrmStage, ProductInterest, ClientOrigin, ClientSentiment } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, Edit, Trash2, Filter, Search, DollarSign, Smile, Meh, Frown, HelpCircle, ShoppingBag, Tag, CalendarDays, Briefcase, Phone, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClientListProps {
  clients: Client[];
  onAddNewClient: () => void;
  onViewDetails: (clientId: string) => void;
  onEditRequest: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  refreshClients: () => void; // To refresh data if needed after an action
}

const ClientListComponent: React.FC<ClientListProps> = ({
  clients,
  onAddNewClient,
  onViewDetails,
  onEditRequest,
  onDeleteClient,
  refreshClients
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState<ClientOrigin | 'todos'>('todos');
  const [filterStage, setFilterStage] = useState<string | 'todos'>('todos');

  // Clients are now passed as props, no need for local state or useEffect to fetch them here.

  const filteredClients = clients.filter(client => {
    const matchesSearchTerm = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (client.empresa && client.empresa.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesOrigin = filterOrigin === 'todos' || client.origem === filterOrigin;
    const matchesStage = filterStage === 'todos' || client.etapaAtualCRM === filterStage;
    return matchesSearchTerm && matchesOrigin && matchesStage;
  });

  const getSentimentIcon = (sentiment?: ClientSentiment) => {
    switch (sentiment) {
      case 'positivo': return <Smile className="h-5 w-5 text-green-500" />;
      case 'neutro': return <Meh className="h-5 w-5 text-yellow-500" />;
      case 'negativo': return <Frown className="h-5 w-5 text-red-500" />;
      default: return <HelpCircle className="h-5 w-5 text-gray-400" />;
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

  // TODO: Replace with actual stage names from API or config
  const getStageName = (stageId: string) => {
    const stages: Record<string, string> = {
      'lead': 'Lead',
      'contato-inicial': 'Contato Inicial',
      'qualificacao': 'Qualificação',
      'proposta-enviada': 'Proposta Enviada',
      'negociacao': 'Negociação',
      'fechado-ganho': 'Fechado (Ganho)',
      'fechado-perdido': 'Fechado (Perdido)',
    };
    return stages[stageId] || stageId;
  };

  const uniqueOrigins: ClientOrigin[] = Array.from(new Set(clients.map(c => c.origem)));
  const uniqueStages: string[] = Array.from(new Set(clients.map(c => c.etapaAtualCRM)));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Clientes</CardTitle>
          <Button onClick={onAddNewClient}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
        <CardDescription>Gerencie seus leads e clientes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Buscar por nome, email, empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-1"
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
          <Select value={filterOrigin} onValueChange={(value) => setFilterOrigin(value as ClientOrigin | 'todos')}>
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="Filtrar por Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Origens</SelectItem>
              {uniqueOrigins.map(origin => (
                <SelectItem key={origin} value={origin}>{getOriginText(origin)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStage} onValueChange={(value) => setFilterStage(value as string | 'todos')}>
            <SelectTrigger className="md:col-span-1">
              <SelectValue placeholder="Filtrar por Etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Etapas</SelectItem>
              {uniqueStages.map(stage => (
                <SelectItem key={stage} value={stage}>{getStageName(stage)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum cliente encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Empresa</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="hidden sm:table-cell">Etapa CRM</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Valor Negociado</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Sentimento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.nome}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block">{client.email}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{client.telefone}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{client.empresa || '-'}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {getOriginText(client.origem, client.origemDetalhes)}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={client.etapaAtualCRM.includes('fechado') ? (client.etapaAtualCRM.includes('ganho') ? 'success' : 'destructive') : 'secondary'}>
                            {getStageName(client.etapaAtualCRM)}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      {client.valorTotalNegociado > 0 ? 
                        `R$ ${client.valorTotalNegociado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                        {getSentimentIcon(client.sentimentoIA)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onViewDetails(client.id)} title="Ver Detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditRequest(client)} title="Editar Cliente">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteClient(client.id)} title="Excluir Cliente">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          Mostrando {filteredClients.length} de {clients.length} clientes.
        </div>
        {/* TODO: Add pagination if many clients */} 
      </CardFooter>
    </Card>
  );
};

export default ClientListComponent;