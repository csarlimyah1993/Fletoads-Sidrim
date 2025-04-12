import bcrypt from "bcryptjs"

/**
 * Verifica se uma senha está em formato hash bcrypt
 * @param password - A senha para verificar
 * @returns boolean indicando se a senha está em formato hash
 */
export function isPasswordHashed(password: string): boolean {
  return password.startsWith("$2a$") || password.startsWith("$2b$")
}

/**
 * Gera um hash bcrypt para uma senha
 * @param password - A senha em texto plano
 * @returns O hash bcrypt da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

/**
 * Compara uma senha em texto plano com um hash bcrypt
 * @param plainPassword - A senha em texto plano
 * @param hashedPassword - O hash bcrypt da senha
 * @returns boolean indicando se a senha corresponde ao hash
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Valida a força de uma senha
 * @param password - A senha para validar
 * @returns Um objeto com o resultado da validação e uma mensagem opcional
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "A senha deve ter pelo menos 8 caracteres" }
  }

  // Verificar se tem pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra maiúscula" }
  }

  // Verificar se tem pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos uma letra minúscula" }
  }

  // Verificar se tem pelo menos um número
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "A senha deve conter pelo menos um número" }
  }

  return { valid: true }
}
