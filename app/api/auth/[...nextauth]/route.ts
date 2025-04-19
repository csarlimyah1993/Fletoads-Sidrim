// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth" // Importar do arquivo de configuração

// Usar as configurações do arquivo auth-config.ts
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }