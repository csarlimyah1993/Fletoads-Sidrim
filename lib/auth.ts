import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null
        }

        try {
          // Garantir que estamos conectados ao banco de dados
          await connectToDatabase()

          const usuario = await Usuario.findOne({ email: credentials.email }).maxTimeMS(20000)

          if (!usuario) {
            return null
          }

          const senhaValida = await usuario.comparePassword(credentials.senha)

          if (!senhaValida) {
            return null
          }

          // Atualizar último login
          usuario.ultimoLogin = new Date()
          await usuario.save()

          return {
            id: usuario._id.toString(),
            email: usuario.email,
            nome: usuario.nome,
            cargo: usuario.cargo,
            permissoes: usuario.permissoes,
          }
        } catch (error) {
          console.error("Erro durante a autenticação:", error)
          throw new Error("Erro durante a autenticação")
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
        token.nome = user.nome
        token.cargo = user.cargo
        token.permissoes = user.permissoes
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.nome = token.nome as string
        session.user.cargo = token.cargo as string
        session.user.permissoes = token.permissoes as string[]
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

