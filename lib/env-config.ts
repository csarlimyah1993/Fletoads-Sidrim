/**
 * Módulo centralizado para gerenciar variáveis de ambiente
 * Este arquivo garante que as variáveis de ambiente sejam carregadas corretamente
 * em todos os contextos da aplicação (cliente e servidor)
 */

// Valores padrão para as variáveis de ambiente da Evolution API
const EVOLUTION_API_DEFAULT_URL = "https://fletoapi.robotizze.us";

// Exporta as variáveis de ambiente com fallbacks para valores padrão
export const ENV = {
  // Evolution API
  EVOLUTION_API_BASE_URL: process.env.EVOLUTION_API_BASE_URL || EVOLUTION_API_DEFAULT_URL,
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || "804cf9339575d965841dd30ef7e07282",
  
  // Adicione outras variáveis de ambiente conforme necessário
};

// Log para debug das variáveis carregadas
console.log('ENV carregado:', {
  EVOLUTION_API_BASE_URL: ENV.EVOLUTION_API_BASE_URL,
  EVOLUTION_API_KEY: ENV.EVOLUTION_API_KEY ? '[DEFINIDO]' : '[NÃO DEFINIDO]'
});

/**
 * Verifica se as variáveis de ambiente obrigatórias estão definidas
 * @param requiredVars Lista de nomes das variáveis obrigatórias
 * @returns Um objeto com o status da verificação e mensagens de erro, se houver
 */
export function checkRequiredEnvVars(requiredVars: string[]) {
  const missingVars: string[] = [];
  
  // Verifica se as variáveis de ambiente estão carregadas no processo
  console.log('Verificando variáveis de ambiente:', requiredVars);
  console.log('EVOLUTION_API_BASE_URL:', process.env.EVOLUTION_API_BASE_URL);
  console.log('EVOLUTION_API_KEY:', process.env.EVOLUTION_API_KEY ? '[DEFINIDO]' : '[NÃO DEFINIDO]');
  
  requiredVars.forEach(varName => {
    // @ts-ignore - Acesso dinâmico às propriedades
    const value = ENV[varName];
    if (value === undefined || value === null || value === '') {
      missingVars.push(varName);
    }
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars,
    errorMessage: missingVars.length > 0 
      ? `Variáveis de ambiente obrigatórias não definidas: ${missingVars.join(", ")}` 
      : ""
  };
}