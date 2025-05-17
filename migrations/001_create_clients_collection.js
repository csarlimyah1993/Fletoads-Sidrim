// Migração para criar a coleção 'clients' e definir índices básicos

// Conectar ao banco de dados (substitua 'seu_banco_de_dados' pelo nome real do seu banco)
db = db.getSiblingDB('seu_banco_de_dados');

// Criar a coleção 'clients' se ela não existir
db.createCollection('clients', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nome', 'dataCriacao', 'ultimaAtualizacao', 'etapaAtualCRM'],
      properties: {
        nome: {
          bsonType: 'string',
          description: 'Nome completo do cliente (obrigatório).'
        },
        email: {
          bsonType: 'string',
          description: 'Endereço de e-mail do cliente (opcional, mas único se fornecido).'
        },
        telefone: {
          bsonType: 'string',
          description: 'Número de telefone do cliente (opcional).'
        },
        empresa: {
          bsonType: 'string',
          description: 'Nome da empresa do cliente (opcional).'
        },
        dataCriacao: {
          bsonType: 'date',
          description: 'Data de criação do registro do cliente (obrigatório).'
        },
        ultimaAtualizacao: {
          bsonType: 'date',
          description: 'Data da última atualização do registro do cliente (obrigatório).'
        },
        origem: {
          bsonType: 'string',
          enum: ['whatsapp', 'instagram', 'site', 'feira', 'indicacao', 'outro'],
          description: 'Origem do cliente (ex: whatsapp, instagram, etc.).'
        },
        origemDetalhes: {
          bsonType: 'string',
          description: 'Detalhes adicionais se a origem for "outro".'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Lista de tags associadas ao cliente.'
        },
        sentimentoIA: {
          bsonType: 'string',
          enum: ['positivo', 'negativo', 'neutro', 'nao_analisado'],
          description: 'Sentimento do cliente analisado por IA.'
        },
        historicoSentimento: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['data', 'sentimento'],
            properties: {
              data: { bsonType: 'date', description: 'Data da análise de sentimento.' },
              sentimento: { bsonType: 'string', enum: ['positivo', 'negativo', 'neutro'], description: 'Sentimento registrado.' },
              nota: { bsonType: 'string', description: 'Nota ou contexto da análise.' }
            }
          },
          description: 'Histórico de análises de sentimento.'
        },
        interessesProdutos: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['nome'],
            properties: {
              id: { bsonType: 'string', description: 'ID do produto/serviço de interesse.' },
              nome: { bsonType: 'string', description: 'Nome do produto/serviço.' },
              valorEstimado: { bsonType: 'double', description: 'Valor estimado do interesse.' },
              notas: { bsonType: 'string', description: 'Notas sobre o interesse.' }
            }
          },
          description: 'Lista de produtos/serviços de interesse do cliente.'
        },
        etapaAtualCRM: {
          bsonType: 'string',
          description: 'ID da etapa atual do cliente no funil de CRM (obrigatório).'
          // Ex: 'lead', 'contato-inicial', 'qualificacao', 'proposta-enviada', 'negociacao', 'fechado-ganho', 'fechado-perdido'
        },
        historicoEtapasCRM: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['etapaId', 'dataEntrada'],
            properties: {
              etapaId: { bsonType: 'string', description: 'ID da etapa do CRM.' },
              nomeEtapa: { bsonType: 'string', description: 'Nome da etapa do CRM.' }, // Denormalizado para facilitar consultas
              dataEntrada: { bsonType: 'date', description: 'Data de entrada na etapa.' },
              dataSaida: { bsonType: 'date', description: 'Data de saída da etapa (opcional).' },
              valorNegociadoNaEtapa: { bsonType: 'double', description: 'Valor negociado ao entrar nesta etapa.' }
            }
          },
          description: 'Histórico de movimentação do cliente pelas etapas do CRM.'
        },
        valorTotalNegociado: {
          bsonType: 'double',
          description: 'Valor total negociado com o cliente.'
        },
        responsavelId: {
          bsonType: 'string', // Ou ObjectId se referenciar outra coleção
          description: 'ID do usuário responsável pelo cliente.'
        },
        notasGerais: {
          bsonType: 'string',
          description: 'Notas gerais sobre o cliente.'
        },
        whatsappMessages: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              messageId: { bsonType: 'string', description: 'ID da mensagem no WhatsApp.' },
              sender: { bsonType: 'string', description: 'Remetente da mensagem (cliente ou agente).' },
              content: { bsonType: 'string', description: 'Conteúdo da mensagem.' },
              timestamp: { bsonType: 'date', description: 'Data e hora da mensagem.' },
              status: { bsonType: 'string', description: 'Status da mensagem (enviada, entregue, lida).' }
            }
          },
          description: 'Histórico de mensagens do WhatsApp com o cliente.'
        },
        interactions: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['tipo', 'conteudo', 'data'],
            properties: {
              id: { bsonType: 'string', description: 'ID da interação.'},
              tipo: { bsonType: 'string', enum: ['chat', 'email', 'ligacao', 'nota', 'whatsapp_message'], description: 'Tipo de interação.'},
              conteudo: { bsonType: 'string', description: 'Conteúdo ou resumo da interação.'},
              data: { bsonType: 'date', description: 'Data da interação.'},
              sentimentoAnalisado: { bsonType: 'string', enum: ['positivo', 'negativo', 'neutro', 'nao_analisado'], description: 'Sentimento analisado da interação.'}
            }
          },
          description: 'Registro de interações com o cliente.'
        }
      }
    }
  }
});

// Criar índices para otimizar consultas comuns
print('Criando índices para a coleção clients...');
db.clients.createIndex({ email: 1 }, { unique: true, sparse: true }); // Índice único para email, ignorando documentos sem email
db.clients.createIndex({ telefone: 1 });
db.clients.createIndex({ nome: 1 });
db.clients.createIndex({ etapaAtualCRM: 1 });
db.clients.createIndex({ dataCriacao: -1 });
db.clients.createIndex({ tags: 1 });
db.clients.createIndex({ responsavelId: 1 });

print('Coleção clients e índices criados com sucesso.');

// Adicionar um log de migração (opcional, mas recomendado)
// db.migrations_log.insertOne({
//   script: '001_create_clients_collection.js',
//   executedAt: new Date(),
//   status: 'success'
// });

// Exemplo de como executar este script no MongoDB Shell:
// mongo seu_banco_de_dados --username seu_usuario --password sua_senha 001_create_clients_collection.js