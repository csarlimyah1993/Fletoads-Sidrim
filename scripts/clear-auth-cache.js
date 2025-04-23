// Este script pode ser executado no console do navegador para limpar completamente o cache de autenticação

function clearAuthCache() {
    console.log("Iniciando limpeza do cache de autenticação...")
  
    // 1. Limpar todos os cookies relacionados à autenticação
    const cookiesToClear = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
      "next-auth.csrf-token",
      "__Secure-next-auth.csrf-token",
      "__Host-next-auth.csrf-token",
    ]
  
    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      console.log(`Cookie ${cookieName} removido`)
    })
  
    // 2. Limpar todos os cookies
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=")
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
      console.log(`Cookie ${name} removido`)
    })
  
    // 3. Limpar localStorage e sessionStorage
    try {
      const authKeysInLocalStorage = Object.keys(localStorage).filter(
        (key) => key.includes("auth") || key.includes("token") || key.includes("session"),
      )
  
      authKeysInLocalStorage.forEach((key) => {
        localStorage.removeItem(key)
        console.log(`LocalStorage item ${key} removido`)
      })
  
      localStorage.removeItem("next-auth.session-token")
      localStorage.removeItem("next-auth.callback-url")
      localStorage.removeItem("next-auth.csrf-token")
  
      sessionStorage.clear()
      console.log("SessionStorage limpo")
    } catch (e) {
      console.error("Erro ao limpar storage:", e)
    }
  
    console.log("Limpeza do cache de autenticação concluída!")
    console.log("Recarregue a página para aplicar as alterações.")
  }
  
  // Executar a função
  clearAuthCache()
