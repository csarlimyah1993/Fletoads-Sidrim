// This is a simplified model for the Usuario (User) entity
// In a real application, this would be connected to your database

export interface IUsuario {
  _id: string
  nome: string
  email: string
  plano?: {
    nome: string
    limites: {
      panfletos: number | null
      produtos: number | null
      integracoes: number | null
      armazenamento: number | null
      layouts: number | null
      widgets: number | null
      promocoes: number | null
      imagensPorProduto: number | null
      contasWhatsapp: number | null
      tourVirtual: boolean
      animacoes: boolean
      personalizacaoFontes: boolean
    }
  }
}

// Mock implementation for the Usuario model
const Usuario = {
  findById: async (id: string): Promise<IUsuario> => {
    // In a real app, this would query the database
    // For now, we'll return a mock user
    return {
      _id: id,
      nome: "Usuário Teste",
      email: "teste@example.com",
      plano: {
        nome: "Básico",
        limites: {
          panfletos: 30,
          produtos: 0, // No web showcase in Basic plan
          integracoes: 1,
          armazenamento: 1000,
          layouts: 4,
          widgets: 5,
          promocoes: 10,
          imagensPorProduto: 3,
          contasWhatsapp: 1,
          tourVirtual: false,
          animacoes: false,
          personalizacaoFontes: true,
        },
      },
    }
  },
}

export { Usuario }
export default Usuario
