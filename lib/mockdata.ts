// Mock de usuários para autenticação
export const mockUsers = [
    {
      id: 1,
      name: "Admin",
      email: "admin@fletoads.com",
      password: "admin123",
      role: "admin",
    },
    {
      id: 2,
      name: "Lojista Demo",
      email: "demo@fletoads.com",
      password: "demo123",
      role: "lojista",
    },
    {
      id: 3,
      name: "Teste",
      email: "teste@fletoads.com",
      password: "teste123",
      role: "lojista",
    },
  ]
  
  // Mock de dados para o dashboard
  export const mockDashboardData = {
    // Dados de vendas
    sales: {
      today: 1250,
      yesterday: 980,
      thisWeek: 5430,
      lastWeek: 4980,
      thisMonth: 18750,
      lastMonth: 16890,
    },
  
    // Dados de clientes
    customers: {
      total: 1842,
      new: 124,
      returning: 876,
      active: 1245,
    },
  
    // Dados de produtos
    products: {
      total: 156,
      outOfStock: 12,
      lowStock: 24,
      featured: 32,
    },
  
    // Dados de panfletos
    panfletos: {
      total: 48,
      active: 32,
      views: 12450,
      clicks: 3240,
    },
  }
  
  // Mock de dados para gráficos
  export const mockChartData = {
    salesByMonth: [
      { month: "Jan", value: 12500 },
      { month: "Fev", value: 14200 },
      { month: "Mar", value: 15800 },
      { month: "Abr", value: 13600 },
      { month: "Mai", value: 16200 },
      { month: "Jun", value: 18500 },
      { month: "Jul", value: 17800 },
      { month: "Ago", value: 19200 },
      { month: "Set", value: 20100 },
      { month: "Out", value: 18750 },
      { month: "Nov", value: 0 },
      { month: "Dez", value: 0 },
    ],
  
    customersBySource: [
      { source: "Orgânico", value: 45 },
      { source: "Redes Sociais", value: 30 },
      { source: "Panfletos", value: 15 },
      { source: "Outros", value: 10 },
    ],
  }
  
  