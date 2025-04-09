import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"

// Função simples para comparar senhas (substitui bcrypt)
const comparePasswords = (plainPassword: string, storedPassword: string): boolean => {
  // Se a senha armazenada parece ser um hash, não podemos compará-la diretamente
  if (storedPassword.startsWith("$2")) {
    console.warn("Senha em formato bcrypt detectada, mas bcrypt não está disponível")
    return false
  }

  // Comparação direta para senhas em texto plano
  return plainPassword === storedPassword
}

export const nextAuthConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios")
        }

        const { db } = await connectToDatabase()

        // Verificar as coleções disponíveis
        const collections = await db.listCollections().toArray()
        const collectionNames = collections.map((c) => c.name)

        // Determinar qual coleção usar para usuários
        let usuariosCollection = "usuarios"
        if (!collectionNames.includes("usuarios") && collectionNames.includes("users")) {
          usuariosCollection = "users"
        }

        // Buscar o usuário pelo email (case insensitive)
        const user = await db.collection(usuariosCollection).findOne({
          email: { $regex: new RegExp(`^${credentials.email}$`, "i") },
        })

        if (!user) {
          console.log(`Usuário não encontrado: ${credentials.email}`)
          throw new Error("Email ou senha incorretos")
        }

        // Verificar se o campo de senha existe
        const senhaField = user.senha || user.password
        if (!senhaField) {
          console.log("Usuário não possui campo de senha")
          throw new Error("Configuração de usuário inválida")
        }

        // Verificar a senha
        const isValidPassword = comparePasswords(credentials.password, senhaField)

        if (!isValidPassword) {
          throw new Error("Email ou senha incorretos")
        }

        return {
          id: user._id.toString(),
          name: user.nome || user.name || "",
          email: user.email,
          role: user.cargo || user.role || "user",
          permissoes: user.permissoes || [],
          plano: user.plano || "",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.nome = user.name
        token.cargo = user.role
        token.permissoes = user.permissoes
        token.plano = user.plano || ""
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.nome = token.nome
        session.user.cargo = token.cargo
        session.user.permissoes = token.permissoes
        session.user.plano = token.plano
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
  debug: process.env.NODE_ENV === "development",
}
