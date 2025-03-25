import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.senha) {
          console.log("Credenciais incompletas")
          return null
        }

        try {
          // Garantir que estamos conectados ao banco de dados
          console.log(
            "Conectando ao banco de dados:",
            process.env.MONGODB_URI?.split("@")[1]?.split("/")[0] || "desconhecido",
          )
          await connectToDatabase()

          console.log("Buscando usuário com email:", credentials.email)
          // Aumentar o timeout da operação de busca
          const usuario = await Usuario.findOne({ email: credentials.email }).maxTimeMS(30000)

          if (!usuario) {
            console.log("Usuário não encontrado")
            return null
          }

          console.log("Verificando senha")

          // Verificar se a senha fornecida é um hash bcrypt
          const isBcryptHash = credentials.senha.startsWith("$2b$") || credentials.senha.startsWith("$2a$")

          let senhaValida = false

          if (isBcryptHash) {
            // Se for um hash, comparar diretamente
            console.log("Senha fornecida é um hash bcrypt, comparando diretamente")
            senhaValida = credentials.senha === usuario.senha
          } else {
            // Se não for um hash, usar o método normal
            console.log("Senha fornecida não é um hash, usando bcrypt.compare")
            senhaValida = await usuario.comparePassword(credentials.senha)
          }

          if (!senhaValida) {
            console.log("Senha inválida")
            return null
          }

          console.log("Login bem-sucedido para:", usuario.email)
          // Atualizar último login
          usuario.ultimoLogin = new Date()
          await usuario.save()

          // Garantir que todos os campos tenham valores padrão
          const userName = usuario.nome || usuario.email.split("@")[0]

          return {
            id: usuario._id.toString(),
            name: userName,
            email: usuario.email,
            nome: usuario.nome || userName,
            cargo: usuario.cargo || "user",
            permissoes: usuario.permissoes || [],
            plano: usuario.plano || "gratuito",
            role: usuario.cargo === "admin" ? "admin" : "user",
          }
        } catch (error) {
          console.error("Erro durante a autenticação:", error)

          // Verificar se é um erro de timeout e tentar reconectar
          if (error instanceof mongoose.Error && error.message.includes("buffering timed out")) {
            console.log("Tentando reconectar ao MongoDB após timeout...")

            // Forçar reconexão na próxima tentativa
            mongoose.connection.close()
          }

          throw new Error("Erro durante a autenticação: " + (error as Error).message)
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name || ""
        token.nome = user.nome || ""
        token.cargo = user.cargo || ""
        token.permissoes = user.permissoes || []
        token.plano = user.plano || "gratuito"
        token.role = user.role || "user"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = (token.name as string) || ""
        session.user.nome = (token.nome as string) || ""
        session.user.cargo = (token.cargo as string) || ""
        session.user.permissoes = (token.permissoes as string[]) || []
        session.user.plano = (token.plano as string) || "gratuito"
        session.user.role = (token.role as string) || "user"
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

