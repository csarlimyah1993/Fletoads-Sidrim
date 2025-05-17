// d:\Workspace\Fleto-v10\Fletoads-Sidrim\app\dashboard\pan-ia\page.tsx
"use client";

import React from 'react';
import CrmPage from '@/components/crm/crm-page'; // Ajuste o caminho se o CrmPage estiver em outro local
import { Toaster } from '@/components/ui/toaster';

export default function PanIaCrmPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Você pode adicionar um cabeçalho específico para a página Pan IA CRM aqui, se desejar */}
      {/* Ex: <h1 className="text-2xl font-bold p-4">CRM na Pan IA</h1> */}
      <CrmPage />
      <Toaster /> {/* Adicione o Toaster para que os toasts funcionem nesta página */}
    </div>
  );
}