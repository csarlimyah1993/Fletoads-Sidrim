// d:\Workspace\Fleto-v10\Fletoads-Sidrim\components\crm\crm-page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ClientListComponent from './client-list';
import ClientDetailComponent from './client-detail';
import ClientFormComponent from './client-form';
import { Client } from './types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast'; // Assuming you have a toast component

type CrmView = 'list' | 'detail' | 'form';

const CrmPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<CrmView>('list');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API interactions
  const api = {
    getClients: async (): Promise<Client[]> => {
      // console.log('API: Fetching clients from /api/crm/clients');
      const response = await fetch('/api/crm/clients');
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to fetch clients:', response.status, errorData);
        throw new Error(`Falha ao buscar clientes: ${response.status}`);
      }
      return response.json();
    },
    getClientById: async (id: string): Promise<Client | null> => {
      // console.log(`API: Fetching client ${id} from /api/crm/clients/${id}`);
      const response = await fetch(`/api/crm/clients/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        const errorData = await response.text();
        console.error('Failed to fetch client:', response.status, errorData);
        throw new Error(`Falha ao buscar cliente: ${response.status}`);
      }
      return response.json();
    },
    saveClient: async (clientData: Client): Promise<Client> => {
      // console.log('API: Saving client...', clientData);
      const isUpdating = !!clientData.id; // Simple check, assumes ID exists for updates
      const method = isUpdating ? 'PUT' : 'POST';
      const url = isUpdating ? `/api/crm/clients/${clientData.id}` : '/api/crm/clients';
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
          const errorData = await response.json(); // Assuming error response is JSON
          console.error('Failed to save client:', response.status, errorData);
          throw new Error(errorData.message || `Falha ao salvar cliente: ${response.status}`);
      }
      return response.json();
    },
    deleteClient: async (id: string): Promise<void> => {
        // console.log(`API: Deleting client ${id} from /api/crm/clients/${id}`);
        const response = await fetch(`/api/crm/clients/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.text();
          console.error('Failed to delete client:', response.status, errorData);
          throw new Error(`Falha ao excluir cliente: ${response.status}`);
        }
    }
  };

  const fetchAndSetClients = async () => {
    setIsLoading(true);
    try {
      const fetchedClients = await api.getClients();
      setClients(fetchedClients);
    } catch (error) {
      console.error("Failed to fetch clients for CrmPage:", error);
      toast({
        title: 'Erro ao Carregar Clientes',
        description: (error as Error).message || 'Não foi possível buscar os clientes.',
        variant: 'destructive',
      });
      setClients([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentView === 'list') {
      fetchAndSetClients();
    }
  }, [currentView]);

  // Mock API interactions - can be removed if the above `api` object is fully functional
  const mockApi = {
    getClients: async (): Promise<Client[]> => {
      console.log('API: Fetching clients...');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, this would come from localStorage or a backend
      const storedClients = localStorage.getItem('crm_clients');
      return storedClients ? JSON.parse(storedClients) : [];
    },
    getClientById: async (id: string): Promise<Client | null> => {
      console.log(`API: Fetching client ${id}...`);
      await new Promise(resolve => setTimeout(resolve, 300));
      const clients = await mockApi.getClients();
      return clients.find(c => c.id === id) || null;
    },
    saveClient: async (clientData: Client): Promise<Client> => {
      console.log('API: Saving client...', clientData);
      await new Promise(resolve => setTimeout(resolve, 700));
      let clients = await mockApi.getClients();
      const existingClientIndex = clients.findIndex(c => c.id === clientData.id);
      if (existingClientIndex > -1) {
        clients[existingClientIndex] = clientData;
      } else {
        clients.push(clientData);
      }
      localStorage.setItem('crm_clients', JSON.stringify(clients));
      return clientData;
    },
    deleteClient: async (id: string): Promise<void> => {
        console.log(`API: Deleting client ${id}...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        let clients = await mockApi.getClients();
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem('crm_clients', JSON.stringify(clients));
    }
  };

  const handleViewDetails = (clientId: string) => {
    setSelectedClientId(clientId);
    setCurrentView('detail');
  };

  const handleAddNewClient = () => {
    setEditingClient(null);
    setCurrentView('form');
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setCurrentView('form');
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
    setEditingClient(null);
    setCurrentView('list');
  };

  const handleSaveClient = async (clientData: Client) => {
    try {
      await api.saveClient(clientData);
      toast({
        title: 'Cliente Salvo!',
        description: `O cliente ${clientData.nome} foi salvo com sucesso.`,
        variant: 'default',
      });
      // fetchAndSetClients(); // Refresh data after save, then go back
      handleBackToList(); 
    } catch (error) {
      console.error('Failed to save client:', error);
      toast({
        title: 'Erro ao Salvar',
        description: (error as Error).message || 'Não foi possível salvar o cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteClient = async (clientId: string) => {
    try {
        await api.deleteClient(clientId);
        toast({
            title: 'Cliente Excluído!',
            description: 'O cliente foi excluído com sucesso.',
        });
        if (selectedClientId === clientId) {
            handleBackToList(); // Go back to list if current detail view was deleted
        } else {
            fetchAndSetClients(); // Otherwise, just refresh the list
        }
    } catch (error) {
        console.error('Failed to delete client:', error);
        toast({
            title: 'Erro ao Excluir',
            description: (error as Error).message || 'Não foi possível excluir o cliente.',
            variant: 'destructive',
        });
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'list':
        if (isLoading) {
          return <div className="p-4 text-center">Carregando clientes...</div>;
        }
        return (
          <ClientListComponent
            clients={clients}
            onAddNewClient={handleAddNewClient}
            onViewDetails={handleViewDetails}
            onEditRequest={handleEditClient} 
            onDeleteClient={handleDeleteClient}
            refreshClients={fetchAndSetClients}
          />
        );
      case 'detail':
        if (!selectedClientId) {
          setCurrentView('list'); 
          return null;
        }
        return (
          <ClientDetailComponent
            clientId={selectedClientId}
            onBack={handleBackToList}
            onEdit={handleEditClient}
            // getClientById={api.getClientById} // Optionally pass API functions
          />
        );
      case 'form':
        return (
          <ClientFormComponent 
            client={editingClient} 
            onSave={handleSaveClient} 
            onCancel={handleBackToList} 
          />
        );
      default:
        return <p>Visualização desconhecida</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* 
        This is a basic structure. 
        You might want a more sophisticated layout, navigation, or header here.
      */}
      {renderView()}
    </div>
  );
};

export default CrmPage;