/**
 * Helper para extrair parâmetros de rota de forma segura no Next.js 15
 * @param params Objeto de parâmetros que pode ser uma Promise
 * @returns Parâmetros resolvidos
 */
export async function getRouteParams<T>(params: T | Promise<T>): Promise<T> {
    if (params instanceof Promise) {
      return await params
    }
    return params
  }
  