// d:\Workspace\Fleto-v10\Fletoads-Sidrim\components\crm\types.ts

/**
 * Define a origem de um lead/cliente.
 * - whatsapp: Cliente veio do WhatsApp.
 * - instagram: Cliente veio do Instagram.
 * - site: Cliente veio através do site (formulário de contato, etc.).
 * - feira: Cliente captado em uma feira ou evento.
 * - indicacao: Cliente veio por indicação.
 * - outro: Outra origem não listada (requer descrição).
 */
export type ClientOrigin = 
  | "whatsapp"
  | "instagram"
  | "site"
  | "feira"
  | "indicacao"
  | "outro";

/**
 * Define o sentimento do cliente, analisado por IA.
 * - positivo: Cliente demonstra satisfação, interesse.
 * - neutro: Cliente não demonstra emoção clara ou está informativo.
 * - negativo: Cliente demonstra insatisfação, frustração.
 * - nao_analisado: Sentimento ainda não foi analisado.
 */
export type ClientSentiment = "positivo" | "neutro" | "negativo" | "nao_analisado";

/**
 * Representa o interesse de um cliente em um produto ou serviço específico.
 */
export interface ProductInterest {
  id: string; // ID do produto/serviço
  nome: string; // Nome do produto/serviço
  valorEstimado?: number; // Valor estimado do interesse neste produto
  notas?: string; // Anotações sobre o interesse específico
}

/**
 * Representa uma etapa no funil de vendas do CRM.
 */
/**
 * Representa uma mensagem do WhatsApp.
 */
export interface WhatsappMessage {
  id: string; // ID da mensagem
  sender: 'client' | 'agent'; // Quem enviou a mensagem
  content: string; // Conteúdo da mensagem
  timestamp: string; // Data e hora da mensagem
  status?: 'sent' | 'delivered' | 'read'; // Status da mensagem (opcional)
}

export interface CrmStage {
  id: string; // ID da etapa (ex: 'lead', 'proposta-enviada', 'negociacao', 'fechado-ganho', 'fechado-perdido')
  nome: string; // Nome da etapa (ex: "Lead Qualificado", "Proposta Enviada")
  valorNegociado: number; // Valor total negociado nesta etapa para este cliente
  ordem: number; // Ordem da etapa no funil
}

/**
 * Representa um cliente no CRM.
 */
export interface Client {
  id: string; // ID único do cliente
  nome: string; // Nome completo do cliente
  email?: string;
  telefone?: string;
  empresa?: string;
  dataCriacao: string; // Data de criação do registro do cliente (ISO string)
  ultimaAtualizacao: string; // Data da última atualização (ISO string)
  
  origem: ClientOrigin; // De onde o cliente veio
  origemDetalhes?: string; // Detalhes adicionais se a origem for 'outro'
  
  tags?: string[]; // Tags personalizadas para segmentação
  
  sentimentoIA?: ClientSentiment; // Sentimento do cliente baseado em IA
  historicoSentimento?: { data: string; sentimento: ClientSentiment; nota?: string }[]; // Histórico de sentimentos

  interessesProdutos?: ProductInterest[]; // Lista de produtos/serviços de interesse
  
  etapaAtualCRM: string; // ID da etapa atual do CRM em que o cliente se encontra
  historicoEtapasCRM?: CrmStage[]; // Histórico de etapas pelas quais o cliente passou
  valorTotalNegociado: number; // Soma dos valores negociados em todas as etapas ativas

  responsavelId?: string; // ID do usuário responsável pelo cliente
  notasGerais?: string; // Anotações gerais sobre o cliente
  interactions?: ClientInteraction[]; // Adicionado para armazenar interações do cliente
  whatsappMessages?: WhatsappMessage[]; // Histórico de conversas do WhatsApp
}

/**
 * Representa uma interação (conversa, email, ligação) com o cliente.
 * Usado para análise de sentimento.
 */
export interface ClientInteraction {
  id: string;
  clientId: string;
  data: string; // Data da interação (ISO string)
  tipo: "chat" | "email" | "ligacao" | "nota";
  conteudo: string; // Conteúdo da conversa/interação
  sentimentoAnalisado?: ClientSentiment;
}