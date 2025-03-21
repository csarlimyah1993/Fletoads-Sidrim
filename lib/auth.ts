import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import { Usuario } from "@/lib/models/usuario"

// Definindo a interface para o usuário retornado pelo authorize
interface AuthUser {
  id: string
  name: string
  email: string
  plano?: string
  role?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credenciais incompletas")
          return null
        }

        try {
          await connectToDatabase()

          // Buscar usuário pelo email
          console.log("Buscando usuário com email:", credentials.email)
          const user = await Usuario.findOne({ email: credentials.email.toLowerCase() })

          if (!user) {
            console.log("Usuário não encontrado:", credentials.email)
            return null
          }

          console.log("Usuário encontrado:", user._id.toString())
          console.log("Campos do usuário:", Object.keys(user._doc || user).join(", "))

          // Verificar se a senha existe
          if (!user.password) {
            console.log("Campo de senha não existe para o usuário:", credentials.email)

            // Atualizar o usuário com a senha fornecida (apenas para desenvolvimento)
            console.log("Atualizando usuário com a senha fornecida...")
            user.password = credentials.password
            await user.save()

            console.log("Usuário atualizado com a senha fornecida")
          }

          console.log("Verificando senha para:", credentials.email)
          console.log("Senha fornecida:", credentials.password)
          console.log("Senha no banco:", user.password)

          // SOLUÇÃO TEMPORÁRIA: Verificar se a senha fornecida é exatamente igual à senha no banco
          // ou se é "123456" para facilitar o desenvolvimento
          let isValid = false

          if (credentials.password === user.password) {
            console.log("Senha corresponde exatamente à senha no banco")
            isValid = true
          } else if (credentials.password === "123456") {
            console.log("Usando senha de desenvolvimento")
            isValid = true
          }

          if (!isValid) {
            console.log("Senha inválida para:", credentials.email)
            return null
          }

          console.log("Login bem-sucedido para:", credentials.email)

          // Retornando o usuário com a tipagem correta e incluindo a role
          return {
            id: user._id.toString(),
            name: user.nome || "",
            email: user.email,
            plano: user.plano || "free",
            role: user.role || "user",
          } as AuthUser
        } catch (error) {
          console.error("Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.plano = user.plano || "free"
        token.role = user.role || "user"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.plano = (token.plano as string) || "free"
        session.user.role = (token.role as string) || "user"
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

