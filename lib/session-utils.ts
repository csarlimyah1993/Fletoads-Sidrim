/**
 * Helper function to extract user data from session regardless of structure
 */
export function getUserFromSession(session: any): any {
    if (!session) return null
  
    // Handle the nested structure we're seeing in the diagnostic
    if (session.session?.user) {
      return session.session.user
    }
  
    // Handle standard structure
    if (session.user) {
      return session.user
    }
  
    return null
  }
  
  /**
   * Helper function to check if user is authenticated
   */
  export function isAuthenticated(status: string, session: any): boolean {
    if (status === "authenticated") return true
    if (session?.authenticated) return true
    if (session?.session?.user) return true
    if (session?.user) return true
    return false
  }
  
  /**
   * Helper function to check if user has a specific role
   */
  export function hasRole(session: any, role: string): boolean {
    const user = getUserFromSession(session)
    return user?.role === role
  }
  
  /**
   * Helper function to check if user has a specific tipo
   */
  export function hasTipoUsuario(session: any, tipo: string): boolean {
    const user = getUserFromSession(session)
    return user?.tipoUsuario === tipo
  }
  