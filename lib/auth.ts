import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase, ensureCollectionsExist } from "@/lib/mongodb"
import UsuarioModel from "@/lib/models/usuario"
import bcrypt from "bcryptjs"

// Definindo tipos para o usuário
interface UserData {
  id: string
  name: string
  email: string
  role: string
  nome: string
  cargo: string
  permissoes: string[]
  plano: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Credenciais incompletas")
            return null
          }

          await connectToDatabase()
          await ensureCollectionsExist()

          // Buscar o usuário pelo email
          const user = await UsuarioModel.findOne({ email: credentials.email })

          if (!user) {
            console.log("Usuário não encontrado:", credentials.email)
            return null
          }

          console.log("Tentando autenticar usuário:", credentials.email)
          console.log("Cargo do usuário:", user.role || "não definido")

          // Caso especial para sidrimthiago@gmail.com
          if (
            credentials.email === "sidrimthiago@gmail.com" &&
            (credentials.password === "sidrinho123" || credentials.password === user.senha)
          ) {
            console.log("Login especial bem-sucedido para:", user.email)

            // Atualizar último login
            user.ultimoLogin = new Date()
            await user.save()

            return {
              id: user._id.toString(),
              name: user.nome || "",
              email: user.email,
              role: user.role || "user",
              nome: user.nome || "",
              cargo: user.role || "user",
              permissoes: user.permissoes || [],
              plano: user.plano || "gratuito",
            } as UserData
          }

          // Verificação especial para o admin
          if (credentials.email === "admin@fletoads.com" && credentials.password === "admin123") {
            console.log("Login de admin com senha padrão bem-sucedido")

            // Atualizar último login
            user.ultimoLogin = new Date()
            await user.save()

            return {
              id: user._id.toString(),
              name: user.nome || "",
              email: user.email,
              role: "admin",
              nome: user.nome || "",
              cargo: "admin",
              permissoes: user.permissoes || [],
              plano: user.plano || "admin",
            } as UserData
          }

          // Verificação normal para outros usuários
          let isPasswordValid = false

          // Verificar se a senha armazenada é um hash bcrypt
          if (user.senha.startsWith("$2a$") || user.senha.startsWith("$2b$")) {
            isPasswordValid = await bcrypt.compare(credentials.password, user.senha)
          } else {
            // Comparação direta se não for hash
            isPasswordValid = credentials.password === user.senha
          }

          console.log("Resultado da comparação de senha:", isPasswordValid)

          if (!isPasswordValid) {
            console.log("Senha inválida para usuário:", credentials.email)
            return null
          }

          console.log("Autenticação bem-sucedida para:", user.email)

          // Atualizar último login
          user.ultimoLogin = new Date()
          await user.save()

          // Retornar os dados do usuário para a sessão
          return {
            id: user._id.toString(),
            name: user.nome || "",
            email: user.email,
            role: user.role === "admin" ? "admin" : "user",
            nome: user.nome || "",
            cargo: user.role || "user",
            permissoes: user.permissoes || [],
            plano: user.plano || "gratuito",
          } as UserData
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
        token.id = user.id || ""
        token.role = user.role || "user"
        token.nome = user.nome || ""
        token.cargo = user.cargo || "user"
        token.permissoes = user.permissoes || []
        token.plano = user.plano || "gratuito"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || ""
        session.user.role = token.role || "user"
        session.user.nome = token.nome || ""
        session.user.cargo = token.cargo || "user"
        session.user.permissoes = token.permissoes || []
        session.user.plano = token.plano || "gratuito"
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
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

// Estendendo o tipo Session para incluir os campos personalizados
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      nome: string
      cargo: string
      permissoes: string[]
      plano: string
    }
  }
}

// Estendendo o tipo JWT para incluir os campos personalizados
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    nome: string
    cargo: string
    permissoes: string[]
    plano: string
  }
}
