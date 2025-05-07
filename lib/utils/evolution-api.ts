import fetch from "node-fetch"
import { ENV, checkRequiredEnvVars } from "../env-config"

/**
 * Função utilitária para buscar informações das instâncias na Evolution API.
 * Utiliza as variáveis de ambiente EVOLUTION_API_BASE_URL e EVOLUTION_API_KEY.
 * @param instanceName Nome da instância (opcional, se não informado busca todas)
 * @returns Dados da instância ou erro
 */
export async function fetchInstances(instanceName?: string) {
  const { isValid, errorMessage } = checkRequiredEnvVars(["EVOLUTION_API_BASE_URL", "EVOLUTION_API_KEY"])
  if (!isValid) {
    throw new Error(errorMessage)
  }
  const baseUrl = ENV.EVOLUTION_API_BASE_URL
  const apiKey = ENV.EVOLUTION_API_KEY
  const url = instanceName
    ? `${baseUrl}/instance/fetchInstances/${encodeURIComponent(instanceName)}`
    : `${baseUrl}/instance/fetchInstances`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": apiKey,
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    let errorBody = await response.text()
    throw new Error(`Erro EvolutionAPI: ${response.status} - ${errorBody}`)
  }
  return await response.json()
}

/**
 * Função utilitária para criar uma nova instância na Evolution API.
 * Utiliza as variáveis de ambiente EVOLUTION_API_BASE_URL e EVOLUTION_API_KEY.
 * @param instanceData Dados necessários para criar a instância
 * @returns Dados da instância criada ou erro
 */
export async function createInstance(instanceData: Record<string, any>) {
  const { isValid, errorMessage } = checkRequiredEnvVars(["EVOLUTION_API_BASE_URL", "EVOLUTION_API_KEY"])
  if (!isValid) {
    throw new Error(errorMessage)
  }
  const baseUrl = ENV.EVOLUTION_API_BASE_URL
  const apiKey = ENV.EVOLUTION_API_KEY
  const url = `${baseUrl}/instance/create`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "apikey": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(instanceData)
  })
  if (!response.ok) {
    let errorBody = await response.text()
    throw new Error(`Erro EvolutionAPI: ${response.status} - ${errorBody}`)
  }
  return await response.json()
}

/**
 * Função utilitária para conectar uma instância e obter o QR code em base64.
 * Utiliza as variáveis de ambiente EVOLUTION_API_BASE_URL e EVOLUTION_API_KEY.
 * @param instanceName Nome da instância para conectar
 * @param withQrCode Se true, retorna o QR code em base64
 * @returns Dados da conexão incluindo QR code em base64 se solicitado
 */
export async function connectInstance(instanceName: string, number: string) {
  const { isValid, errorMessage } = checkRequiredEnvVars(["EVOLUTION_API_BASE_URL", "EVOLUTION_API_KEY"])
  if (!isValid) {
    throw new Error(errorMessage)
  }
  const baseUrl = ENV.EVOLUTION_API_BASE_URL
  const apiKey = ENV.EVOLUTION_API_KEY
  const url = `${baseUrl}/instance/connect/${encodeURIComponent(instanceName)}`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ number:  number})
  })
  if (!response.ok) {
    let errorBody = await response.text()
    throw new Error(`Erro EvolutionAPI: ${response.status} - ${errorBody}`)
  }
  return await response.json()
}

/**
 * Função utilitária para verificar o status de uma instância.
 * Utiliza as variáveis de ambiente EVOLUTION_API_BASE_URL e EVOLUTION_API_KEY.
 * @param instanceName Nome da instância para verificar
 * @returns Status da instância
 */
export async function checkInstanceStatus(instanceName: string) {
  const { isValid, errorMessage } = checkRequiredEnvVars(["EVOLUTION_API_BASE_URL", "EVOLUTION_API_KEY"])
  if (!isValid) {
    throw new Error(errorMessage)
  }
  const baseUrl = ENV.EVOLUTION_API_BASE_URL
  const apiKey = ENV.EVOLUTION_API_KEY
  const url = `${baseUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": apiKey,
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    let errorBody = await response.text()
    throw new Error(`Erro EvolutionAPI: ${response.status} - ${errorBody}`)
  }
  return await response.json()
}