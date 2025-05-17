// d:\Workspace\Fleto-v10\Fletoads-Sidrim\app\dashboard\crm\page.tsx
"use client";

import React from 'react';
import CrmPage from '@/components/crm/crm-page'; // Ajuste o caminho se necessário
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

export default function DashboardCrmPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Você pode adicionar um cabeçalho específico para a página do CRM aqui, se desejar */}
      {/* Ex: <h1 className="text-2xl font-bold p-4">Gestão de Relacionamento com o Cliente</h1> */}
      <CrmPage />
      <Toaster /> {/* Adicione o Toaster aqui para que os toasts funcionem nesta página */}
    </div>
  );
}